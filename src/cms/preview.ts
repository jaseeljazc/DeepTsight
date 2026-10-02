import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { getPayload, type PayloadRequest } from "payload";
import config from "@payload-config";
import { hasPasswordSession, isAdmin } from "./access";
import { safePreviewPath } from "./preview-url";

/*
 * Draft preview (Phase 7). /preview?path=/services/x turns on Next's draft mode and redirects to an
 * internal page, which then renders the latest drafts. Only an MFA-verified admin can turn it on;
 * anyone can turn it off with /preview/exit.
 */

/** Relative redirect: the Location never depends on the Host header. */
function redirectTo(path: string): Response {
  return new Response(null, {
    status: 307,
    headers: { Location: path, "Cache-Control": "no-store" },
  });
}

export async function previewGet(request: NextRequest): Promise<Response> {
  const path = safePreviewPath(request.nextUrl.searchParams.get("path"));
  if (!path) return new Response("Invalid preview address.", { status: 400 });

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  const req = { user, headers: request.headers } as unknown as Pick<
    PayloadRequest,
    "user" | "headers"
  >;
  if (!isAdmin(req)) {
    // Signed in with a password only: finish the second factor first. Not signed in: sign in.
    return redirectTo(hasPasswordSession(req) ? "/admin/mfa" : "/admin/login");
  }

  (await draftMode()).enable();
  return redirectTo(path);
}

export async function previewExitGet(request: NextRequest): Promise<Response> {
  (await draftMode()).disable();
  return redirectTo(safePreviewPath(request.nextUrl.searchParams.get("path")) ?? "/");
}
