import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const testRoutes = [
  "/",
  "/services",
  "/services/control-systems-ei-engineering",
  "/services/ot-cybersecurity",
  "/services/it-ot-segregation",
  "/services/plant-reliability",
  "/about",
  "/credentials",
  "/contact",
  "/contact/thank-you",
  "/legal/privacy",
  "/legal/terms",
  "/legal/accessibility",
  "/design-system",
];

for (const route of testRoutes) {
  test(`Route "${route}" should meet WCAG 2.2 AA with zero axe violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("load");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
}
