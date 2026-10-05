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

test("setPath handles arrays correctly (does not replace with {})", () => {
  const before = {
    steps: [
      { title: "a", media: 1 },
      { title: "b", media: 2 },
    ],
  };
  const after = setPath(before, "steps.1.media", 9);
  assert.deepEqual(after, {
    steps: [
      { title: "a", media: 1 },
      { title: "b", media: 9 },
    ],
  });
  assert.ok(Array.isArray(after.steps), "steps must remain an array");
  assert.deepEqual(before.steps, [
    { title: "a", media: 1 },
    { title: "b", media: 2 },
  ]); // input not mutated
});

test("setPath never mutates array inputs", () => {
  const before = [
    { id: 1, title: "a" },
    { id: 2, title: "b" },
  ];
  const after = setPath(before as unknown as Record<string, unknown>, "1.title", "B");
  assert.deepEqual(after, [
    { id: 1, title: "a" },
    { id: 2, title: "B" },
  ]);
  assert.deepEqual(before, [
    { id: 1, title: "a" },
    { id: 2, title: "b" },
  ]); // original untouched
});

test("setPath throws on empty path", () => {
  assert.throws(() => setPath({ a: 1 }, "", 2), { message: /empty path/ });
});

test("setPath throws on invalid array index", () => {
  assert.throws(() => setPath({ a: [1, 2] }, "a.notanumber", 99), { message: /invalid.*index/ });
});

test("getPath reads from arrays", () => {
  assert.equal(getPath({ steps: [{ title: "a" }, { title: "b" }] }, "steps.1.title"), "b");
  assert.equal(getPath({ steps: [1, 2, 3] }, "steps.2"), 3);
});

test("getPath with empty path returns undefined", () => {
  assert.equal(getPath({ a: 1 }, ""), undefined);
});

test("getPath with empty segment returns undefined", () => {
  assert.equal(getPath({ steps: [1, 2] }, "steps..1"), undefined);
  assert.equal(getPath({ steps: [1, 2] }, "steps."), undefined);
});

test("changedPaths ignores id in array rows", () => {
  const a = { steps: [{ id: "x", title: "one" }] };
  const b = { steps: [{ id: "y", title: "one" }] };
  assert.deepEqual(changedPaths(a, b), []);
});

test("changedPaths reports array row content changes even when ids differ", () => {
  const a = { steps: [{ id: "x", title: "one" }] };
  const b = { steps: [{ id: "y", title: "ONE" }] };
  assert.deepEqual(changedPaths(a, b), ["steps.0.title"]);
});

test("changedPaths reports id changes in populated relationships (not array rows)", () => {
  const a = { m: { id: 1 } };
  const b = { m: { id: 2 } };
  assert.deepEqual(changedPaths(a, b), ["m.id"]);
});

test("changedPaths detects array length differences", () => {
  assert.deepEqual(changedPaths({ a: [1, 2] }, { a: [1] }), ["a.1"]);
  assert.deepEqual(changedPaths({ a: [1] }, { a: [1, 2] }), ["a.1"]);
});

test("changedPaths reports null vs value as changed", () => {
  assert.deepEqual(changedPaths({ a: null }, { a: "x" }), ["a"]);
  assert.deepEqual(changedPaths({ a: "x" }, { a: null }), ["a"]);
});
