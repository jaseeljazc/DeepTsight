import { test, expect, type Page } from "@playwright/test";

/*
 * Runs against a non-production server (development test keys, simulated email). Fixtures are
 * fictional: example.com addresses and an ACMA fictional-use phone number (CLAUDE.md §6).
 * The rate limiter keeps a 30-per-hour global count in memory, so run this file against a fresh
 * server: repeated runs within an hour on a reused server will hit that limit.
 */

/** A different client address per test, so the per-IP limit (FR-36) does not leak between tests. */
function testIp(): string {
  return `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
}

async function fillValidEnquiry(page: Page) {
  await page.fill("#contact-name", "Alex Example");
  await page.fill("#contact-email", "alex@example.com");
  await page.fill("#contact-org", "Example Organisation");
  await page.fill("#contact-phone", "+61 8 5550 0100");
  await page.selectOption("#contact-type", "OT cybersecurity and network architecture");
  await page.fill("#contact-message", "Requesting an initial scoping discussion. Test enquiry.");
  await page.check("#contact-consent");
}

test.describe("Enquiry Form E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": testIp() });
    await page.goto("/contact");
    await page.waitForLoadState("load");
  });

  test("form has proper autocomplete and accessibility attributes", async ({ page }) => {
    // Autocomplete attributes (A11Y-12)
    await expect(page.locator('input[name="name"]')).toHaveAttribute("autocomplete", "name");
    await expect(page.locator('input[name="workEmail"]')).toHaveAttribute("autocomplete", "email");
    await expect(page.locator('input[name="organisation"]')).toHaveAttribute(
      "autocomplete",
      "organization",
    );
    await expect(page.locator('input[name="phone"]')).toHaveAttribute("autocomplete", "tel");

    // Honeypot presence and accessibility (FR-35)
    const honeypot = page.locator('input[name="hp_website"]');
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("autocomplete", "off");
  });

  test("shows accessible error summary and inline errors on empty submission", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /send enquiry/i });
    await submitBtn.click();

    // Error summary appears and takes focus (FR-33, A11Y-13)
    const errorSummary = page.getByRole("alert").first();
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary).toBeFocused();

    // Inline errors are present and linked via aria-describedby
    const nameInput = page.locator("#contact-name");
    await expect(nameInput).toHaveAttribute("aria-invalid", "true");
    const nameDescribedBy = await nameInput.getAttribute("aria-describedby");
    expect(nameDescribedBy).toContain("contact-name-error");

    const emailInput = page.locator("#contact-email");
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  test("an error found on blur does not move focus away from the form (FR-33)", async ({
    page,
  }) => {
    await page.focus("#contact-name");
    await page.keyboard.press("Tab");

    // Leaving Name empty shows its error, but focus stays on the next field.
    await expect(page.locator("#contact-name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#contact-email")).toBeFocused();
  });

  test("submits successfully and redirects to thank you page", async ({ page }) => {
    await fillValidEnquiry(page);

    // The minimum elapsed-time check is 3 seconds from first interaction (FR-35)
    await page.waitForTimeout(3200);

    await page.getByRole("button", { name: /send enquiry/i }).click();

    // Verify redirection to /contact/thank-you (FR-34)
    await page.waitForURL("**/contact/thank-you");
    await expect(page.locator("h1")).toContainText("Thank you, your enquiry has been sent");
    await expect(page.getByText("What happens next")).toBeVisible();
  });
});

test.describe("Enquiry Form without JavaScript", () => {
  // Reduced motion turns off smooth scrolling, which otherwise keeps Playwright's click
  // stability check retrying while the page scrolls the field into view.
  test.use({ javaScriptEnabled: false, reducedMotion: "reduce" });

  test("submits and redirects with JavaScript disabled (FR-31)", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": testIp() });
    await page.goto("/contact");
    await fillValidEnquiry(page);
    await page.getByRole("button", { name: /send enquiry/i }).click();

    await page.waitForURL("**/contact/thank-you");
    await expect(page.locator("h1")).toContainText("Thank you, your enquiry has been sent");
  });

  test("the sixth enquiry from one address in an hour is refused (FR-36)", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": testIp() });

    for (let attempt = 1; attempt <= 5; attempt++) {
      await page.goto("/contact");
      await fillValidEnquiry(page);
      await page.getByRole("button", { name: /send enquiry/i }).click();
      await page.waitForURL("**/contact/thank-you");
    }

    await page.goto("/contact");
    await fillValidEnquiry(page);
    await page.getByRole("button", { name: /send enquiry/i }).click();

    // A friendly message, not a stack trace, and no redirect.
    await expect(page.getByText(/too many enquiries from this connection/i)).toBeVisible();
    expect(page.url()).toContain("/contact");
    expect(page.url()).not.toContain("thank-you");
  });
});
