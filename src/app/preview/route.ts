import type { NextRequest } from "next/server";
import { previewGet } from "@/cms/preview";

/** Turns on draft preview for an MFA-verified CMS admin (src/cms/preview.ts). */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return previewGet(request);
}
