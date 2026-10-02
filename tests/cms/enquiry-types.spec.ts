import { expect, test } from "@playwright/test";
import { ENQUIRY_TYPES_FILE } from "./global-setup";
import { fullLogin, readAccount, requireTestDatabase } from "./helpers";

/*
 * Phase 8: enquiry types are edited in the CMS. Switching one off removes it from the form, and a
 * form rendered before the change cannot submit it: the Server Action validates against the
 * types enabled at that moment. Fixtures are fictional (example.com).
 */
test.describe.configure({ mode: "serial" });
requireTestDatabase();
test.skip(
  process.env["CMS_E2E_BUILD"] !== "cms",
  "Needs a CONTENT_SOURCE=cms build (scripts/cms/test-cms.ts)",
);
// Without JavaScript the form posts straight to the Server Action and the page shows its answer.
test.use({ javaScriptEnabled: false, reducedMotion: "reduce" });

const TYPE = "Something else";

test("a disabled enquiry type leaves the form and is refused by the server", async ({
  page,
  request,
}) => {
  await fullLogin(request, readAccount(ENQUIRY_TYPES_FILE));
  const found = await request.get(
    `/api/enquiry-types?where[value][equals]=${encodeURIComponent(TYPE)}`,
  );
  expect(found.status()).toBe(200);
  const id = ((await found.json()) as { docs: { id: number }[] }).docs[0]?.id;
  expect(id).toBeTruthy();

  try {
    // A visitor opens the form while the type is still offered.
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.40" });
    await page.goto("/contact");
    await expect(page.locator(`#contact-type option[value="${TYPE}"]`)).toHaveCount(1);
    await page.fill("#contact-name", "Test Visitor");
    await page.fill("#contact-email", "visitor@example.com");
    await page.selectOption("#contact-type", TYPE);
    await page.fill("#contact-message", "Test enquiry for the enquiry-type check.");
    await page.check("#contact-consent");

    // The editor switches the type off.
    const off = await request.patch(`/api/enquiry-types/${id}`, { data: { enabled: false } });
    expect(off.status()).toBe(200);

    // The stale form is refused by the server with the usual message.
    await page.getByRole("button", { name: /send enquiry/i }).click();
    await expect(page).not.toHaveURL(/thank-you/);
    await expect(page.getByText("Select an area of enquiry").first()).toBeVisible();

    // A fresh form no longer offers it.
    await expect(async () => {
      await page.goto("/contact");
      await expect(page.locator(`#contact-type option[value="${TYPE}"]`)).toHaveCount(0, {
        timeout: 1000,
      });
    }).toPass({ timeout: 15_000 });
  } finally {
    await request.patch(`/api/enquiry-types/${id}`, { data: { enabled: true } });
  }
});
