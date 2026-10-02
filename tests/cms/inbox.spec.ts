import { expect, test } from "@playwright/test";
import { INBOX_FILE } from "./global-setup";
import { fullLogin, readAccount, requireTestDatabase } from "./helpers";

/*
 * Phase 9: enquiry inbox (FR-44, PRIV-09). A submission is saved with emailStatus "simulated"
 * (no email service in tests), only the form's own fields are stored, anonymous API access is
 * refused, and deleting removes the record completely. Fixtures are fictional (example.com).
 */
test.describe.configure({ mode: "serial" });
requireTestDatabase();
test.skip(
  process.env["CMS_E2E_BUILD"] !== "cms",
  "Needs a CONTENT_SOURCE=cms build (scripts/cms/test-cms.ts)",
);
test.use({ javaScriptEnabled: false, reducedMotion: "reduce" });

const MARKER = `inbox-test-${Date.now()}`;

interface EnquiryDoc {
  id: number;
  name: string;
  emailStatus: string;
  enquiryTypeLabel: string;
  read: boolean;
  [key: string]: unknown;
}

test("a submission is saved, readable only by an admin, and fully deleted", async ({
  page,
  request,
}) => {
  // Submit without JavaScript (no CAPTCHA token outside production; no timing field).
  await page.setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.50" });
  await page.goto("/contact");
  await page.fill("#contact-name", "Test Visitor");
  await page.fill("#contact-email", "visitor@example.com");
  await page.selectOption("#contact-type", "Plant reliability and asset lifecycle");
  await page.fill("#contact-message", `Test enquiry ${MARKER}.`);
  await page.check("#contact-consent");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  await page.waitForURL("**/contact/thank-you");

  // Anonymous access to the inbox is refused.
  const anonymous = await page.context().request.get("/api/enquiries");
  expect([401, 403]).toContain(anonymous.status());
  expect(
    (await request.post("/api/enquiries", { data: { name: "x" } })).status(),
  ).toBeGreaterThanOrEqual(400);

  await fullLogin(request, readAccount(INBOX_FILE));
  const search = await request.get(`/api/enquiries?where[message][like]=${MARKER}&depth=0`);
  expect(search.status()).toBe(200);
  const doc = ((await search.json()) as { docs: EnquiryDoc[] }).docs[0];
  if (!doc) throw new Error("The enquiry was not saved.");
  expect(doc.emailStatus).toBe("simulated");
  expect(doc.enquiryTypeLabel).toBe("Plant reliability and asset lifecycle");
  expect(doc.read).toBe(false);
  // Nothing beyond the form's fields is stored.
  for (const key of ["ip", "userAgent", "turnstileToken", "hp_website", "cf-turnstile-response"]) {
    expect(doc[key], key).toBeUndefined();
  }

  // Only the read flag can change.
  const marked = await request.patch(`/api/enquiries/${doc.id}`, {
    data: { read: true, name: "Changed" },
  });
  expect(marked.status()).toBe(200);
  const after = (await (await request.get(`/api/enquiries/${doc.id}`)).json()) as EnquiryDoc;
  expect(after.read).toBe(true);
  expect(after.name).toBe("Test Visitor");

  // Delete is a hard delete: no record and no versions remain.
  expect((await request.delete(`/api/enquiries/${doc.id}`)).status()).toBe(200);
  expect((await request.get(`/api/enquiries/${doc.id}`)).status()).toBe(404);
  const versions = await request.get(`/api/enquiries/versions?where[parent][equals]=${doc.id}`);
  expect(versions.status(), "no versions endpoint for enquiries").not.toBe(200);
});
