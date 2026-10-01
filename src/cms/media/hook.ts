import path from "node:path";
import { APIError, type CollectionBeforeOperationHook } from "payload";
import { UnsupportedImageError, sanitizeImage } from "./sanitize";

/**
 * Runs before Payload stores an upload (admin, REST or Local API, including the import): the file
 * is decoded, refused unless it is a real JPEG, PNG, WebP or AVIF, and replaced by a re-encoded copy
 * without metadata (03 §8). The file name keeps its stem; the extension follows the real format.
 */
export const sanitizeUpload: CollectionBeforeOperationHook = async ({ operation, req }) => {
  if ((operation !== "create" && operation !== "update") || !req.file) return;
  try {
    const clean = await sanitizeImage(req.file.data);
    const stem = path.parse(req.file.name).name.replace(/[^A-Za-z0-9._-]/g, "-") || "image";
    req.file.data = clean.data;
    req.file.size = clean.data.length;
    req.file.mimetype = clean.mimetype;
    req.file.name = `${stem}.${clean.extension}`;
  } catch (error) {
    if (error instanceof UnsupportedImageError) throw new APIError(error.message, 400);
    throw error;
  }
};
