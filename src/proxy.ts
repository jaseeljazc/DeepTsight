import { NextResponse, type NextRequest } from "next/server";

/*
 * Fail-closed gate for the CMS (docs/cms/03_SECURITY_AND_OPS.md §3). On the live site
 * (NEXT_PUBLIC_ENV=production) the admin and its API answer 404 until the owner sets
 * CMS_ADMIN_ENABLED=true, which they do only after the CMS test suite (pnpm test:cms, including the
 * MFA tests) has passed against a real database. Outside production the gate is open.
 * Runs only on /admin, /api and /preview; public pages never pass through it.
 */
export function proxy(request: NextRequest) {
  const production = process.env.NEXT_PUBLIC_ENV === "production";
  const enabled = process.env["CMS_ADMIN_ENABLED"] === "true";
  if (production && !enabled) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*", "/preview", "/preview/:path*"],
};
