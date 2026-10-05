import assert from "node:assert/strict";
import { test } from "node:test";
import { changedPaths, getPath, setPath } from "../../../src/cms/images/doc-paths";

test("getPath reads nested values and tolerates gaps", () => {
  assert.equal(getPath({ media: { why: 4 } }, "media.why"), 4);
  assert.equal(getPath({ media: null }, "media.why"), undefined);
  assert.equal(getPath(undefined, "media.why"), undefined);
});

test("setPath changes one path and keeps every sibling (a stale card cannot overwrite them)", () => {
  const before = { title: "A", media: { why: 1, problems: 2, close: 3 } };
  const after = setPath(before, "media.why", 9);
  assert.deepEqual(after, { title: "A", media: { why: 9, problems: 2, close: 3 } });
  assert.deepEqual(before.media, { why: 1, problems: 2, close: 3 }); // not mutated
});

test("setPath creates missing groups", () => {
  assert.deepEqual(setPath({}, "seo.ogImage", 5), { seo: { ogImage: 5 } });
});

test("changedPaths lists what differs and ignores bookkeeping", () => {
  const published = {
    id: 1,
    _status: "published",
    updatedAt: "a",
    summary: "x",
    media: { hero: 1, detail: 2 },
  };
  const draft = {
    id: 1,
    _status: "draft",
    updatedAt: "b",
    summary: "y",
    media: { hero: 5, detail: 2 },
  };
  assert.deepEqual(changedPaths(published, draft).sort(), ["media.hero", "summary"]);
});

test("changedPaths compares arrays element by element", () => {
  const a = { steps: [{ title: "one" }, { title: "two" }] };
  const b = { steps: [{ title: "one" }, { title: "TWO" }] };
  assert.deepEqual(changedPaths(a, b), ["steps.1.title"]);
});

test("changedPaths treats null and undefined as the same empty value", () => {
  assert.deepEqual(changedPaths({ a: null }, { a: undefined }), []);
});
