import assert from "node:assert/strict";
import { test } from "node:test";
import { seoMetadata } from "../../../src/lib/seo-metadata";
import { shareImageSrc } from "../../../src/content/mappers";

test("without a share image the metadata has no images (the generated card is used)", () => {
  const meta = seoMetadata({ title: "About", description: "D", canonical: "/about" });
  assert.equal(meta.title, "About");
  assert.equal(meta.alternates?.canonical, "/about");
  const og = meta.openGraph as { images?: unknown } | undefined;
  assert.equal(og?.images, undefined);
});

test("with a share image the page uses it for Open Graph and Twitter", () => {
  const meta = seoMetadata({
    title: "About",
    description: "D",
    canonical: "/about",
    ogImage: "/api/media/file/share.jpg",
  });
  const og = meta.openGraph as { images?: { url: string }[] };
  assert.equal(og.images?.[0]?.url.endsWith("/api/media/file/share.jpg"), true);
  assert.ok(og.images?.[0]?.url.startsWith("http"));
  const tw = meta.twitter as { images?: string[] };
  assert.equal(tw.images?.[0]?.endsWith("/api/media/file/share.jpg"), true);
});

test("only an approved, populated image can be a share image", () => {
  assert.equal(shareImageSrc(null), undefined);
  assert.equal(shareImageSrc(12), undefined); // an unpopulated id
  assert.equal(shareImageSrc({ filename: "a.jpg", approvedForPublic: false }), undefined);
  assert.equal(
    shareImageSrc({ filename: "a.jpg", approvedForPublic: true }),
    "/api/media/file/a.jpg",
  );
});
