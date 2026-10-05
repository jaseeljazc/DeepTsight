import type { FrameShape, PhoneShape } from "./frames";

export type OwnerRef =
  | { kind: "global"; slug: "home" | "about" | "pages" | "seo" }
  | { kind: "collection"; slug: "services" | "credentials"; id: number };

export interface SpotInstance {
  id: string; // stable key, e.g. "home:media.why", "services:12:media.hero"
  owner: OwnerRef;
  path: string; // dotted path inside the owner document
  group: string; // group heading, e.g. "Home"
  groupPath: string | null; // public page the group describes (null for share images)
  title: string; // "Why DeepTsight"
  where: string; // plain-words location
  pagePath: string | null; // page to preview; null when there is none
  desktop: FrameShape;
  phone: PhoneShape;
  required: boolean;
  badgeOnly: boolean; // picker shows issuer badges only
}

/** What the page needs to know about one image record. */
export interface ImageView {
  id: number;
  src: string;
  filename: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  focalX: number;
  focalY: number;
  approved: boolean;
  assetClass: string;
  /** Rights record, copied when an image is replaced. */
  meta: {
    assetClass: string;
    alt: string;
    decorative: boolean;
    caption: string;
    source: string;
    licence: string;
    usageRights: string;
    attribution: string;
  };
}

export interface SpotCard extends SpotInstance {
  adminHref: string;
  image: ImageView | null;
  /** The latest draft uses a different image from the published page. */
  pending: boolean;
  /** The image's focal point has an unpublished change. */
  focalPending: boolean;
  /** Everything else that is unpublished in this section (dotted paths), for the publish warning. */
  otherChanges: string[];
  /** Other spots using the same image (titles), for warnings. */
  sharedWith: string[];
}

export interface UsageView {
  spotId: string;
  group: string;
  title: string;
  where: string;
}

export interface UnusedImage {
  image: ImageView;
  createdAt: string;
}

export interface ImagesPageData {
  cards: SpotCard[];
  unused: UnusedImage[];
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; needsConfirmation?: boolean; usages?: UsageView[] };
