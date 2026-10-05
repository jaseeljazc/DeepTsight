/*
 * The frame shapes an image appears in on the site (the aspect tokens in src/styles/globals.css),
 * plus the 1200 x 630 link-preview card. The Images page uses them to show each spot as it looks.
 */

export type FrameShape = "wide" | "landscape" | "classic" | "portrait" | "square" | "share";
/** A spot can be hidden on phones (the Contact image shows on wide screens only). */
export type PhoneShape = FrameShape | "hidden";

export const FRAME_RATIO: Record<FrameShape, number> = {
  wide: 21 / 9,
  landscape: 3 / 2,
  classic: 4 / 3,
  portrait: 4 / 5,
  square: 1,
  share: 1200 / 630,
};

export const FRAME_LABEL: Record<FrameShape, string> = {
  wide: "Wide banner (21:9)",
  landscape: "Landscape (3:2)",
  classic: "Classic (4:3)",
  portrait: "Portrait (4:5)",
  square: "Square badge",
  share: "Link preview card (1200 × 630)",
};
