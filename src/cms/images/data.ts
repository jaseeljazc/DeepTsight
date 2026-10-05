import type { Payload } from "payload";
import { mediaSrc } from "../../content/mappers";
import { buildCard, hasBadgeInEitherCopy, mediaIdAt } from "./cards";
import { asDoc, localApi, type Doc } from "./local-api";
import { credentialSpot, globalSpots, serviceSpots } from "./spots";
import type {
  ImageView,
  ImagesPageData,
  OwnerRef,
  SpotCard,
  SpotInstance,
  UnusedImage,
  UsageView,
} from "./types";

/*
 * Reads every image owner (Home, About, Pages, Search results, each service, each credential)
 * twice, the latest draft and the published copy, plus every image record, and builds the cards.
 * Runs in the admin view and in the delete guard.
 *
 * Every read here uses `overrideAccess: true`, so it bypasses collection access rules. That is safe
 * ONLY because every caller must first pass `isAdmin()` (signed in, with a verified second factor).
 * Any new caller must do the same before calling these functions.
 */

const text = (doc: Doc, key: string): string =>
  typeof doc[key] === "string" ? (doc[key] as string) : "";
const flag = (doc: Doc, key: string): boolean => doc[key] === true;
const number = (doc: Doc, key: string, fallback: number): number =>
  typeof doc[key] === "number" && Number.isFinite(doc[key]) ? (doc[key] as number) : fallback;

export function imageViewOf(doc: Doc): ImageView {
  return {
    id: number(doc, "id", 0),
    src: mediaSrc(doc),
    filename: text(doc, "filename"),
    alt: text(doc, "alt"),
    caption: text(doc, "caption"),
    width: number(doc, "width", 0),
    height: number(doc, "height", 0),
    focalX: number(doc, "focalX", 50),
    focalY: number(doc, "focalY", 50),
    approved: flag(doc, "approvedForPublic"),
    assetClass: text(doc, "assetClass") || "photograph",
    meta: {
      assetClass: text(doc, "assetClass") || "photograph",
      alt: text(doc, "alt"),
      decorative: flag(doc, "decorative"),
      caption: text(doc, "caption"),
      source: text(doc, "source"),
      licence: text(doc, "licence"),
      usageRights: text(doc, "usageRights"),
      attribution: text(doc, "attribution"),
    },
  };
}

interface OwnerDocs {
  owner: OwnerRef;
  adminHref: string;
  latest: Doc;
  published: Doc | null;
  spots: SpotInstance[];
}

async function all(payload: Payload, collection: string, draft: boolean): Promise<Doc[]> {
  const api = localApi(payload);
  const result = await api.find({
    collection,
    draft,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    ...(draft ? {} : { where: { _status: { equals: "published" } } }),
  });
  return result.docs.map(asDoc);
}

/** Documents keyed by their numeric id, the same key the owners are looked up with. */
function byId(docs: Doc[]): Map<number, Doc> {
  return new Map(docs.map((doc): [number, Doc] => [number(doc, "id", 0), doc]));
}

async function loadOwners(payload: Payload): Promise<OwnerDocs[]> {
  const api = localApi(payload);
  const owners: OwnerDocs[] = [];

  const globals = globalSpots();
  for (const slug of ["home", "about", "pages", "seo"] as const) {
    const latest = asDoc(
      await api.findGlobal({ slug, draft: true, depth: 0, overrideAccess: true }),
    );
    const published = asDoc(
      await api.findGlobal({ slug, draft: false, depth: 0, overrideAccess: true }),
    );
    owners.push({
      owner: { kind: "global", slug },
      adminHref: `/admin/globals/${slug}`,
      latest,
      published: published["_status"] === "published" ? published : null,
      spots: globals.filter((spot) => spot.owner.kind === "global" && spot.owner.slug === slug),
    });
  }

  const publishedServices = byId(await all(payload, "services", false));
  for (const doc of await all(payload, "services", true)) {
    const id = number(doc, "id", 0);
    owners.push({
      owner: { kind: "collection", slug: "services", id },
      adminHref: `/admin/collections/services/${id}`,
      latest: doc,
      published: publishedServices.get(id) ?? null,
      spots: serviceSpots({ id, slug: text(doc, "slug"), title: text(doc, "title") }),
    });
  }

  const publishedCredentials = byId(await all(payload, "credentials", false));
  for (const doc of await all(payload, "credentials", true)) {
    const id = number(doc, "id", 0);
    const published = publishedCredentials.get(id) ?? null;
    if (!hasBadgeInEitherCopy(doc, published)) continue;
    owners.push({
      owner: { kind: "collection", slug: "credentials", id },
      adminHref: `/admin/collections/credentials/${id}`,
      latest: doc,
      published,
      spots: [credentialSpot({ id, title: text(doc, "title") })],
    });
  }
  return owners;
}

async function loadMedia(payload: Payload): Promise<{
  latest: Map<number, ImageView>;
  published: Map<number, ImageView>;
  createdAt: Map<number, string>;
}> {
  const toMap = (docs: Doc[]) =>
    new Map(
      docs
        .filter((doc) => text(doc, "kind") !== "slot" && text(doc, "filename") !== "")
        .map((doc) => [number(doc, "id", 0), imageViewOf(doc)] as const),
    );
  const latestDocs = await all(payload, "media", true);
  return {
    latest: toMap(latestDocs),
    published: toMap(await all(payload, "media", false)),
    createdAt: new Map(latestDocs.map((doc) => [number(doc, "id", 0), text(doc, "createdAt")])),
  };
}

function usedIds(owners: OwnerDocs[]): Set<number> {
  const ids = new Set<number>();
  for (const { latest, published, spots } of owners) {
    for (const spot of spots) {
      for (const doc of [latest, published]) {
        const id = mediaIdAt(doc, spot.path);
        if (id !== null) ids.add(id);
      }
    }
  }
  return ids;
}

export async function loadImagesPage(payload: Payload): Promise<ImagesPageData> {
  const [owners, media] = await Promise.all([loadOwners(payload), loadMedia(payload)]);

  const cards: SpotCard[] = owners.flatMap((owner) =>
    owner.spots.map((spot) =>
      buildCard(spot, {
        latest: owner.latest,
        published: owner.published,
        media: media.latest,
        publishedMedia: media.published,
        adminHref: owner.adminHref,
      }),
    ),
  );

  // Titles of the other spots that use the same image, for the replace and delete warnings.
  const byImage = new Map<number, SpotCard[]>();
  for (const card of cards) {
    if (card.image) byImage.set(card.image.id, [...(byImage.get(card.image.id) ?? []), card]);
  }
  for (const card of cards) {
    if (!card.image) continue;
    card.sharedWith = (byImage.get(card.image.id) ?? [])
      .filter((other) => other.id !== card.id)
      .map((other) => `${other.group} → ${other.title}`);
  }

  const used = usedIds(owners);
  const unused: UnusedImage[] = [...media.latest.values()]
    .filter((image) => !used.has(image.id))
    .map((image) => ({ image, createdAt: media.createdAt.get(image.id) ?? "" }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { cards, unused };
}

/** Every spot (latest draft or published) that uses an image. Used by the delete guard. */
export async function findUsages(payload: Payload, mediaId: number): Promise<UsageView[]> {
  const owners = await loadOwners(payload);
  const usages: UsageView[] = [];
  for (const { latest, published, spots } of owners) {
    for (const spot of spots) {
      const hit = [latest, published].some((doc) => mediaIdAt(doc, spot.path) === mediaId);
      if (hit)
        usages.push({ spotId: spot.id, group: spot.group, title: spot.title, where: spot.where });
    }
  }
  return usages;
}
