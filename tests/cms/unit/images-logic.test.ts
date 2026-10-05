import assert from "node:assert/strict";
import { test } from "node:test";
import type { ImageView, SpotCard } from "../../../src/cms/images/types";
import {
  createdId,
  filterCards,
  groupCards,
  libraryUrl,
  matchesQuery,
  nudgePoint,
  pageNames,
  pointFromPointer,
  restError,
  setAxis,
  siblingsOf,
} from "../../../src/cms/views/images/logic";

function image(id: number, over: Partial<ImageView> = {}): ImageView {
  return {
    id,
    src: `/api/media/file/${id}.jpg`,
    filename: `test-${id}.jpg`,
    alt: "Test",
    caption: `Test caption ${id}`,
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
      source: "Test",
      licence: "Test",
      usageRights: "Test",
      attribution: "",
    },
    ...over,
  };
}

function card(id: string, over: Partial<SpotCard> = {}): SpotCard {
  return {
    id,
    owner: { kind: "global", slug: "home" },
    path: "media.hero",
    group: "Home",
    groupPath: "/",
    title: `Spot ${id}`,
    where: "Top of the page",
    pagePath: "/",
    desktop: "wide",
    phone: "landscape",
    required: true,
    badgeOnly: false,
    adminHref: "/admin/globals/home",
    image: image(1),
    pending: false,
    focalPending: false,
    otherChanges: [],
    sharedWith: [],
    ...over,
  };
}

test("restError prefers field errors, then the message, then a plain sentence", () => {
  assert.equal(
    restError({
      errors: [{ message: "x", data: { errors: [{ path: "alt", message: "Required" }] } }],
    }),
    "alt: Required",
  );
  assert.equal(restError({ errors: [{ message: "Too large" }] }), "Too large");
  assert.equal(restError(null), "The upload was refused. Nothing was saved.");
  assert.equal(restError("nonsense"), "The upload was refused. Nothing was saved.");
  assert.equal(restError({ errors: "bad" }), "The upload was refused. Nothing was saved.");
});

test("createdId reads a numeric doc id only", () => {
  assert.equal(createdId({ doc: { id: 7 } }), 7);
  assert.equal(createdId({ doc: { id: "7" } }), null);
  assert.equal(createdId({}), null);
  assert.equal(createdId(null), null);
});

test("search matches page, title, where, caption and filename, ignoring case", () => {
  const c = card("a");
  assert.ok(matchesQuery(c, ""));
  assert.ok(matchesQuery(c, "  "));
  assert.ok(matchesQuery(c, "home"));
  assert.ok(matchesQuery(c, "SPOT A"));
  assert.ok(matchesQuery(c, "top of"));
  assert.ok(matchesQuery(c, "caption 1"));
  assert.ok(matchesQuery(c, "test-1.jpg"));
  assert.ok(!matchesQuery(c, "about"));
  assert.ok(!matchesQuery(card("b", { image: null }), "caption"));
});

test("filters combine search, needs attention and page", () => {
  const cards = [
    card("a"),
    card("b", { group: "About", pending: true }),
    card("c", { image: null, required: false }),
  ];
  assert.deepEqual(
    filterCards(cards, { query: "", attentionOnly: false, page: "" }).map((c) => c.id),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    filterCards(cards, { query: "", attentionOnly: true, page: "" }).map((c) => c.id),
    ["b"],
  );
  assert.deepEqual(
    filterCards(cards, { query: "", attentionOnly: false, page: "Home" }).map((c) => c.id),
    ["a", "c"],
  );
  assert.deepEqual(
    filterCards(cards, { query: "spot c", attentionOnly: false, page: "Home" }).map((c) => c.id),
    ["c"],
  );
});

test("cards group by page in first-seen order", () => {
  const cards = [
    card("a"),
    card("b", { group: "About", groupPath: "/about" }),
    card("c"),
    card("d", { group: "Share images", groupPath: null }),
  ];
  assert.deepEqual(pageNames(cards), ["Home", "About", "Share images"]);
  const groups = groupCards(cards);
  assert.deepEqual(
    groups.map((g) => [g.name, g.path, g.cards.map((c) => c.id)]),
    [
      ["Home", "/", ["a", "c"]],
      ["About", "/about", ["b"]],
      ["Share images", null, ["d"]],
    ],
  );
});

test("siblings are the cards showing the same image", () => {
  const a = card("a");
  const b = card("b", { image: image(1) });
  const c = card("c", { image: image(2) });
  const empty = card("d", { image: null });
  const all = [a, b, c, empty];
  assert.deepEqual(
    siblingsOf(a, all).map((x) => x.id),
    ["a", "b"],
  );
  assert.deepEqual(
    siblingsOf(c, all).map((x) => x.id),
    ["c"],
  );
  assert.deepEqual(
    siblingsOf(empty, all).map((x) => x.id),
    ["d"],
  );
});

test("the library query keeps badges and photographs apart and encodes the search", () => {
  const photos = libraryUrl(false, "");
  assert.ok(photos.includes("where[kind][equals]=image"));
  assert.ok(photos.includes("where[assetClass][not_equals]=issuer-badge"));
  assert.ok(!photos.includes("caption"));
  const badges = libraryUrl(true, " a&b ");
  assert.ok(badges.includes("where[assetClass][equals]=issuer-badge"));
  assert.ok(badges.endsWith("&where[caption][like]=a%26b"));
});

test("a pointer position becomes a clamped percentage to one decimal", () => {
  const box = { left: 100, top: 50, width: 300, height: 200 };
  assert.deepEqual(pointFromPointer(250, 150, box), { x: 50, y: 50 });
  assert.deepEqual(pointFromPointer(200, 50, box), { x: 33.3, y: 0 });
  assert.deepEqual(pointFromPointer(0, 999, box), { x: 0, y: 100 });
  assert.deepEqual(pointFromPointer(10, 10, { left: 0, top: 0, width: 0, height: 0 }), {
    x: 50,
    y: 50,
  });
});

test("arrow keys nudge the point by 2, or 10 with Shift, within 0 to 100", () => {
  assert.deepEqual(nudgePoint({ x: 50, y: 50 }, "ArrowLeft", false), { x: 48, y: 50 });
  assert.deepEqual(nudgePoint({ x: 50, y: 50 }, "ArrowDown", true), { x: 50, y: 60 });
  assert.deepEqual(nudgePoint({ x: 99, y: 1 }, "ArrowRight", true), { x: 100, y: 1 });
  assert.deepEqual(nudgePoint({ x: 33.3, y: 1 }, "ArrowUp", false), { x: 33.3, y: 0 });
  assert.equal(nudgePoint({ x: 50, y: 50 }, "Enter", false), null);
});

test("a slider sets one axis and ignores non-numbers", () => {
  assert.deepEqual(setAxis({ x: 50, y: 50 }, "x", 20), { x: 20, y: 50 });
  assert.deepEqual(setAxis({ x: 50, y: 50 }, "y", 140), { x: 50, y: 100 });
  assert.deepEqual(setAxis({ x: 50, y: 50 }, "y", Number.NaN), { x: 50, y: 50 });
});
