import { expect, test, type APIRequestContext } from "@playwright/test";
import { ADMIN_FILE } from "./global-setup";
import { fullLogin, readAccount, requireTestDatabase } from "./helpers";

/*
 * Phase 7: draft → preview → publish, against a CMS-mode build (scripts/cms/test-cms.ts).
 * 1. A draft edit leaves the public page unchanged.
 * 2. Preview shows the draft.
 * 3. Publishing updates the public page (on-demand revalidation).
 */
test.describe.configure({ mode: "serial" });
requireTestDatabase();
test.skip(
  process.env["CMS_E2E_BUILD"] !== "cms",
  "Needs a CONTENT_SOURCE=cms build (scripts/cms/test-cms.ts)",
);

const SLUG = "ot-cybersecurity";
const PAGE = `/services/${SLUG}`;
const DRAFT_SUMMARY = "Draft summary written by the preview test.";

interface ServiceDoc {
  id: number;
  summary: string;
}

async function findService(request: APIRequestContext): Promise<ServiceDoc> {
  const response = await request.get(`/api/services?where[slug][equals]=${SLUG}&depth=0`);
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { docs: ServiceDoc[] };
  const doc = body.docs[0];
  if (!doc) throw new Error("Service not found in the test database.");
  return doc;
}

test("draft, preview and publish", async ({ request, browser }) => {
  const admin = readAccount(ADMIN_FILE);
  await fullLogin(request, admin);
  const service = await findService(request);
  const original = service.summary;

  try {
    // 1. Save a draft: the public page keeps the published summary.
    const draft = await request.patch(`/api/services/${service.id}?draft=true`, {
      data: { summary: DRAFT_SUMMARY },
    });
    expect(draft.status()).toBe(200);
    const anonymous = await browser.newContext();
    const publicPage = await anonymous.newPage();
    await publicPage.goto(PAGE);
    await expect(publicPage.getByText(original).first()).toBeVisible();
    await expect(publicPage.getByText(DRAFT_SUMMARY)).toHaveCount(0);

    // 2. Preview (admin with MFA): the draft is shown.
    const state = await request.storageState();
    const adminContext = await browser.newContext({ storageState: state });
    const previewPage = await adminContext.newPage();
    await previewPage.goto(`/preview?path=${encodeURIComponent(PAGE)}`);
    await expect(previewPage).toHaveURL(new RegExp(`${PAGE}$`));
    await expect(previewPage.getByText(DRAFT_SUMMARY).first()).toBeVisible();

    // Preview is refused without MFA.
    const refused = await anonymous.request.get(`/preview?path=${encodeURIComponent(PAGE)}`, {
      maxRedirects: 0,
    });
    expect(refused.status()).toBe(307);
    expect(refused.headers()["location"]).toMatch(/^\/admin\/(login|mfa)/);
    expect((await anonymous.request.get("/preview?path=//evil.example.com")).status()).toBe(400);

    // 3. Publish: the public page updates.
    const publish = await request.patch(`/api/services/${service.id}`, {
      data: { summary: DRAFT_SUMMARY, _status: "published" },
    });
    expect(publish.status()).toBe(200);
    await expect(async () => {
      await publicPage.goto(PAGE);
      await expect(publicPage.getByText(DRAFT_SUMMARY).first()).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 15_000 });

    await adminContext.close();
    await anonymous.close();
  } finally {
    await request.patch(`/api/services/${service.id}`, {
      data: { summary: original, _status: "published" },
    });
  }
});
