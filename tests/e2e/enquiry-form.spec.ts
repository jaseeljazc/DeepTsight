import { test, expect } from "@playwright/test";

test.describe("Enquiry Form E2E", () => {
  test.beforeEach(async ({ page }) => {
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

    // Error summary appears (FR-33, A11Y-13)
    const errorSummary = page.getByRole("alert").first();
    await expect(errorSummary).toBeVisible();

    // Inline errors are present and linked via aria-describedby
    const nameInput = page.locator("#contact-name");
    await expect(nameInput).toHaveAttribute("aria-invalid", "true");
    const nameDescribedBy = await nameInput.getAttribute("aria-describedby");
    expect(nameDescribedBy).toContain("contact-name-error");

    const emailInput = page.locator("#contact-email");
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  test("submits successfully and redirects to thank you page", async ({ page }) => {
    await page.fill("#contact-name", "Alex Wright");
    await page.fill("#contact-email", "a.wright@infrastructure.gov.au");
    await page.fill("#contact-org", "WA Regional Water Corp");
    await page.fill("#contact-phone", "+61 8 9222 0000");
    await page.selectOption("#contact-type", "OT Cybersecurity & Architecture");
    await page.fill(
      "#contact-message",
      "Requesting initial scoping discussion for water utility SCADA segment review.",
    );
    await page.check("#contact-consent");

    // Wait at least 2.6 seconds to satisfy minimum elapsed time spam check (FR-35)
    await page.waitForTimeout(2600);

    const submitBtn = page.getByRole("button", { name: /send enquiry/i });
    await submitBtn.click();

    // Verify redirection to /contact/thank-you (FR-34)
    await page.waitForURL("**/contact/thank-you");
    await expect(page.locator("h1")).toContainText("Thank you, your enquiry has been sent");
    await expect(page.getByText("What happens next")).toBeVisible();
  });
});
