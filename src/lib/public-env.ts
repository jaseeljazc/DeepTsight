/*
 * Public configuration, safe to import from client components.
 * Next.js inlines NEXT_PUBLIC_* values at build time only for full dot-notation reads, so each
 * variable is read here exactly once, written out in full. Server code also reads them from here.
 */

/** Cloudflare's documented always-pass test site key. Development and preview only. */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

export const appEnv = process.env.NEXT_PUBLIC_ENV ?? "development";

/** True only for the live site. NODE_ENV is not used: every `next build` sets it to production. */
export const isProductionSite = appEnv === "production";

export const publicEnv = {
  /** Canonical origin, without a trailing slash. Required in production (scripts/check-env.ts). */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
  /** Empty in production when unset, so the form cannot fall back to the always-pass key. */
  turnstileSiteKey:
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (isProductionSite ? "" : TURNSTILE_TEST_SITE_KEY),
  analyticsDomain: process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN || undefined,
};
