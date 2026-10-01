import { test, expect } from "@playwright/test";

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

test.describe("Phase 7 Quality Assurance Test Suite", () => {
  test("Skip to main content link works via keyboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    // Press Tab to focus the first interactive element
    await page.keyboard.press("Tab");

    // Skip link should be focused
    const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(focusedText).toBe("Skip to content");

    // Activate skip link
    await page.keyboard.press("Enter");

    // Focused element or targeted section should be main-content
    const activeId = await page.evaluate(() => document.activeElement?.id);
    expect(activeId).toBe("main-content");
  });

  test("320px narrow viewport has no horizontal overflow across all routes", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });

    for (const route of testRoutes) {
      await page.goto(route);
      await page.waitForLoadState("load");

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll, `Route ${route} has horizontal overflow at 320px viewport!`).toBe(
        false,
      );
    }
  });

  test("External links have secure rel attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    const externalBlankLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
      return links.map((link) => ({
        href: link.getAttribute("href"),
        rel: link.getAttribute("rel"),
      }));
    });

    for (const link of externalBlankLinks) {
      expect(link.rel).toContain("noopener");
      expect(link.rel).toContain("noreferrer");
    }
  });

  test("mobile menu traps focus, closes on Escape and returns focus (FR-04)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("load");

    const trigger = page.getByRole("button", { name: "Menu" });
    await trigger.click();

    const menu = page.getByRole("dialog", { name: "Site menu" });
    await expect(menu).toBeVisible();
    // Focus starts on the first menu link.
    await expect(menu.getByRole("link", { name: "Home" })).toBeFocused();

    // Tabbing many times never leaves the menu.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      const insideMenu = await page.evaluate(
        () =>
          document.getElementById("mobile-navigation-menu")?.contains(document.activeElement) ??
          false,
      );
      expect(insideMenu, `focus left the menu after ${i + 1} tabs`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("keyboard reaches the primary navigation in reading order", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("load");

    // Skip link, wordmark, then the primary navigation from its first item.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    await expect(primaryNav.getByRole("link", { name: "Home" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(primaryNav.getByRole("link", { name: "About" })).toBeFocused();
  });

  test("404 page renders gracefully with return navigation", async ({ page }) => {
    const response = await page.goto("/non-existent-page-for-testing");
    expect(response?.status()).toBe(404);

    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink.first()).toBeVisible();
  });
});
