/**
 * Article categories reach the site as {slug, name} pairs, published ones only.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { mapArticle } from "../../../src/content/mappers";

const base = {
  slug: "test-note",
  title: "Test note",
  summary: "Test summary",
  publishedAt: "2026-10-01T00:00:00.000Z",
  readingMinutes: 2,
  _status: "published",
  body: { root: { children: [] } },
};

test("mapArticle returns published categories with slug and name", () => {
  const article = mapArticle({
    ...base,
    categories: [
      { id: 1, slug: "test-one", name: "Test one", _status: "published" },
      { id: 2, slug: "test-two", name: "Test two", _status: "draft" },
    ],
  });
  assert.deepEqual(article.categories, [{ slug: "test-one", name: "Test one" }]);
  assert.deepEqual(article.tags, ["Test one"]);
});

test("mapArticle gives an empty list when an article has no categories", () => {
  const article = mapArticle({ ...base });
  assert.deepEqual(article.categories, []);
  assert.deepEqual(article.tags, []);
});

test("mapArticle drops a category with no slug or no name", () => {
  const article = mapArticle({
    ...base,
    categories: [{ id: 3, name: "Test no slug", _status: "published" }],
  });
  assert.deepEqual(article.categories, []);
});
