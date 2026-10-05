import type { Doc } from "./local-api";
import { isRegisteredPath } from "./spots";
import type { OwnerRef } from "./types";

/*
 * Runtime checks for the Images page actions. A server action receives whatever the browser sends;
 * its TypeScript types are not enforced at runtime. Every action parses its arguments with these
 * functions before it touches the database, and refuses anything they reject.
 */

const GLOBAL_SLUGS = ["home", "about", "pages", "seo"] as const;
const COLLECTION_SLUGS = ["services", "credentials"] as const;

type GlobalSlug = (typeof GLOBAL_SLUGS)[number];
type CollectionSlug = (typeof COLLECTION_SLUGS)[number];

const isGlobalSlug = (value: unknown): value is GlobalSlug =>
  typeof value === "string" && (GLOBAL_SLUGS as readonly string[]).includes(value);
const isCollectionSlug = (value: unknown): value is CollectionSlug =>
  typeof value === "string" && (COLLECTION_SLUGS as readonly string[]).includes(value);

/** Own property only: never read a value from the prototype chain. */
function own(value: object, key: string): unknown {
  return Object.hasOwn(value, key) ? (value as Record<string, unknown>)[key] : undefined;
}

/** A positive integer record id, or null. */
export function parseId(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : null;
}

/** A focal-point coordinate from 0 to 100, or null. */
export function parsePercent(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : null;
}

/** Only the boolean `true` confirms. */
export function isConfirmed(value: unknown): boolean {
  return value === true;
}

/** An owner from the allow-list, rebuilt as a fresh object, or null. */
export function parseOwner(value: unknown): OwnerRef | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const kind = own(value, "kind");
  const slug = own(value, "slug");
  if (kind === "global") return isGlobalSlug(slug) ? { kind, slug } : null;
  if (kind === "collection") {
    const id = parseId(own(value, "id"));
    return isCollectionSlug(slug) && id !== null ? { kind, slug, id } : null;
  }
  return null;
}

/** A path the registry declares for this owner, or null. */
export function parseSpotPath(owner: OwnerRef, value: unknown): string | null {
  return typeof value === "string" && isRegisteredPath(owner, value) ? value : null;
}

/**
 * Spot ids are "<global>:<path>" or "<collection>:<id>:<path>" (registry paths contain no colon).
 * Returns null for anything that does not decode to a registered spot.
 */
export function decodeSpotId(spotId: unknown): { owner: OwnerRef; path: string } | null {
  if (typeof spotId !== "string") return null;
  const parts = spotId.split(":");
  let owner: OwnerRef | null = null;
  if (parts.length === 2) {
    owner = parseOwner({ kind: "global", slug: parts[0] });
  } else if (parts.length === 3) {
    const raw = parts[1] ?? "";
    const id = /^[1-9][0-9]*$/.test(raw) ? Number(raw) : Number.NaN;
    owner = parseOwner({ kind: "collection", slug: parts[0], id });
  }
  if (!owner) return null;
  const path = parseSpotPath(owner, parts[parts.length - 1]);
  return path === null ? null : { owner, path };
}

/** The credential badge is the only spot that takes issuer badges. */
export function isBadgeSpot(owner: OwnerRef, path: string): boolean {
  return owner.kind === "collection" && owner.slug === "credentials" && path === "badge";
}

/** An uploaded image (not a reserved slot) with a file. */
export function isImageRecord(media: Doc | null): boolean {
  if (!media) return false;
  const filename = media["filename"];
  return media["kind"] !== "slot" && typeof filename === "string" && filename.length > 0;
}

/** Why this media record cannot go in this spot, in plain words; null when it can. */
export function imageProblemFor(media: Doc | null, owner: OwnerRef, path: string): string | null {
  if (!media) return "That image was not found.";
  if (!isImageRecord(media)) return "That record has no image file yet. Upload a file first.";
  const badge = media["assetClass"] === "issuer-badge";
  if (isBadgeSpot(owner, path) && !badge)
    return "A credential badge must be an issuer badge image.";
  if (!isBadgeSpot(owner, path) && badge)
    return "An issuer badge can only be used as a credential badge.";
  return null;
}

/*
 * Keys never sent back on a save: fields Payload sets itself, and the approval flags. These
 * actions never change an approval; leaving the flags out means Payload keeps the stored values.
 */
const NOT_WRITTEN = [
  "id",
  "createdAt",
  "updatedAt",
  "globalType",
  "verified",
  "disclosureApproved",
  "approvedForPublic",
  "insightsEnabled",
] as const;

/** A copy of a document that is safe to send back to `update`. */
export function writable(doc: Doc): Doc {
  const copy: Doc = { ...doc };
  for (const key of NOT_WRITTEN) delete copy[key];
  return copy;
}
