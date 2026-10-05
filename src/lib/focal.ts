/*
 * A focal point is the part of an image that must stay in view when the frame crops it. Payload
 * stores it as percentages (0-100) from the top-left. The site turns it into CSS object-position.
 */

export interface FocalPoint {
  focalX?: number | null | undefined;
  focalY?: number | null | undefined;
}

function percent(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

/** `undefined` when no focal point is set, so the image keeps the default centred crop. */
export function objectPositionOf(focal: FocalPoint | undefined): string | undefined {
  if (!focal) return undefined;
  const hasX = typeof focal.focalX === "number";
  const hasY = typeof focal.focalY === "number";
  if (!hasX && !hasY) return undefined;
  return `${percent(focal.focalX)}% ${percent(focal.focalY)}%`;
}
