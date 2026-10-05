import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCard, cardStatus, hasBadgeInEitherCopy, needsAttention } from "../../../src/cms/images/cards";
import { credentialSpot, globalSpots } from "../../../src/cms/images/spots";
import type { ImageView } from "../../../src/cms/images/types";

function image(id: number, over: Partial<ImageView> = {}): ImageView {
  return {
    id,
    src: `/api/media/file/${id}.jpg`,
    filename: `${id}.jpg`,
    alt: "Test",
    caption: "Test",
    width: 100,
    height: 100,
    focalX: 50,
    focalY: 50,
    approved: true,
    assetClass: "photograph",
    meta: {
      assetClass: "photograph",
      alt: "Test",
      decorative: false,
      caption: "Test",
      source: "s",
      licence: "l",
      usageRights: "u",
      attribution: "",
    },
    ...over,
  };
}

const spot = globalSpots().find((s) => s.id === "home:media.why");
if (!spot) throw new Error("spot missing");

function ctx(
  latest: Record<string, unknown>,
  published: Record<string, unknown> | null,
  media: ImageView[],
) {
  const byId = new Map(media.map((m) => [m.id, m]));
  return { latest, published, media: byId, publishedMedia: byId, adminHref: "/admin/globals/home" };
}

test("an approved image that matches the published page needs no attention", () => {
  const card = buildCard(spot, ctx({ media: { why: 1 } }, { media: { why: 1 } }, [image(1)]));
  assert.equal(card.pending, false);
  assert.equal(needsAttention(card), false);
  assert.ok(cardStatus(card).some((s) => /approved for public use/i.test(s.text)));
});

test("a changed image is a draft change waiting", () => {
  const card = buildCard(
    spot,
    ctx({ media: { why: 2 } }, { media: { why: 1 } }, [image(1), image(2)]),
  );
  assert.equal(card.pending, true);
  assert.equal(card.image?.id, 2);
  assert.ok(cardStatus(card).some((s) => /draft change waiting/i.test(s.text)));
  assert.equal(needsAttention(card), true);
});

test("other unpublished edits in the section are listed, but not this spot", () => {
  const card = buildCard(
    spot,
    ctx(
      { media: { why: 2 }, hero: { headline: "New" } },
      { media: { why: 1 }, hero: { headline: "Old" } },
      [image(1), image(2)],
    ),
  );
  assert.deepEqual(card.otherChanges, ["hero.headline"]);
});

test("a section that was never published counts as pending", () => {
  const card = buildCard(spot, ctx({ media: { why: 1 } }, null, [image(1)]));
  assert.equal(card.pending, true);
});

test("an empty required spot says the page shows a placeholder", () => {
  const card = buildCard(spot, ctx({ media: { why: null } }, { media: { why: null } }, []));
  assert.equal(card.image, null);
  assert.ok(cardStatus(card).some((s) => /no image/i.test(s.text) && /placeholder/i.test(s.text)));
  assert.equal(needsAttention(card), true);
});

test("an unapproved image is hidden on the live site, and the card says so in words", () => {
  const card = buildCard(
    spot,
    ctx({ media: { why: 1 } }, { media: { why: 1 } }, [image(1, { approved: false })]),
  );
  assert.ok(cardStatus(card).some((s) => /not approved/i.test(s.text) && /hidden/i.test(s.text)));
  assert.equal(needsAttention(card), true);
});

test("an unpublished focal point change is flagged", () => {
  const latest = image(1, { focalX: 20 });
  const published = image(1, { focalX: 50 });
  const card = buildCard(spot, {
    latest: { media: { why: 1 } },
    published: { media: { why: 1 } },
    media: new Map([[1, latest]]),
    publishedMedia: new Map([[1, published]]),
    adminHref: "/admin/globals/home",
  });
  assert.equal(card.focalPending, true);
});

test("a badge counts as present when it is in either copy of a credential", () => {
  assert.equal(hasBadgeInEitherCopy({ badge: 1 }, { badge: 1 }), true);
  assert.equal(hasBadgeInEitherCopy({ badge: 1 }, null), true);
  assert.equal(hasBadgeInEitherCopy({ badge: null }, { badge: 1 }), true);
  assert.equal(hasBadgeInEitherCopy({ badge: null }, { badge: null }), false);
  assert.equal(hasBadgeInEitherCopy({}, null), false);
});

test("a badge cleared only in the draft is a pending change, with the published image still in use", () => {
  const badgeSpot = credentialSpot({ id: 3, title: "Test credential" });
  const card = buildCard(badgeSpot, {
    latest: { badge: null },
    published: { badge: 1 },
    media: new Map(),
    publishedMedia: new Map([[1, image(1)]]),
    adminHref: "/admin/collections/credentials/3",
  });
  assert.equal(card.image, null);
  assert.equal(card.pending, true);
  assert.equal(needsAttention(card), true);
});
