import fs from "node:fs";
import path from "node:path";
import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import { globalSpots } from "../../src/cms/images/spots";
import { IMAGES_FILE } from "./global-setup";
import { fullLogin, passwordLogin, readAccount, requireTestDatabase } from "./helpers";

/*
 * "Images on the website" (docs/superpowers/specs/2026-10-05-cms-images-page-design.md §6):
 * the page lists every spot, a change is a draft until published (preview shows it, the live
 * page does not), other unpublished edits are named before publishing, approval flags survive
 * every write, a focal point can be published, Replace file re-points only spots whose latest
 * draft holds the old image and creates a new unapproved record, an image in use needs a second
 * confirmation to delete and leaves an empty spot, the Media section refuses to delete an image in
 * use, a bad upload saves nothing, and callers without a second factor get nothing from the view
 * or the actions. Test database only; fixtures are fictional.
 *
 * One full sign-in is shared by the whole file: the second-factor check allows 5 attempts per
 * 5 minutes per user. Its sign-ins use their own documentation address (TEST-NET-3) so they do not
 * count against the login limit the other CMS specs share. Captions carry a per-run tag so the
 * file can run again on the same database.
 */
test.describe.configure({ mode: "serial" });
requireTestDatabase();
test.skip(
  process.env["CMS_E2E_BUILD"] !== "cms",
  "Needs a CONTENT_SOURCE=cms build (scripts/cms/test-cms.ts)",
);

const BASE = "http://localhost:3000";
const ADDRESS = { Origin: BASE, "x-forwarded-for": "203.0.113.20" };
const RUN = Date.now().toString(36);
const tag = (words: string): string => `${words} ${RUN}`;
const NOT_ALLOWED = "You are not allowed to do this.";
const AFTER_REFRESH = { timeout: 15_000 };

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

type Doc = Record<string, unknown>;

let api: APIRequestContext;
/** site-settings' approval flag before any test wrote anything; checked again at the end. */
let insightsBefore: unknown;

test.beforeAll(async ({ playwright }) => {
  if (!process.env["DATABASE_URI_TEST"] || process.env["CMS_E2E_BUILD"] !== "cms") return;
  api = await playwright.request.newContext({ baseURL: BASE, extraHTTPHeaders: ADDRESS });
  await fullLogin(api, readAccount(IMAGES_FILE));
  insightsBefore = (await json("/api/globals/site-settings?depth=0"))["insightsEnabled"];
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

/** The latest draft (draft = true) or the published copy of a document. */
const globalDoc = (slug: string, draft: boolean) =>
  json(`/api/globals/${slug}?depth=0&draft=${draft}`);
const credentialDoc = (id: number, draft: boolean) =>
  json(`/api/credentials/${id}?depth=0&draft=${draft}`);
const mediaDoc = (id: number, draft: boolean) => json(`/api/media/${id}?depth=0&draft=${draft}`);
const docsOf = async (url: string) => (await json(url))["docs"] as Doc[];

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

/** A credential whose latest badge is an approved, published image (imported badges are). */
async function credentialWithApprovedBadge(): Promise<{ credentialId: number; mediaId: number }> {
  const docs = await docsOf(
    "/api/credentials?depth=0&limit=100&sort=id&draft=true&where[badge][exists]=true",
  );
  for (const doc of docs) {
    const badge = idAt(doc, "badge");
    if (badge === null) continue;
    const media = await mediaDoc(badge, false);
    if (media["approvedForPublic"] === true && media["_status"] === "published") {
      return { credentialId: doc["id"] as number, mediaId: badge };
    }
  }
  throw new Error("No credential with an approved badge in the test database.");
}

/*
 * Server action ids from the build. The server reference manifest names each action's export and
 * source file; the client chunk regex is only a fallback should a bundler leave those out.
 */
interface ManifestEntry {
  exportedName?: string;
  filename?: string;
}

function actionId(name: string): string {
  const manifest = path.join(process.cwd(), ".next", "server", "server-reference-manifest.json");
  if (fs.existsSync(manifest)) {
    const parsed = JSON.parse(fs.readFileSync(manifest, "utf8")) as {
      node?: Record<string, ManifestEntry>;
    };
    for (const [id, entry] of Object.entries(parsed.node ?? {})) {
      const file = (entry.filename ?? "").replaceAll("\\", "/");
      if (entry.exportedName === name && file.includes("cms/images/actions")) return id;
    }
  }
  const pattern = new RegExp(`\\(\\s*"([0-9a-f]{40,})"\\s*,[^()]*?"${name}"\\s*\\)`);
  const stack = [path.join(process.cwd(), ".next", "static", "chunks")];
  while (stack.length > 0) {
    const current = stack.pop() ?? "";
    if (!fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".js")) {
        const match = pattern.exec(fs.readFileSync(full, "utf8"));
        if (match?.[1]) return match[1];
      }
    }
  }
  throw new Error(
    `No server action id for ${name}: neither .next/server/server-reference-manifest.json ` +
      "(exportedName + filename) nor the client chunks name it. Is the build present?",
  );
}

/** Calls a server action over HTTP as the Images page does. */
async function callAction(
  request: APIRequestContext,
  name: string,
  args: unknown[],
): Promise<{ status: number; text: string }> {
  const res = await request.post("/admin/images", {
    headers: {
      "Next-Action": actionId(name),
      "Content-Type": "text/plain;charset=UTF-8",
      Accept: "text/x-component",
    },
    data: JSON.stringify(args),
    maxRedirects: 0,
  });
  return { status: res.status(), text: await res.text() };
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

  // Every registered spot has a card: the globals', three per service, one per credential badge.
  const expected = globalSpots().map((spot) => spot.id);
  for (const service of await docsOf("/api/services?depth=0&limit=100&draft=true")) {
    for (const field of ["media.hero", "media.detail", "seo.ogImage"]) {
      expected.push(`services:${String(service["id"])}:${field}`);
    }
  }
  const badged = new Set<number>();
  for (const draft of [true, false]) {
    const docs = await docsOf(`/api/credentials?depth=0&limit=100&draft=${draft}`);
    for (const doc of docs) if (idAt(doc, "badge") !== null) badged.add(doc["id"] as number);
  }
  for (const id of badged) expected.push(`credentials:${id}:badge`);
  for (const id of expected) {
    await expect(page.locator(`[data-spot="${id}"]`), id).toHaveCount(1);
  }
  await expect(page.locator("[data-spot]")).toHaveCount(expected.length);
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
  const response = await p.goto("/admin/images");
  expect(response?.status() ?? 0).toBeLessThan(500);
  await expect(p).toHaveURL(/\/admin\/(mfa|login)/);
  await expect(p.getByRole("heading", { name: "Images on the website", level: 1 })).toHaveCount(0);
  await expect(p.getByText("Every image the website shows")).toHaveCount(0);
  await second.close();
  await passwordOnly.dispose();
});

test("every action refuses anonymous and password-only callers", async ({ playwright }) => {
  const testId = await uploadImage(tag("Images test actions"));
  const owner = { kind: "global", slug: "about" };
  const portrait = idAt(await globalDoc("about", true), "media.portrait");
  if (portrait === null) throw new Error("About has no portrait in the test database.");

  const snapshot = async () => {
    const aboutDraft = await globalDoc("about", true);
    const aboutLive = await globalDoc("about", false);
    const mediaDraft = await mediaDoc(portrait, true);
    const mediaLive = await mediaDoc(portrait, false);
    return {
      draftPortrait: idAt(aboutDraft, "media.portrait"),
      livePortrait: idAt(aboutLive, "media.portrait"),
      liveUpdated: aboutLive["updatedAt"],
      liveStatus: aboutLive["_status"],
      mediaDraft: [mediaDraft["focalX"], mediaDraft["focalY"], mediaDraft["updatedAt"]],
      mediaLive: [mediaLive["focalX"], mediaLive["_status"], mediaLive["updatedAt"]],
      testImage: (await api.get(`/api/media/${testId}?depth=0`)).status(),
    };
  };
  const before = await snapshot();

  const anonymous = await playwright.request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: { Origin: BASE },
  });
  const passwordOnly = await playwright.request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: ADDRESS,
  });
  expect((await passwordLogin(passwordOnly, readAccount(IMAGES_FILE))).status()).toBe(200);

  const calls: [string, unknown[]][] = [
    ["setSpotImage", [owner, "media.portrait", testId]],
    ["publishSpot", [owner]],
    ["saveFocalPoint", [portrait, 10, 10]],
    ["publishImage", [portrait]],
    ["swapImage", [portrait, testId]],
    ["deleteImage", [testId, true]],
  ];
  for (const [who, caller] of [
    ["anonymous", anonymous],
    ["password only", passwordOnly],
  ] as const) {
    for (const [name, args] of calls) {
      const result = await callAction(caller, name, args);
      expect(result.status, `${who} ${name}`).toBeLessThan(500);
      expect(result.text, `${who} ${name}`).toContain(NOT_ALLOWED);
    }
  }
  expect(await snapshot()).toEqual(before);

  // The same call with a second factor works, so the refusals above are not a broken call.
  const allowed = await callAction(api, "setSpotImage", [owner, "media.portrait", testId]);
  expect(allowed.text).toContain("Saved as a draft");
  expect(idAt(await globalDoc("about", true), "media.portrait")).toBe(testId);
  // Put the draft back so later tests start from the imported content.
  const back = await callAction(api, "setSpotImage", [owner, "media.portrait", portrait]);
  expect(back.text).toContain("Saved as a draft");
  await anonymous.dispose();
  await passwordOnly.dispose();
});

test("a change is a draft until published, and other unpublished edits are named", async ({
  browser,
  playwright,
}) => {
  const caption = tag("Images test change");
  const headline = tag("Images test headline");
  const newId = await uploadImage(caption);
  const before = idAt(await globalDoc("home", false), "media.why");
  expect(before).not.toBeNull();
  // Another unpublished edit in the same section (Home), so the publish warning has something to name.
  await writeGlobal("home", "hero.headline", headline, "draft");

  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator('[data-spot="home:media.why"]');
  await card.getByRole("button", { name: "Change image" }).click();
  await page.getByRole("button", { name: new RegExp(caption) }).click();
  await page.getByRole("button", { name: /Use this image/ }).click();
  await expect(card.getByText("Draft change waiting")).toBeVisible(AFTER_REFRESH);

  // The draft holds the new image; the published copy (what the live site reads) does not.
  expect(idAt(await globalDoc("home", true), "media.why")).toBe(newId);
  const live = await globalDoc("home", false);
  expect(idAt(live, "media.why")).toBe(before);
  expect(at(live, "hero.headline")).not.toBe(headline);
  expect(live["_status"]).toBe("published");

  // Preview shows the draft; the public page does not.
  const preview = await context.newPage();
  await preview.goto(`/preview?path=${encodeURIComponent("/")}`);
  await expect(preview.getByText(caption).first()).toBeVisible();
  await preview.close();
  const visitor = await playwright.request.newContext({ baseURL: BASE });
  expect(await (await visitor.get("/")).text()).not.toContain(caption);

  await card.getByRole("button", { name: /^Publish:/ }).click();
  await expect(page.getByText(/other changes in the section are unpublished/i)).toBeVisible();
  await expect(page.getByText("hero.headline")).toBeVisible();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(card.getByText("Draft change waiting")).toHaveCount(0, AFTER_REFRESH);

  const published = await globalDoc("home", false);
  expect(idAt(published, "media.why")).toBe(newId);
  expect(at(published, "hero.headline")).toBe(headline);
  // Publishing revalidates the public page.
  await expect(async () => {
    expect(await (await visitor.get("/")).text()).toContain(caption);
  }).toPass(AFTER_REFRESH);
  await visitor.dispose();
  await context.close();
});

test("a badge change and its publish leave the approval flags alone", async ({ browser }) => {
  const docs = await docsOf(
    "/api/credentials?depth=0&limit=1&sort=id&where[verified][equals]=true&where[badge][exists]=true",
  );
  const credential = docs[0];
  if (!credential) throw new Error("No verified credential with a badge in the test database.");
  const id = credential["id"] as number;
  const oldBadge = idAt(credential, "badge");
  if (oldBadge === null) throw new Error("The credential has no badge.");
  const oldApproved = (await mediaDoc(oldBadge, false))["approvedForPublic"];
  const caption = tag("Images test badge");
  const newBadge = await uploadImage(caption, "issuer-badge");

  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator(`[data-spot="credentials:${id}:badge"]`);
  await card.getByRole("button", { name: "Change image" }).click();
  await page.getByRole("button", { name: new RegExp(caption) }).click();
  await page.getByRole("button", { name: /Use this image/ }).click();
  await expect(card.getByText("Draft change waiting")).toBeVisible(AFTER_REFRESH);

  const draft = await credentialDoc(id, true);
  expect(idAt(draft, "badge")).toBe(newBadge);
  expect(draft["verified"]).toBe(true);
  const live = await credentialDoc(id, false);
  expect(idAt(live, "badge")).toBe(oldBadge);
  expect(live["verified"]).toBe(true);

  await card.getByRole("button", { name: /^Publish:/ }).click();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(card.getByText("Draft change waiting")).toHaveCount(0, AFTER_REFRESH);
  const published = await credentialDoc(id, false);
  expect(idAt(published, "badge")).toBe(newBadge);
  expect(published["verified"]).toBe(true);
  expect(published["_status"]).toBe("published");
  // Neither image's approval was changed by these writes.
  expect((await mediaDoc(newBadge, false))["approvedForPublic"]).not.toBe(true);
  expect((await mediaDoc(oldBadge, false))["approvedForPublic"]).toBe(oldApproved);
  await context.close();
});

test("a focal point is saved as a draft and published with the image", async ({
  browser,
  playwright,
}) => {
  test.setTimeout(60_000);
  const { credentialId, mediaId } = await credentialWithApprovedBadge();
  const before = await mediaDoc(mediaId, false);

  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator(`[data-spot="credentials:${credentialId}:badge"]`);
  await card.getByRole("button", { name: "Set focal point" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /Focal point at/ }).focus();
  for (let i = 0; i < 3; i += 1) await page.keyboard.press("Shift+ArrowLeft");
  await dialog.getByRole("button", { name: /Save focal point/ }).click();
  await expect(card.getByText("Focal point change waiting")).toBeVisible(AFTER_REFRESH);

  const draft = await mediaDoc(mediaId, true);
  expect(draft["focalX"]).not.toBe(before["focalX"]);
  expect((await mediaDoc(mediaId, false))["focalX"]).toBe(before["focalX"]);

  await card.getByRole("button", { name: /^Publish image:/ }).click();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(card.getByText("Focal point change waiting")).toHaveCount(0, AFTER_REFRESH);

  const after = await mediaDoc(mediaId, false);
  expect(after["focalX"]).toBe(draft["focalX"]);
  expect(after["_status"]).toBe("published");
  expect(after["approvedForPublic"]).toBe(true);
  for (const key of ["filename", "mimeType", "filesize", "width", "height", "url"]) {
    expect(after[key], key).toEqual(before[key]);
  }
  // The file still resolves, for the public as well (approved and published).
  const visitor = await playwright.request.newContext({ baseURL: BASE });
  const file = await visitor.get(
    `/api/media/file/${encodeURIComponent(String(after["filename"]))}`,
  );
  expect(file.status()).toBe(200);
  await visitor.dispose();
  await context.close();
});

test("Replace file re-points only spots whose latest draft holds the old image", async ({
  browser,
}) => {
  test.setTimeout(60_000);
  const oldId = await uploadImage(tag("Images test old file"));
  const otherId = await uploadImage(tag("Images test other file"));
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
  await expect(page.getByText(/2 places now use the new image as a draft/)).toBeVisible(
    AFTER_REFRESH,
  );
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

  // A new record, with the old record's words.
  const created = await mediaDoc(newId ?? 0, true);
  const old = await mediaDoc(oldId, true);
  expect(created["caption"]).toBe(old["caption"]);
  expect(created["filename"]).not.toBe(old["filename"]);
  await context.close();
});

test("Replace file on an approved image creates a new record that is not approved", async ({
  browser,
}) => {
  test.setTimeout(60_000);
  const { credentialId, mediaId } = await credentialWithApprovedBadge();
  const drafts = await docsOf("/api/credentials?depth=0&limit=100&draft=true");
  const holders = drafts.filter((doc) => idAt(doc, "badge") === mediaId).map((doc) => doc["id"]);
  const publishedHolders = (await docsOf("/api/credentials?depth=0&limit=100"))
    .filter((doc) => idAt(doc, "badge") === mediaId)
    .map((doc) => doc["id"] as number);

  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator(`[data-spot="credentials:${credentialId}:badge"]`);
  await card.getByRole("button", { name: "Replace file" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("New image file").setInputFiles({
    name: "replacement-badge.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await dialog.getByLabel(/still apply to the new image/).check();
  await dialog.getByRole("button", { name: /Replace file \(save as draft\)/ }).click();
  await expect(page.getByText(/now uses? the new image as a draft/)).toBeVisible(AFTER_REFRESH);

  const newId = idAt(await credentialDoc(credentialId, true), "badge");
  expect(newId).not.toBeNull();
  expect(newId).not.toBe(mediaId);
  for (const id of holders) {
    expect(idAt(await credentialDoc(id as number, true), "badge"), `credential ${String(id)}`).toBe(
      newId,
    );
  }
  for (const id of publishedHolders) {
    expect(idAt(await credentialDoc(id, false), "badge"), `published ${id}`).toBe(mediaId);
  }
  const created = await mediaDoc(newId ?? 0, true);
  expect(created["approvedForPublic"]).not.toBe(true);
  expect(created["assetClass"]).toBe("issuer-badge");
  expect((await mediaDoc(mediaId, false))["approvedForPublic"]).toBe(true);
  await context.close();
});

test("an unused image is deleted after one confirmation", async ({ browser }) => {
  const caption = tag("Images test unused");
  const id = await uploadImage(caption);
  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  await page.getByRole("tab", { name: /Unused images/ }).click();
  const card = page.locator("li", { hasText: caption }).first();
  await card.getByRole("button", { name: "Delete image" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete image" }).click();
  await expect(page.getByText(caption)).toHaveCount(0, AFTER_REFRESH);
  expect((await api.get(`/api/media/${id}?depth=0`)).status()).toBe(404);
  await context.close();
});

test("an image in use needs a second confirmation, and Media refuses to delete it", async ({
  browser,
}) => {
  const caption = tag("Images test in use");
  const id = await uploadImage(caption);
  const livePicture = idAt(await globalDoc("pages", false), "contact.figure");
  // Put it in the Contact page image spot as a draft, via the page's own flow.
  const { context, page } = await adminPage(browser);
  await page.goto("/admin/images");
  const card = page.locator('[data-spot="pages:contact.figure"]');
  await card.getByRole("button", { name: "Change image" }).click();
  await page.getByRole("button", { name: new RegExp(caption) }).click();
  await page.getByRole("button", { name: /Use this image/ }).click();
  await expect(card.getByText("Draft change waiting")).toBeVisible(AFTER_REFRESH);

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
  await expect(card.getByText(/No image — the page shows a placeholder/).first()).toBeVisible(
    AFTER_REFRESH,
  );
  expect((await api.get(`/api/media/${id}?depth=0`)).status()).toBe(404);
  expect(idAt(await globalDoc("pages", true), "contact.figure")).toBeNull();
  expect(idAt(await globalDoc("pages", false), "contact.figure")).toBe(livePicture);

  // An empty required spot cannot be published (Payload's own required-field check), in words
  // that name the field.
  await card.getByRole("button", { name: /^Publish:/ }).click();
  await page.getByRole("button", { name: "Publish now" }).click();
  const alert = page.getByRole("dialog").getByRole("alert");
  await expect(alert).toBeVisible(AFTER_REFRESH);
  await expect(alert).toContainText(/figure/i);
  expect(idAt(await globalDoc("pages", false), "contact.figure")).toBe(livePicture);

  const contact = await globalDoc("pages", true);
  const publish = await api.post("/api/globals/pages", {
    data: { ...contact, _status: "published" },
  });
  expect(publish.status()).toBeGreaterThanOrEqual(400);
  expect(await publish.text()).toMatch(/figure/i);
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

test("no write on this page changed the site's insights flag", async () => {
  const now = (await json("/api/globals/site-settings?depth=0"))["insightsEnabled"];
  expect(now).toBe(insightsBefore);
});
