/* Plain links on purpose: sign-in state changes, so every move is a full page load. */
/* eslint-disable @next/next/no-html-link-for-pages */
import * as React from "react";
import type { AdminViewServerProps } from "payload";
import { hasPasswordSession, hasValidMfa, rolesOf } from "../access";
import { decryptSecret } from "../mfa/crypto";
import { otpauthUri } from "../mfa/totp";
import { QrCode } from "./qr-code";

/*
 * The second-factor screen at /admin/mfa. Payload sends any signed-in user who may not use the
 * admin here (it replaces the "unauthorized" view), so a password alone never reaches content.
 * Plain HTML forms posting to /api/users/mfa/*; no client code.
 */

const ISSUER = "DeepTsight CMS";

const ERRORS: Record<string, string> = {
  code: "That code did not work. Check that the time on your phone is correct, then try the newest code.",
  rate: "Too many attempts. Wait five minutes, then try again.",
};

const box: React.CSSProperties = { maxWidth: "32rem", display: "grid", gap: "1rem" };
const input: React.CSSProperties = {
  font: "inherit",
  fontSize: "1.25rem",
  letterSpacing: "0.2em",
  padding: "0.6rem 0.75rem",
  minHeight: "44px",
  width: "100%",
};
const button: React.CSSProperties = { font: "inherit", minHeight: "44px", padding: "0 1.25rem" };

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={box}>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

function ErrorMessage({ code }: { code: string | undefined }) {
  const message = code ? ERRORS[code] : undefined;
  if (!message) return null;
  return (
    <p id="mfa-error" role="alert">
      {message}
    </p>
  );
}

function CodeField({ label, hasError, hint }: { label: string; hasError: boolean; hint?: string }) {
  return (
    <div style={{ display: "grid", gap: "0.4rem" }}>
      <label htmlFor="mfa-code">{label}</label>
      {hint && <p id="mfa-hint">{hint}</p>}
      <input
        id="mfa-code"
        name="code"
        required
        autoComplete="one-time-code"
        aria-invalid={hasError || undefined}
        aria-describedby={
          [hint ? "mfa-hint" : "", hasError ? "mfa-error" : ""].filter(Boolean).join(" ") ||
          undefined
        }
        style={input}
      />
    </div>
  );
}

export async function MfaView({ initPageResult, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult;
  const errorCode = typeof searchParams?.["error"] === "string" ? searchParams["error"] : undefined;

  if (!hasPasswordSession(req)) {
    return (
      <Shell title="Sign in first">
        <p>
          <a href="/admin/login">Go to the sign-in page</a>
        </p>
      </Shell>
    );
  }

  if (hasValidMfa(req)) {
    return (
      <Shell title={rolesOf(req).length > 0 ? "You are verified" : "No access"}>
        <p>
          {rolesOf(req).length > 0
            ? "Your second factor is verified for this session."
            : "This account has no role. Ask the site developer to add one."}
        </p>
        <p>
          <a href="/admin">Continue to the CMS</a>
        </p>
      </Shell>
    );
  }

  const user = req.user as { id: number | string; email?: string } | null;
  const doc = user
    ? ((await req.payload.findByID({
        collection: "users",
        id: user.id,
        depth: 0,
        overrideAccess: true,
        showHiddenFields: true,
        req,
      })) as { email?: string; totpSecret?: string | null; pendingTotpSecret?: string | null })
    : null;

  if (doc?.totpSecret) {
    return (
      <Shell title="Enter your authenticator code">
        <p>Open your authenticator app and enter the six-digit code for {ISSUER}.</p>
        <ErrorMessage code={errorCode} />
        <form method="post" action="/api/users/mfa/verify" style={{ display: "grid", gap: "1rem" }}>
          <CodeField
            label="Authenticator code"
            hasError={Boolean(errorCode)}
            hint="Lost your phone? Enter one of your recovery codes instead."
          />
          <input type="hidden" name="next" value="/admin" />
          <div>
            <button type="submit" style={button}>
              Verify
            </button>
          </div>
        </form>
        <p>
          <a href="/admin/logout">Sign out</a>
        </p>
      </Shell>
    );
  }

  if (doc?.pendingTotpSecret) {
    const secret = decryptSecret(doc.pendingTotpSecret);
    const uri = otpauthUri(secret, doc.email ?? "account", ISSUER);
    const grouped = secret.match(/.{1,4}/g)?.join(" ") ?? secret;
    return (
      <Shell title="Set up your authenticator app">
        <ol style={{ display: "grid", gap: "0.75rem", paddingLeft: "1.25rem" }}>
          <li>In your authenticator app, add an account and scan this code.</li>
          <li>
            <QrCode text={uri} label="QR code for your authenticator app" />
          </li>
          <li>
            If you cannot scan it, enter this key by hand (time-based, 6 digits):{" "}
            <code style={{ fontSize: "1.125rem", wordBreak: "break-all" }}>{grouped}</code>
          </li>
          <li>Enter the six-digit code the app shows.</li>
        </ol>
        <ErrorMessage code={errorCode} />
        <form method="post" action="/api/users/mfa/enrol" style={{ display: "grid", gap: "1rem" }}>
          <CodeField label="Six-digit code" hasError={Boolean(errorCode)} />
          <div>
            <button type="submit" style={button}>
              Confirm and continue
            </button>
          </div>
        </form>
      </Shell>
    );
  }

  return (
    <Shell title="Set up two-step sign-in">
      <p>
        The CMS needs a code from an authenticator app (for example Microsoft Authenticator or
        Google Authenticator) every time you sign in.
      </p>
      <form method="post" action="/api/users/mfa/start">
        <button type="submit" style={button}>
          Start setup
        </button>
      </form>
      <p>
        <a href="/admin/logout">Sign out</a>
      </p>
    </Shell>
  );
}
