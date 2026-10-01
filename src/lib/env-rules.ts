/*
 * Which environment variables the live site cannot run without (SEC-10, ARCHITECTURE.md §9).
 * Shared by src/lib/env.ts (runtime) and scripts/check-env.ts (fails the build). Reports
 * variable names only, never values.
 */

/** Needed by the CMS (Payload). Required on the live site and whenever CONTENT_SOURCE=cms. */
export const CMS_REQUIRED = ["DATABASE_URI", "PAYLOAD_SECRET", "MFA_ENCRYPTION_KEY"] as const;

export const CONTENT_SOURCES = ["static", "cms"] as const;
export type ContentSource = (typeof CONTENT_SOURCES)[number];

/** Where the public site reads content from. Defaults to the static source files (D-02). */
export function contentSourceOf(source: Record<string, string | undefined>): ContentSource {
  const value = source["CONTENT_SOURCE"]?.trim() || "static";
  return (CONTENT_SOURCES as readonly string[]).includes(value)
    ? (value as ContentSource)
    : "static";
}

const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * Format rules for the CMS variables, applied whenever a variable is set. Required ones are
 * checked when CONTENT_SOURCE=cms or on the live site. Problems name variables, never values.
 */
export function cmsEnvProblems(
  source: Record<string, string | undefined>,
  { production }: { production: boolean },
): string[] {
  const problems: string[] = [];
  const contentSource = source["CONTENT_SOURCE"]?.trim();
  if (contentSource && !(CONTENT_SOURCES as readonly string[]).includes(contentSource)) {
    problems.push("CONTENT_SOURCE must be static or cms");
  }

  if (production || contentSourceOf(source) === "cms") {
    for (const name of CMS_REQUIRED) {
      if (!source[name]?.trim()) problems.push(`${name} is not set`);
    }
  }

  for (const name of ["DATABASE_URI", "DATABASE_URI_TEST", "DATABASE_URI_RESTORE"] as const) {
    const value = source[name]?.trim();
    if (!value) continue;
    if (!/^postgres(ql)?:\/\//.test(value)) {
      problems.push(`${name} must start with postgres:// or postgresql://`);
      continue;
    }
    if (production && name !== "DATABASE_URI") {
      problems.push(`${name} is for development and tests only`);
    }
    if (production && name === "DATABASE_URI") {
      // D-03: the live database is reached over TLS unless it runs on the same host.
      let host = "";
      let sslmode = "";
      try {
        const url = new URL(value);
        host = url.hostname;
        sslmode = url.searchParams.get("sslmode") ?? "";
      } catch {
        problems.push("DATABASE_URI is not a valid URL");
        continue;
      }
      if (!LOCAL_DB_HOSTS.has(host) && sslmode !== "require" && sslmode !== "verify-full") {
        problems.push("DATABASE_URI must use sslmode=require or sslmode=verify-full");
      }
    }
  }

  const secret = source["PAYLOAD_SECRET"]?.trim();
  if (secret && secret.length < 32) problems.push("PAYLOAD_SECRET must be at least 32 characters");

  const mfaKey = source["MFA_ENCRYPTION_KEY"]?.trim();
  if (mfaKey && !isBase64Key(mfaKey, 32)) {
    problems.push("MFA_ENCRYPTION_KEY must be 32 bytes, base64 encoded");
  }

  return problems;
}

function isBase64Key(value: string, bytes: number): boolean {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
  return Buffer.from(value, "base64").length === bytes;
}

export const REQUIRED_IN_PRODUCTION = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "RESEND_API_KEY",
  "ENQUIRY_TO_EMAIL",
  "ENQUIRY_FROM_EMAIL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  ...CMS_REQUIRED,
] as const;

/** Cloudflare test keys start with this. They always pass, so they must never reach production. */
const TURNSTILE_TEST_PREFIX = "1x0000000000";

export function productionEnvProblems(source: Record<string, string | undefined>): string[] {
  const problems: string[] = [];

  for (const name of REQUIRED_IN_PRODUCTION) {
    if (!source[name]?.trim()) problems.push(`${name} is not set`);
  }

  for (const name of ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] as const) {
    if (source[name]?.startsWith(TURNSTILE_TEST_PREFIX)) {
      problems.push(`${name} is a Cloudflare test key`);
    }
  }

  for (const problem of cmsEnvProblems(source, { production: true })) {
    if (!problems.includes(problem)) problems.push(problem);
  }

  const siteUrl = source["NEXT_PUBLIC_SITE_URL"];
  if (siteUrl && !siteUrl.startsWith("https://")) {
    problems.push("NEXT_PUBLIC_SITE_URL must use https");
  }

  return problems;
}
