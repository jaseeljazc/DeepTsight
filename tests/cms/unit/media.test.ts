/**
 * Upload hardening (Phase 10): EXIF/GPS stripping and type checks, offline.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { sanitizeImage } from "../../../src/cms/media/sanitize";

const base = () =>
  sharp({ create: { width: 40, height: 20, channels: 3, background: { r: 10, g: 120, b: 200 } } });

test("GPS and camera EXIF are removed from a JPEG", async () => {
  const withGps = await base()
    .jpeg()
    .withExif({
      IFD0: { Make: "Test camera", Model: "Test model", Copyright: "Test" },
      IFD3: {
        GPSLatitudeRef: "S",
        GPSLatitude: "31/1 57/1 0/1",
        GPSLongitudeRef: "E",
        GPSLongitude: "115/1 51/1 0/1",
      },
    })
    .toBuffer();
  const before = await sharp(withGps).metadata();
  assert.ok(before.exif && before.exif.length > 0, "fixture carries EXIF");
  assert.ok(withGps.includes(Buffer.from("Test camera")), "fixture carries camera make");

  const clean = await sanitizeImage(withGps);
  const after = await sharp(clean.data).metadata();
  assert.equal(after.exif, undefined, "no EXIF block");
  assert.equal(after.xmp, undefined, "no XMP block");
  assert.ok(!clean.data.includes(Buffer.from("Test camera")), "camera make gone");
  assert.equal(clean.mimetype, "image/jpeg");
  assert.equal(clean.width, 40);
});

test("orientation is applied before metadata is dropped", async () => {
  const rotated = await base().jpeg().withMetadata({ orientation: 6 }).toBuffer();
  assert.equal((await sharp(rotated).metadata()).orientation, 6, "fixture is rotated");
  const clean = await sanitizeImage(rotated);
  assert.equal(clean.width, 20, "portrait after applying orientation 6");
  assert.equal(clean.height, 40);
});

test("PNG, WebP and AVIF keep their format", async () => {
  for (const [format, mimetype] of [
    ["png", "image/png"],
    ["webp", "image/webp"],
    ["avif", "image/avif"],
  ] as const) {
    const input = await base().toFormat(format).toBuffer();
    const clean = await sanitizeImage(input);
    assert.equal(clean.mimetype, mimetype, format);
  }
});

test("SVG, text and empty files are refused", async () => {
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script><rect width="10" height="10"/></svg>',
  );
  await assert.rejects(sanitizeImage(svg), /Only JPEG, PNG, WebP and AVIF|not an image/);
  await assert.rejects(sanitizeImage(Buffer.from("hello, not an image")), /not an image/);
  await assert.rejects(sanitizeImage(Buffer.alloc(0)), /empty/);
  const gif = await base().gif().toBuffer();
  await assert.rejects(sanitizeImage(gif), /Only JPEG, PNG, WebP and AVIF/);
});
