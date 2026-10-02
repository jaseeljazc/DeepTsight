/**
 * Article JSON-LD: author comes from the founder record, never from a placeholder.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { articleLd } from "../../../src/lib/jsonld";
import { getAboutContent, getSite } from "../../../src/content/index";
import type { Article } from "../../../src/content/types";

const article: Article = {
  slug: "test-note",
  title: "Test note",
  summary: "Test summary",
  publishedAt: "2026-10-01T00:00:00.000Z",
  readingMinutes: 1,
  categories: [],
  tags: [],
  status: "published",
  body: { root: { children: [] } },
};

test("articleLd adds the founder as author and the page as main entity", async () => {
  const [site, about] = await Promise.all([getSite(), getAboutContent()]);
  const ld = articleLd(article, site, {
    ...about,
    founder: { ...about.founder, name: "Test Author", jobTitle: "Test Title" },
  });
  assert.ok(ld);
  assert.deepEqual(ld.author, { "@type": "Person", name: "Test Author" });
  assert.ok(ld.mainEntityOfPage["@id"].endsWith("/insights/test-note"));
});

test("articleLd omits author when the founder name is a placeholder", async () => {
  const [site, about] = await Promise.all([getSite(), getAboutContent()]);
  const ld = articleLd(article, site, {
    ...about,
    founder: { ...about.founder, name: "[PLACEHOLDER] Name" },
  });
  assert.ok(ld);
  assert.equal("author" in ld, false);
});

test("articleLd still works without the About content", async () => {
  const site = await getSite();
  const ld = articleLd(article, site);
  assert.ok(ld);
  assert.equal("author" in ld, false);
});
