import AxeBuilder from "@axe-core/playwright";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { INSIGHTS_FILE } from "./global-setup";
import { fullLogin, readAccount, requireTestDatabase } from "./helpers";

/*
 * Phase 13: Insights with the flag on in the test database, one published and one draft article.
 * The published article renders and passes axe, the draft never appears, and the feed is valid XML.
 * The flag is switched back off at the end.
 */
test.describe.configure({ mode: "serial" });
requireTestDatabase();
test.skip(
  process.env["CMS_E2E_BUILD"] !== "cms",
  "Needs a CONTENT_SOURCE=cms build (scripts/cms/test-cms.ts)",
);

const PUBLISHED = "test-published-note";
const DRAFT = "test-draft-note";

const paragraph = (value: string) => ({
  type: "paragraph",
  version: 1,
  children: [{ type: "text", version: 1, text: value, format: 0 }],
});
const body = (value: string) => ({
  root: { type: "root", version: 1, children: [paragraph(value)] },
});

async function setInsights(request: APIRequestContext, enabled: boolean) {
  const response = await request.post("/api/globals/site-settings", {
    data: { insightsEnabled: enabled, _status: "published" },
  });
  expect(response.status(), `insightsEnabled=${enabled}`).toBe(200);
}

test("published article renders, draft stays hidden, feed is valid", async ({ request, page }) => {
  await fullLogin(request, readAccount(INSIGHTS_FILE));
  const created: number[] = [];
  let categoryId: number | undefined;
  let emptyCategoryId: number | undefined;
  try {
    const category = await request.post("/api/article-categories", {
      data: { name: "Test category", slug: "test-category", _status: "published" },
    });
    expect(category.status()).toBe(201);
    categoryId = ((await category.json()) as { doc: { id: number } }).doc.id;

    // A published category that no article uses: it must not appear anywhere.
    const emptyCategory = await request.post("/api/article-categories", {
      data: { name: "Test empty category", slug: "test-empty-category", _status: "published" },
    });
    expect(emptyCategory.status()).toBe(201);
    emptyCategoryId = ((await emptyCategory.json()) as { doc: { id: number } }).doc.id;

    const published = await request.post("/api/articles", {
      data: {
        slug: PUBLISHED,
        categories: [categoryId],
        title: "Test published note",
        summary: "Test summary for the published note & its <feed> entry.",
        body: body("Test body text for the published note."),
        seo: { title: "Test published note", description: "Test description" },
        _status: "published",
      },
    });
    expect(published.status()).toBe(201);
    created.push(((await published.json()) as { doc: { id: number } }).doc.id);

    const draft = await request.post("/api/articles?draft=true", {
      data: {
        slug: DRAFT,
        title: "Test draft note",
        summary: "Test draft summary",
        body: body("Test draft body."),
        _status: "draft",
      },
    });
    expect(draft.status()).toBe(201);
    created.push(((await draft.json()) as { doc: { id: number } }).doc.id);

    await setInsights(request, true);

    await expect(async () => {
      await page.goto("/insights");
      await expect(page.getByRole("link", { name: "Test published note" })).toBeVisible({
        timeout: 1000,
      });
    }).toPass({ timeout: 20_000 });
    await expect(page.getByText("Test draft note")).toHaveCount(0);

    await page.getByRole("link", { name: "Test published note" }).click();
    await expect(page).toHaveURL(new RegExp(`/insights/${PUBLISHED}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Test published note");
    await expect(page.getByText("Test body text for the published note.")).toBeVisible();
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations).toEqual([]);

    expect((await page.request.get(`/insights/${DRAFT}`)).status()).toBe(404);

    const feed = await page.request.get("/insights/rss.xml");
    expect(feed.status()).toBe(200);
    expect(feed.headers()["content-type"]).toContain("application/rss+xml");
    const xml = await feed.text();
    expect(xml).toContain("&amp; its &lt;feed&gt; entry");
    expect(xml).not.toContain(DRAFT);
    // Parsed by the browser's XML parser: no parsererror means well-formed XML.
    const wellFormed = await page.evaluate(
      (text) =>
        new DOMParser().parseFromString(text, "application/xml").querySelector("parsererror") ===
        null,
      xml,
    );
    expect(wellFormed).toBe(true);

    // The menu links to Insights while it is on.
    await page.goto("/");
    await expect(page.locator('header a[href="/insights"]')).toHaveCount(1);

    // The category page lists the article; an unknown category answers 404.
    await page.goto("/insights/category/test-category");
    await expect(page.getByRole("link", { name: "Test published note" })).toBeVisible();
    expect((await page.request.get("/insights/category/no-such-category")).status()).toBe(404);

    // An empty category is neither a filter link nor a page.
    await page.goto("/insights");
    const filter = page.getByRole("navigation", { name: "Filter articles by category" });
    await expect(filter.getByRole("link", { name: "Test category" })).toBeVisible();
    await expect(filter.getByRole("link", { name: "Test empty category" })).toHaveCount(0);
    expect((await page.request.get("/insights/category/test-empty-category")).status()).toBe(404);

    // Axe on every Insights page type, and no sideways scroll at the four review widths.
    for (const path of [
      "/insights",
      "/insights/category/test-category",
      `/insights/${PUBLISHED}`,
    ]) {
      for (const width of [360, 768, 1280, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `${path} at ${width}px`).toBe(false);
      }
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations, path).toEqual([]);
    }
  } finally {
    await setInsights(request, false);
    for (const id of created) await request.delete(`/api/articles/${id}`);
    if (categoryId !== undefined) await request.delete(`/api/article-categories/${categoryId}`);
    if (emptyCategoryId !== undefined)
      await request.delete(`/api/article-categories/${emptyCategoryId}`);
  }
});
