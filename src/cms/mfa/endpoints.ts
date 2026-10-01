import type { Endpoint, PayloadRequest } from "payload";
import { publicEnv } from "../../lib/public-env";
import { checkRateLimit } from "../../lib/rate-limit";
import { hasPasswordSession, sessionIdOf } from "../access";
import { writeAudit } from "../hooks/audit";
import { createMfaCookieValue, MFA_LIFETIME_SECONDS, serializeMfaCookie } from "./cookie";
import {
  decryptSecret,
  encryptSecret,
  findRecoveryCode,
  generateRecoveryCodes,
  hashRecoveryCode,
} from "./crypto";
import { generateTotpSecret, verifyTotp } from "./totp";

/*
 * Second-factor endpoints under /api/users/mfa/* (docs/cms/03_SECURITY_AND_OPS.md §3). They take
 * plain form posts from the MFA screen at /admin/mfa and answer with redirects, so the screen works
 * without client-side code. Error details go in a short query code, never in a message with data.
 */

export const MFA_VIEW_PATH = "/admin/mfa";
const VERIFY_LIMIT = 5;
const VERIFY_WINDOW_SECONDS = 5 * 60;

interface MfaUserDoc {
  id: number | string;
  email?: string | null;
  totpSecret?: string | null;
  pendingTotpSecret?: string | null;
  totpLastStep?: number | null;
  recoveryCodeHashes?: unknown;
}

function redirect(location: string, extraHeaders: Record<string, string> = {}): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: location, "Cache-Control": "no-store", ...extraHeaders },
  });
}

function mfaCookieHeader(userId: number | string, sessionId: string): string {
  const { value } = createMfaCookieValue(userId, sessionId);
  return serializeMfaCookie(value, MFA_LIFETIME_SECONDS, publicEnv.siteUrl.startsWith("https://"));
}

/** Reads the posted form once (a request body can only be read once). Values are trimmed and capped. */
async function readForm(req: PayloadRequest): Promise<(name: string) => string> {
  let form: FormData | undefined;
  try {
    form = await req.formData?.();
  } catch {
    form = undefined;
  }
  return (name) => {
    const value = form?.get(name);
    return typeof value === "string" ? value.trim().slice(0, 64) : "";
  };
}

/** Only redirect back into the admin, never to another site. */
function safeNext(next: string): string {
  return /^\/admin(\/[A-Za-z0-9/_-]*)?$/.test(next) ? next : "/admin";
}

async function loadUser(req: PayloadRequest): Promise<MfaUserDoc | null> {
  const user = req.user as { id: number | string } | null;
  if (!user) return null;
  return (await req.payload.findByID({
    collection: "users",
    id: user.id,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
    req,
  })) as MfaUserDoc;
}

async function updateUser(req: PayloadRequest, id: number | string, data: Record<string, unknown>) {
  await req.payload.update({
    collection: "users",
    id,
    data,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
    req,
  });
}

async function withinLimit(req: PayloadRequest, userId: number | string): Promise<boolean> {
  return checkRateLimit("cms-mfa", String(userId), VERIFY_LIMIT, VERIFY_WINDOW_SECONDS);
}

function storedHashes(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/** Step 1 of enrolment: create a pending secret (encrypted) and show it on the MFA screen. */
const start: Endpoint = {
  path: "/mfa/start",
  method: "post",
  handler: async (req) => {
    if (!hasPasswordSession(req)) return redirect("/admin/login");
    const doc = await loadUser(req);
    if (!doc) return redirect("/admin/login");
    if (doc.totpSecret) return redirect(MFA_VIEW_PATH);
    if (!doc.pendingTotpSecret) {
      await updateUser(req, doc.id, { pendingTotpSecret: encryptSecret(generateTotpSecret()) });
    }
    return redirect(MFA_VIEW_PATH);
  },
};

/** Step 2 of enrolment: a valid first code confirms the authenticator app. */
const enrol: Endpoint = {
  path: "/mfa/enrol",
  method: "post",
  handler: async (req) => {
    const sessionId = sessionIdOf(req);
    if (!hasPasswordSession(req) || !sessionId) return redirect("/admin/login");
    const doc = await loadUser(req);
    if (!doc) return redirect("/admin/login");
    if (doc.totpSecret || !doc.pendingTotpSecret) return redirect(MFA_VIEW_PATH);
    if (!(await withinLimit(req, doc.id))) return redirect(`${MFA_VIEW_PATH}?error=rate`);

    const field = await readForm(req);
    const secret = decryptSecret(doc.pendingTotpSecret);
    const step = verifyTotp(secret, field("code"));
    if (step === null) {
      await writeAudit(req, { action: "mfa-failed", targetCollection: "users", docId: doc.id });
      return redirect(`${MFA_VIEW_PATH}?error=code`);
    }

    const codes = generateRecoveryCodes();
    await updateUser(req, doc.id, {
      totpSecret: doc.pendingTotpSecret,
      pendingTotpSecret: null,
      totpLastStep: step,
      recoveryCodeHashes: codes.map(hashRecoveryCode),
      mfaEnrolledAt: new Date().toISOString(),
    });
    await writeAudit(req, { action: "mfa-enrolled", targetCollection: "users", docId: doc.id });
    return recoveryCodesPage(codes, mfaCookieHeader(doc.id, sessionId));
  },
};

/** Every sign-in: a TOTP code or one unused recovery code. */
const verify: Endpoint = {
  path: "/mfa/verify",
  method: "post",
  handler: async (req) => {
    const sessionId = sessionIdOf(req);
    if (!hasPasswordSession(req) || !sessionId) return redirect("/admin/login");
    const doc = await loadUser(req);
    if (!doc) return redirect("/admin/login");
    if (!doc.totpSecret) return redirect(MFA_VIEW_PATH);
    if (!(await withinLimit(req, doc.id))) return redirect(`${MFA_VIEW_PATH}?error=rate`);

    const field = await readForm(req);
    const code = field("code");
    const next = safeNext(field("next"));
    const step = verifyTotp(decryptSecret(doc.totpSecret), code, {
      lastUsedStep: doc.totpLastStep ?? -1,
    });
    if (step !== null) {
      await updateUser(req, doc.id, { totpLastStep: step });
      await writeAudit(req, { action: "mfa-verified", targetCollection: "users", docId: doc.id });
      return redirect(next, { "Set-Cookie": mfaCookieHeader(doc.id, sessionId) });
    }

    const hashes = storedHashes(doc.recoveryCodeHashes);
    const index = code.length > 6 ? findRecoveryCode(code, hashes) : -1;
    if (index >= 0) {
      await updateUser(req, doc.id, {
        recoveryCodeHashes: hashes.filter((_, position) => position !== index),
      });
      await writeAudit(req, {
        action: "recovery-code-used",
        targetCollection: "users",
        docId: doc.id,
        to: `${hashes.length - 1} left`,
      });
      return redirect(next, { "Set-Cookie": mfaCookieHeader(doc.id, sessionId) });
    }

    await writeAudit(req, { action: "mfa-failed", targetCollection: "users", docId: doc.id });
    return redirect(`${MFA_VIEW_PATH}?error=code`);
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** Shown once, straight after enrolment. The codes are not stored anywhere in readable form. */
function recoveryCodesPage(codes: string[], setCookie: string): Response {
  const items = codes.map((code) => `<li><code>${escapeHtml(code)}</code></li>`).join("");
  const html = `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Recovery codes | DeepTsight CMS</title>
<style>body{max-width:40rem;margin:3rem auto;padding:0 1rem;line-height:1.5}
code{font-size:1.125rem}li{margin:.25rem 0}a{display:inline-block;margin-top:1.5rem;padding:.75rem 1rem;border:1px solid currentColor}</style>
</head><body><main>
<h1>Save your recovery codes</h1>
<p>Your authenticator app is set up. If you lose it, each of these codes signs you in once.
Store them somewhere safe, away from this computer. They will not be shown again.</p>
<ol>${items}</ol>
<a href="/admin">Continue to the CMS</a>
</main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": setCookie,
    },
  });
}

export const mfaEndpoints: Endpoint[] = [start, enrol, verify];
