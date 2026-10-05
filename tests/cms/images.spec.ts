import fs from "node:fs";
import path from "node:path";
import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import { IMAGES_FILE } from "./global-setup";
import { fullLogin, passwordLogin, readAccount, requireTestDatabase } from "./helpers";

/*
 * "Images on the website" (docs/superpowers/specs/2026-10-05-cms-images-page-design.md):
 * the page lists every spot, a change is a draft until published, other unpublished edits are
 * named before publishing, approval flags survive every write, a focal point can be published,
 * Replace file re-points only spots whose latest draft holds the old image, an image in use needs
 * a second confirmation to delete and leaves an empty spot, the Media section refuses to delete an
 * image in use, a bad upload saves nothing, and callers without a second factor get nothing from
 * the view or the actions. Test database only; fixtures are fictional.
 *
 * One full sign-in is shared by the whole file: the second-factor check allows 5 attempts per
 * 5 minutes per user. Its sign-ins use their own documentation address (TEST-NET-3) so they do not
 * count against the login limit the other CMS specs share.
 */
test.describe.configure({ mode: "serial" });
requireTestDatabase();
test.skip(
  process.env["CMS_E2E_BUILD"] !== "cms",
  "Needs a CONTENT_SOURCE=cms build (scripts/cms/test-cms.ts)",
);

const BASE = "http://localhost:3000";
const ADDRESS = { Origin: BASE, "x-forwarded-for": "203.0.113.20" };

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

type Doc = Record<string, unknown>;

let api: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
  if (!process.env["DATABASE_URI_TEST"] || process.env["CMS_E2E_BUILD"] !== "cms") return;
  api = await playwright.request.newContext({ baseURL: BASE, extraHTTPHeaders: ADDRESS });
  await fullLogin(api, readAccount(IMAGES_FILE));
});

test.afterAll(async () => {
  await api?.dispose();
});

async function adminPage(browser: Browser) {
  const context = await browser.newContext({ storageState: await api.storageState() });
  return { context, page: await context.newPage() };
}

async function uploadImage(caption: string, assetClass = "photograph"): Promise<number> {
  const res = await api.post("/api/media", {
    multipart: {
      file: { name: "test.png", mimeType: "image/png", buffer: PNG },
      _payload: JSON.stringify({
        kind: "image",
        assetClass,
        alt: "Test",
        caption,
        source: "Test",
        licence: "Test",
        usageRights: "Test",
        _status: "published",
      }),
    },
  });
  expect(res.status()).toBe(201);
  return ((await res.json()) as { doc: { id: number } }).doc.id;
}

async function json(url: string): Promise<Doc> {
  const res = await api.get(url);
  expect(res.status(), url).toBe(200);
  return (await res.json()) as Doc;
}

/** The latest draft (draft = true) or the published copy of a global. */
const globalDoc = (slug: string, draft: boolean) =>
  json(`/api/globals/${slug}?depth=0&draft=${draft}`);
const credentialDoc = (id: number, draft: boolean) =>
  json(`/api/credentials/${id}?depth=0&draft=${draft}`);
const mediaDoc = (id: number, draft: boolean) => json(`/api/media/${id}?depth=0&draft=${draft}`);

function at(doc: Doc, dotted: string): unknown {
  return dotted.split(".").reduce<unknown>((value, key) => {
    return value && typeof value === "object" ? (value as Doc)[key] : undefined;
  }, doc);
}

function idAt(doc: Doc, dotted: string): number | null {
  const value = at(doc, dotted);
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && typeof (value as Doc)["id"] === "number") {
    return (value as Doc)["id"] as number;
  }
  return null;
}

/** Writes one path of a global's latest draft, saved as a draft or published. */
async function writeGlobal(
  slug: string,
  dotted: string,
  value: unknown,
  status: "draft" | "published",
): Promise<void> {
  const doc = await globalDoc(slug, true);
  const keys = dotted.split(".");
  const last = keys.pop() ?? "";
  let target: Doc = doc;
  for (const key of keys) {
    target[key] = { ...(target[key] as Doc) };
    target = target[key] as Doc;
  }
  target[last] = value;
  const query = status === "draft" ? "?draft=true" : "";
  const res = await api.post(`/api/globals/${slug}${query}`, {
    data: { ...doc, _status: status },
  });
  expect(res.status(), `${slug} ${status}`).toBe(200);
}

/*
 * Server action ids from the build: the client chunk for the Images page calls each action by an
 * id that createServerReference receives together with the export name.
 */
function actionId(name: string): string {
  const dir = path.join(process.cwd(), ".next", "static", "chunks");
  const pattern = new RegExp(`\\(\\s*"([0-9a-f]{40,})"\\s*,[^()]*?"${name}"\\s*\\)`);
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() ?? "";
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".js")) {
        const match = pattern.exec(fs.readFileSync(full, "utf8"));
        if (match?.[1]) return match[1];
      }
    }
  }
  throw new Error(`No server action id found for ${name}.`);
}

/** Calls a server action over HTTP as a browser would, and returns the response text. */
async function callAction(
  request: APIRequestContext,
  name: string,
  args: unknown[],
): Promise<string> {
  const res = await request.post("/admin/images", {
    headers: {
      "Next-Action": actionId(name),
      "Content-Type": "text/plain;charset=UTF-8",
      Accept: "text/x-component",
    },
    data: JSON.stringify(args),
    maxRedirects: 0,
  });
  return res.text();
}

test("the page lists every image spot, with where it appears", async ({ browser }) => {
  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  await expect(
    page.getByRole("heading", { name: "Images on the website", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Home", level: 2 })).toBeVisible();
  await expect(
    page.getByText("Home page, Why DeepTsight section, beside the three pillars"),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Share images", level: 2 })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Unused images/ })).toBeVisible();
  await context.close();
});

test("anonymous and password-only visitors see nothing", async ({ page, playwright, browser }) => {
  await page.goto("/admin/images");
  await expect(page.getByText("Images on the website")).toHaveCount(0);
  const passwordOnly = await playwright.request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: ADDRESS,
  });
  expect((await passwordLogin(passwordOnly, readAccount(IMAGES_FILE))).status()).toBe(200);
  const second = await browser.newContext({ storageState: await passwordOnly.storageState() });
  const p = await second.newPage();
  await p.goto("/admin/images");
  await expect(p.getByText("Every image the website shows")).toHaveCount(0);
  await second.close();
  await passwordOnly.dispose();
});

test("the actions do nothing for anonymous and password-only callers", async ({ playwright }) => {
  const id = await uploadImage("Images test actions");
  const portrait = idAt(await globalDoc("about", true), "media.portrait");
  const owner = { kind: "global", slug: "about" };

  const anonymous = await playwright.request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: { Origin: BASE },
  });
  const passwordOnly = await playwright.request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: ADDRESS,
  });
  expect((await passwordLogin(passwordOnly, readAccount(IMAGES_FILE))).status()).toBe(200);

  for (const caller of [anonymous, passwordOnly]) {
    const text = await callAction(caller, "setSpotImage", [owner, "media.portrait", id]);
    expect(text).not.toContain("Saved as a draft");
    expect(await callAction(caller, "deleteImage", [id, true])).not.toContain("Image deleted");
    expect(await callAction(caller, "publishSpot", [owner])).not.toContain("Published.");
  }
  expect(idAt(await globalDoc("about", true), "media.portrait")).toBe(portrait);
  expect((await api.get(`/api/media/${id}?depth=0`)).status()).toBe(200);

  // The same call with a second factor works, so the refusals above are not a broken call.
  expect(await callAction(api, "setSpotImage", [owner, "media.portrait", id])).toContain(
    "Saved as a draft",
  );
  expect(idAt(await globalDoc("about", true), "media.portrait")).toBe(id);
  // Put the draft back so later tests start from the imported content.
  expect(await callAction(api, "setSpotImage", [owner, "media.portrait", portrait])).toContain(
    "Saved as a draft",
  );
  await anonymous.dispose();
  await passwordOnly.dispose();
});

test("a change is a draft until published, and other unpublished edits are named", async ({
  browser,
}) => {
  const newId = await uploadImage("Images test change");
  const before = idAt(await globalDoc("home", false), "media.why");
  expect(before).not.toBeNull();
  // Another unpublished edit in the same section (Home), so the publish warning has something to name.
  await writeGlobal("home", "hero.headline", "Images test headline", "draft");

  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator('[data-spot="home:media.why"]');
  await card.getByRole("button", { name: "Change image" }).click();
  await page.getByRole("button", { name: /Images test change/ }).click();
  await page.getByRole("button", { name: /Use this image/ }).click();
  await expect(card.getByText("Draft change waiting")).toBeVisible();

  // The draft holds the new image; the published copy (what the live site reads) does not.
  expect(idAt(await globalDoc("home", true), "media.why")).toBe(newId);
  const live = await globalDoc("home", false);
  expect(idAt(live, "media.why")).toBe(before);
  expect(at(live, "hero.headline")).not.toBe("Images test headline");
  expect(live["_status"]).toBe("published");

  await card.getByRole("button", { name: /^Publish:/ }).click();
  await expect(page.getByText(/other changes in the section are unpublished/i)).toBeVisible();
  await expect(page.getByText("hero.headline")).toBeVisible();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(card.getByText("Draft change waiting")).toHaveCount(0);

  const published = await globalDoc("home", false);
  expect(idAt(published, "media.why")).toBe(newId);
  expect(at(published, "hero.headline")).toBe("Images test headline");
  await context.close();
});

test("a badge change and its publish leave the credential's verified flag alone", async ({
  browser,
}) => {
  const list = await json(
    "/api/credentials?depth=0&limit=1&sort=id&where[verified][equals]=true&where[badge][exists]=true",
  );
  const credential = (list["docs"] as Doc[])[0];
  if (!credential) throw new Error("No verified credential with a badge in the test database.");
  const id = credential["id"] as number;
  const oldBadge = idAt(credential, "badge");
  const newBadge = await uploadImage("Images test badge", "issuer-badge");

  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator(`[data-spot="credentials:${id}:badge"]`);
  await card.getByRole("button", { name: "Change image" }).click();
  await page.getByRole("button", { name: /Images test badge/ }).click();
  await page.getByRole("button", { name: /Use this image/ }).click();
  await expect(card.getByText("Draft change waiting")).toBeVisible();

  const draft = await credentialDoc(id, true);
  expect(idAt(draft, "badge")).toBe(newBadge);
  expect(draft["verified"]).toBe(true);
  const live = await credentialDoc(id, false);
  expect(idAt(live, "badge")).toBe(oldBadge);
  expect(live["verified"]).toBe(true);

  await card.getByRole("button", { name: /^Publish:/ }).click();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(card.getByText("Draft change waiting")).toHaveCount(0);
  const published = await credentialDoc(id, false);
  expect(idAt(published, "badge")).toBe(newBadge);
  expect(published["verified"]).toBe(true);
  expect(published["_status"]).toBe("published");
  // The new badge was never approved by these writes.
  expect((await mediaDoc(newBadge, false))["approvedForPublic"]).not.toBe(true);
  await context.close();
});

test("a focal point is saved as a draft and published with the image", async ({ browser }) => {
  const list = await json(
    "/api/credentials?depth=0&limit=50&sort=id&where[verified][equals]=true&where[badge][exists]=true",
  );
  // A credential whose badge is an approved, published image (imported issuer badges are).
  let credentialId = 0;
  let mediaId = 0;
  for (const doc of list["docs"] as Doc[]) {
    const badge = idAt(doc, "badge");
    if (badge === null) continue;
    const media = await mediaDoc(badge, false);
    if (media["approvedForPublic"] === true && media["_status"] === "published") {
      credentialId = doc["id"] as number;
      mediaId = badge;
      break;
    }
  }
  expect(mediaId).toBeGreaterThan(0);
  const before = await mediaDoc(mediaId, false);

  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator(`[data-spot="credentials:${credentialId}:badge"]`);
  await card.getByRole("button", { name: "Set focal point" }).click();
  const dialog = page.getByRole("dialog");
  const target = dialog.getByRole("button", { name: /Focal point at/ });
  await target.focus();
  for (let i = 0; i < 3; i += 1) await page.keyboard.press("Shift+ArrowLeft");
  await dialog.getByRole("button", { name: /Save focal point/ }).click();
  await expect(card.getByText("Focal point change waiting")).toBeVisible();

  const draft = await mediaDoc(mediaId, true);
  expect(draft["focalX"]).not.toBe(before["focalX"]);
  expect((await mediaDoc(mediaId, false))["focalX"]).toBe(before["focalX"]);

  await card.getByRole("button", { name: /^Publish image:/ }).click();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(card.getByText("Focal point change waiting")).toHaveCount(0);

  const after = await mediaDoc(mediaId, false);
  expect(after["focalX"]).toBe(draft["focalX"]);
  expect(after["_status"]).toBe("published");
  expect(after["approvedForPublic"]).toBe(true);
  for (const key of ["filename", "mimeType", "filesize", "width", "height", "url"]) {
    expect(after[key], key).toEqual(before[key]);
  }
  // The file still resolves, for the public as well (approved and published).
  const file = await (
    await browser.newContext()
  ).request.get(`/api/media/file/${encodeURIComponent(String(after["filename"]))}`);
  expect(file.status()).toBe(200);
  await context.close();
});

test("Replace file re-points only spots whose latest draft holds the old image", async ({
  browser,
}) => {
  const oldId = await uploadImage("Images test old file");
  const otherId = await uploadImage("Images test other file");
  // Home "Problems addressed" and About "Desk image" hold the old image in their latest drafts;
  // About "Site image" shows it only in the published copy, its newer draft chose another image.
  await writeGlobal("home", "media.problems", oldId, "draft");
  await writeGlobal("about", "media.site", oldId, "published");
  await writeGlobal("about", "media.desk", oldId, "draft");
  await writeGlobal("about", "media.site", otherId, "draft");
  const homeLive = idAt(await globalDoc("home", false), "media.problems");
  const deskLive = idAt(await globalDoc("about", false), "media.desk");

  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator('[data-spot="home:media.problems"]');
  await card.getByRole("button", { name: "Replace file" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("New image file").setInputFiles({
    name: "replacement.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await dialog.getByLabel(/still apply to the new image/).check();
  await dialog.getByRole("button", { name: /Replace file \(save as draft\)/ }).click();
  await expect(page.getByText(/2 places now use the new image as a draft/)).toBeVisible();
  await expect(page.getByText(/1 place left unchanged/)).toBeVisible();

  const home = await globalDoc("home", true);
  const newId = idAt(home, "media.problems");
  expect(newId).not.toBeNull();
  expect(newId).not.toBe(oldId);
  expect(newId).not.toBe(otherId);
  const about = await globalDoc("about", true);
  expect(idAt(about, "media.desk")).toBe(newId);
  expect(idAt(about, "media.site")).toBe(otherId);
  // Published copies are untouched until someone publishes.
  const aboutLive = await globalDoc("about", false);
  expect(idAt(aboutLive, "media.site")).toBe(oldId);
  expect(idAt(aboutLive, "media.desk")).toBe(deskLive);
  expect(idAt(await globalDoc("home", false), "media.problems")).toBe(homeLive);

  // A new record, with the old record's words, not approved.
  const created = await mediaDoc(newId ?? 0, true);
  const old = await mediaDoc(oldId, true);
  expect(created["approvedForPublic"]).not.toBe(true);
  expect(created["caption"]).toBe(old["caption"]);
  expect(created["filename"]).not.toBe(old["filename"]);
  await context.close();
});

test("an unused image is deleted after one confirmation", async ({ browser }) => {
  await uploadImage("Images test unused");
  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  await page.getByRole("tab", { name: /Unused images/ }).click();
  const card = page.locator("li", { hasText: "Images test unused" }).first();
  await card.getByRole("button", { name: "Delete image" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete image" }).click();
  await expect(page.getByText("Images test unused")).toHaveCount(0);
  await context.close();
});

test("an image in use needs a second confirmation, and Media refuses to delete it", async ({
  browser,
}) => {
  const id = await uploadImage("Images test in use");
  const livePicture = idAt(await globalDoc("pages", false), "contact.figure");
  // Put it in the Contact page image spot as a draft, via the page's own flow.
  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator('[data-spot="pages:contact.figure"]');
  await card.getByRole("button", { name: "Change image" }).click();
  await page.getByRole("button", { name: /Images test in use/ }).click();
  await page.getByRole("button", { name: /Use this image/ }).click();
  await expect(card.getByText("Draft change waiting")).toBeVisible();

  // The Media section's own delete is refused and points to the Images page.
  const refused = await api.delete(`/api/media/${id}`);
  expect(refused.status()).toBe(409);
  expect(await refused.text()).toContain("Images on the website");

  // The Images page asks twice.
  await card.getByRole("button", { name: "Delete image" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("This image is in use.")).toBeVisible();
  await expect(dialog.getByText(/Contact page/)).toBeVisible();
  const confirm = dialog.getByRole("button", { name: "Delete image" });
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel(/I understand these spots will be left without an image/).check();
  await confirm.click();
  await expect(card.getByText(/No image — the page shows a placeholder/).first()).toBeVisible();
  expect((await api.get(`/api/media/${id}?depth=0`)).status()).toBe(404);
  expect(idAt(await globalDoc("pages", true), "contact.figure")).toBeNull();
  expect(idAt(await globalDoc("pages", false), "contact.figure")).toBe(livePicture);

  // An empty required spot cannot be published (Payload's own required-field check), in words.
  await card.getByRole("button", { name: /^Publish:/ }).click();
  await page.getByRole("button", { name: "Publish now" }).click();
  const alert = page.getByRole("dialog").getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).not.toHaveText("Something went wrong. Nothing was changed.");
  expect(idAt(await globalDoc("pages", false), "contact.figure")).toBe(livePicture);

  const contact = await globalDoc("pages", true);
  const publish = await api.post("/api/globals/pages", {
    data: { ...contact, _status: "published" },
  });
  expect(publish.status()).toBeGreaterThanOrEqual(400);
  await context.close();
});

test("a file that is not an image saves nothing", async () => {
  const before = await json("/api/media?limit=1&depth=0");
  const res = await api.post("/api/media", {
    multipart: {
      file: { name: "note.txt", mimeType: "text/plain", buffer: Buffer.from("not an image") },
      _payload: JSON.stringify({
        kind: "image",
        assetClass: "photograph",
        alt: "x",
        caption: "x",
        source: "x",
        licence: "x",
        usageRights: "x",
        _status: "published",
      }),
    },
  });
  expect(res.status()).toBeGreaterThanOrEqual(400);
  const after = await json("/api/media?limit=1&depth=0");
  expect(after["totalDocs"]).toBe(before["totalDocs"]);
});
