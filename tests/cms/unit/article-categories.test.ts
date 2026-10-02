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

import { articlesInCategory, usedCategories } from "../../../src/lib/insights";

const summary = (slug: string, categories: { slug: string; name: string }[]) => ({
  slug,
  title: `Test ${slug}`,
  summary: "Test summary",
  publishedAt: "2026-10-01T00:00:00.000Z",
  readingMinutes: 1,
  categories,
  tags: categories.map((category) => category.name),
});

const articles = [
  summary("a", [{ slug: "b-cat", name: "Test B" }]),
  summary("b", [
    { slug: "b-cat", name: "Test B" },
    { slug: "a-cat", name: "Test A" },
  ]),
  summary("c", []),
];

test("usedCategories counts articles per category and sorts by name", () => {
  assert.deepEqual(usedCategories(articles), [
    { slug: "a-cat", name: "Test A", count: 1 },
    { slug: "b-cat", name: "Test B", count: 2 },
  ]);
});

test("usedCategories is empty when no article has a category", () => {
  assert.deepEqual(usedCategories([summary("c", [])]), []);
});

test("articlesInCategory keeps order and returns nothing for an unknown slug", () => {
  assert.deepEqual(
    articlesInCategory(articles, "b-cat").map((article) => article.slug),
    ["a", "b"],
  );
  assert.deepEqual(articlesInCategory(articles, "nope"), []);
});

import { updatedOn } from "../../../src/lib/insights";

test("updatedOn is null when there is no update or it is the same day", () => {
  assert.equal(updatedOn({ publishedAt: "2026-10-01T01:00:00.000Z" }), null);
  assert.equal(
    updatedOn({
      publishedAt: "2026-10-01T01:00:00.000Z",
      updatedAt: "2026-10-01T05:00:00.000Z",
    }),
    null,
  );
});

test("updatedOn returns the update date when it is a later day", () => {
  assert.equal(
    updatedOn({
      publishedAt: "2026-10-01T01:00:00.000Z",
      updatedAt: "2026-10-09T01:00:00.000Z",
    }),
    "2026-10-09T01:00:00.000Z",
  );
});
