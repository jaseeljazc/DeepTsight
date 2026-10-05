import { changedPaths, getPath } from "./doc-paths";
import type { ImageView, SpotCard, SpotInstance } from "./types";

type Doc = Record<string, unknown>;

export interface CardContext {
  latest: Doc;
  published: Doc | null;
  media: Map<number, ImageView>;
  publishedMedia: Map<number, ImageView>;
  adminHref: string;
}

/** The id of the image at a path, whether the document holds an id or a populated record. */
export function mediaIdAt(doc: Doc | null, path: string): number | null {
  const value = getPath(doc, path);
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && typeof (value as Doc)["id"] === "number") {
    return (value as Doc)["id"] as number;
  }
  return null;
}

/**
 * A credential has an image to track when its badge is set in the latest draft or in the published
 * copy. A badge cleared only in a draft is still served by the live site until that is published.
 */
export function hasBadgeInEitherCopy(latest: Doc | null, published: Doc | null): boolean {
  return [latest, published].some((doc) => {
    const badge = getPath(doc, "badge");
    return badge !== null && badge !== undefined;
  });
}

export function buildCard(spot: SpotInstance, ctx: CardContext): SpotCard {
  const latestId = mediaIdAt(ctx.latest, spot.path);
  const publishedId = mediaIdAt(ctx.published, spot.path);
  const image = latestId === null ? null : (ctx.media.get(latestId) ?? null);
  const publishedImage =
    publishedId === null ? null : (ctx.publishedMedia.get(publishedId) ?? null);

  const focalPending =
    image !== null &&
    publishedImage !== null &&
    image.id === publishedImage.id &&
    (image.focalX !== publishedImage.focalX || image.focalY !== publishedImage.focalY);

  const otherChanges = ctx.published
    ? changedPaths(ctx.published, ctx.latest).filter((path) => path !== spot.path)
    : [];

  return {
    ...spot,
    adminHref: ctx.adminHref,
    image,
    pending: ctx.published === null || latestId !== publishedId,
    focalPending,
    otherChanges,
    sharedWith: [],
  };
}

/** Status in words, never colour alone. */
export function cardStatus(card: SpotCard): { tone: "ok" | "warn" | "info"; text: string }[] {
  const out: { tone: "ok" | "warn" | "info"; text: string }[] = [];
  if (!card.image) {
    out.push({
      tone: "warn",
      text: card.required
        ? "No image — the page shows a placeholder"
        : "No image — nothing is shown for this",
    });
  } else if (card.image.approved) {
    out.push({ tone: "ok", text: "Approved for public use" });
  } else {
    out.push({ tone: "warn", text: "Not approved — hidden on the live site" });
  }
  if (card.pending) out.push({ tone: "info", text: "Draft change waiting" });
  if (card.focalPending) out.push({ tone: "info", text: "Focal point change waiting" });
  return out;
}

export function needsAttention(card: SpotCard): boolean {
  if (card.pending || card.focalPending) return true;
  if (!card.image) return card.required;
  return !card.image.approved;
}
