import sharp, { type Metadata } from "sharp";

/*
 * Upload hardening (docs/cms/03_SECURITY_AND_OPS.md §8). The file's real type is found by decoding
 * it, not from its name or the browser's claim. Anything that is not a JPEG, PNG, WebP or AVIF image
 * is refused (SVG can carry scripts). Accepted images are re-encoded in the same format, upright
 * (EXIF orientation applied) and with no metadata: no EXIF, GPS position, XMP or camera details. A
 * photograph of a site could otherwise reveal where it is (CLAUDE.md §6).
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const FORMATS = {
  jpeg: { mimetype: "image/jpeg", extension: "jpg" },
  png: { mimetype: "image/png", extension: "png" },
  webp: { mimetype: "image/webp", extension: "webp" },
  avif: { mimetype: "image/avif", extension: "avif" },
} as const;
type Format = keyof typeof FORMATS;

export class UnsupportedImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedImageError";
  }
}

/** sharp reports AVIF as "heif" with the AV1 codec. */
function formatOf(metadata: Metadata): Format | null {
  if (metadata.format === "jpeg" || metadata.format === "png" || metadata.format === "webp") {
    return metadata.format;
  }
  if (metadata.format === "heif" && metadata.compression === "av1") return "avif";
  return null;
}

export interface SanitizedImage {
  data: Buffer;
  mimetype: string;
  extension: string;
  width: number;
  height: number;
}

export async function sanitizeImage(input: Buffer): Promise<SanitizedImage> {
  if (input.length === 0) throw new UnsupportedImageError("The file is empty.");
  if (input.length > MAX_UPLOAD_BYTES)
    throw new UnsupportedImageError("The file is larger than 10 MB.");

  let metadata: Metadata;
  try {
    metadata = await sharp(input, { failOn: "error" }).metadata();
  } catch {
    throw new UnsupportedImageError("The file is not an image that can be read.");
  }
  const format = formatOf(metadata);
  if (!format) {
    throw new UnsupportedImageError("Only JPEG, PNG, WebP and AVIF images can be uploaded.");
  }

  // rotate() bakes in the EXIF orientation; without keepMetadata/withMetadata sharp writes none.
  const { data, info } = await sharp(input, { failOn: "error" })
    .rotate()
    .toFormat(format)
    .toBuffer({ resolveWithObject: true });
  return {
    data,
    mimetype: FORMATS[format].mimetype,
    extension: FORMATS[format].extension,
    width: info.width,
    height: info.height,
  };
}
