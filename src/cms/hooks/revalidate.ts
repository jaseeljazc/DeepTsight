import type { PayloadRequest, RequestContext } from "payload";

/*
 * On-demand revalidation (docs/cms/02_CONTENT_MODEL.md, tag map). A change in the CMS marks the
 * cached reads that used it as stale, so the next visit to an affected page renders fresh content.
 * `{ expire: 0 }`: nobody is served the old version once a change is saved (editors expect to see
 * a publish straight away).
 *
 * Skipped when `context.disableRevalidate` is set (import, scripts). Outside a Next.js request
 * (scripts, tests) revalidateTag throws; that is caught and ignored.
 */

export const DISABLE_REVALIDATE = "disableRevalidate";

export function shouldRevalidate(context: RequestContext | undefined): boolean {
  return context?.[DISABLE_REVALIDATE] !== true;
}

export async function revalidateTags(tags: Iterable<string>, req?: PayloadRequest): Promise<void> {
  const unique = [...new Set(tags)].filter((tag) => tag.length > 0 && tag.length <= 256);
  if (unique.length === 0) return;
  try {
    const { revalidateTag } = await import("next/cache");
    for (const tag of unique) revalidateTag(tag, { expire: 0 });
  } catch (error) {
    req?.payload.logger.debug(
      `Revalidation skipped (${error instanceof Error ? error.name : "UnknownError"}): ${unique.join(", ")}`,
    );
  }
}
