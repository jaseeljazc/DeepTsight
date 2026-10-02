import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

// The dev server needs eval for React Refresh. Production builds never get it.
const isDev = process.env.NODE_ENV === "development";

/*
 * Scripts keep 'unsafe-inline' because Next.js writes inline scripts into every statically
 * rendered page, and a per-request nonce would make every route dynamic (ARCHITECTURE.md §1).
 * Owner-approved exception to SEC-06, recorded in the TASKS.md decisions log (2026-10-01).
 * Revisit with the CMS admin, which needs its own policy.
 */
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://challenges.cloudflare.com",
  "https://plausible.io",
].join(" ");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "object-src 'none'",
      "frame-src https://challenges.cloudflare.com",
      "connect-src 'self' https://challenges.cloudflare.com https://plausible.io",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

/*
 * CMS admin (/admin) and its API (/api): a stricter policy with no third-party origins, never
 * cached, never indexed (docs/cms/03_SECURITY_AND_OPS.md §1, §6). The rule sources do not overlap
 * with the public rule above.
 */
const adminCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const adminHeaders = [
  ...securityHeaders.filter((header) => header.key !== "Content-Security-Policy"),
  { key: "Content-Security-Policy", value: adminCsp },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  experimental: {
    // Two root layouts (public site and CMS admin): unmatched URLs render app/global-not-found.tsx.
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Local images only: the static site's files and, in CMS mode, Payload's media route.
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/badges/**" },
      { pathname: "/dither/**" },
      { pathname: "/api/media/file/**" },
    ],
  },
  async headers() {
    return [
      {
        // Public pages only. The CMS admin (/admin) and its API (/api) get their own policy.
        source: "/((?!admin(?:/|$)|api(?:/|$)).*)",
        headers: securityHeaders,
      },
      { source: "/admin/:path*", headers: adminHeaders },
      { source: "/api/:path*", headers: adminHeaders },
    ];
  },
};

/**
 * withPayload adds colour-scheme client hint headers (Accept-CH, Vary, Critical-CH) to every route.
 * They are only useful to the admin UI, so they are scoped to /admin and public responses keep
 * exactly the headers above (D-16).
 */
function scopePayloadHeaders(config: NextConfig): NextConfig {
  const headers = config.headers;
  if (!headers) return config;
  return {
    ...config,
    async headers() {
      const rules = await headers();
      return rules.map((rule) =>
        rule.source === "/:path*" && rule.headers.some((header) => header.key === "Accept-CH")
          ? { ...rule, source: "/admin/:path*" }
          : rule,
      );
    },
  };
}

export default scopePayloadHeaders(withPayload(nextConfig, { devBundleServerPackages: false }));
