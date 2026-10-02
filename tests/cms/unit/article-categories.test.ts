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

import { validateArticle } from "../../../src/cms/hooks/validators";

// validateArticle reads only the document; the request is not used.
const noRequest = {} as never;

test("validateArticle refuses the reserved slug 'category'", async () => {
  const issues = await validateArticle(
    {
      ...base,
      slug: "category",
      body: { root: { children: [{ type: "paragraph" }] } },
    },
    noRequest,
  );
  assert.ok(
    issues.some((issue) => issue.path === "slug" && /reserved/i.test(issue.message)),
    JSON.stringify(issues),
  );
});

test("validateArticle accepts an ordinary slug", async () => {
  const issues = await validateArticle(
    {
      ...base,
      body: { root: { children: [{ type: "paragraph" }] } },
    },
    noRequest,
  );
  assert.ok(!issues.some((issue) => issue.path === "slug"), JSON.stringify(issues));
});
