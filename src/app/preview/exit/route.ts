import type { NextRequest } from "next/server";
import { previewExitGet } from "@/cms/preview";

/** Turns draft preview off (src/cms/preview.ts). */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return previewExitGet(request);
}
