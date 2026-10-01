/*
 * Which environment variables the live site cannot run without (SEC-10, ARCHITECTURE.md §9).
 * Shared by src/lib/env.ts (runtime) and scripts/check-env.ts (fails the build). Reports
 * variable names only, never values.
 */

export const REQUIRED_IN_PRODUCTION = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "RESEND_API_KEY",
  "ENQUIRY_TO_EMAIL",
  "ENQUIRY_FROM_EMAIL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
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

  const siteUrl = source["NEXT_PUBLIC_SITE_URL"];
  if (siteUrl && !siteUrl.startsWith("https://")) {
    problems.push("NEXT_PUBLIC_SITE_URL must use https");
  }

  return problems;
}
