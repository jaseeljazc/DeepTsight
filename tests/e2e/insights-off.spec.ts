import { test, expect } from "@playwright/test";

/*
 * While Insights is switched off (site.insightsEnabled = false, the current setting), every
 * Insights address answers 404 and nothing links to it (FR-27, Phase 13).
 */
test.describe("Insights switched off", () => {
  test("index, article and feed answer 404", async ({ request }) => {
    for (const path of [
      "/insights",
      "/insights/any-article",
      "/insights/category/any-category",
      "/insights/rss.xml",
    ]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });

  test("the menu does not link to Insights", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('header a[href="/insights"]')).toHaveCount(0);
  });
});
