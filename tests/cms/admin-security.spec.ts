import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { ADMIN_FILE, EDITOR_FILE, LOCKOUT_FILE } from "./global-setup";
import { freshCode, fullLogin, passwordLogin, readAccount, requireTestDatabase } from "./helpers";

/*
 * Phase 2 admin security (docs/cms/03_SECURITY_AND_OPS.md §2–§6). Serial. The login rate limit
 * (10 per 15 minutes per IP) is shared by every CMS test from the default address; the lockout
 * test uses its own address.
 */
test.describe.configure({ mode: "serial" });
requireTestDatabase();

/** Collections that exist at this phase. Later phases add theirs to tests/cms/collections.json. */
function protectedCollections(): string[] {
  const file = path.join(process.cwd(), "tests", "cms", "collections.json");
  const extra = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as string[]) : [];
  return ["users", "audit-log", ...extra];
}

test("anonymous REST requests are refused", async ({ request }) => {
  for (const slug of protectedCollections()) {
    const response = await request.get(`/api/${slug}`);
    expect([401, 403], `GET /api/${slug}`).toContain(response.status());
  }
});

test("anonymous requests cannot read globals or draft versions", async ({ request }) => {
  for (const slug of ["site-settings", "home", "about", "pages", "seo"]) {
    const response = await request.get(`/api/globals/${slug}`);
    expect([401, 403], `GET /api/globals/${slug}`).toContain(response.status());
  }
  const versions = await request.get("/api/services/versions");
  expect([401, 403, 404]).toContain(versions.status());
});

test("GraphQL is not served", async ({ request }) => {
  expect((await request.get("/api/graphql")).status()).toBe(404);
  expect((await request.post("/api/graphql", { data: { query: "{ __typename }" } })).status()).toBe(
    404,
  );
});

test("accounts cannot be created through the API", async ({ request }) => {
  const anonymous = await request.post("/api/users", {
    data: { email: "intruder@example.com", password: "Intruder-password-1", roles: ["approver"] },
  });
  expect([401, 403]).toContain(anonymous.status());
  const firstUser = await request.post("/api/users/first-register", {
    data: { email: "intruder@example.com", password: "Intruder-password-1" },
  });
  expect(firstUser.status()).toBeGreaterThanOrEqual(400);
  const forgot = await request.post("/api/users/forgot-password", {
    data: { email: "editor@example.com" },
  });
  expect(forgot.status()).toBe(403);
});

test("a password alone reads no data and the admin asks for the second factor", async ({
  request,
  page,
}) => {
  const admin = readAccount(ADMIN_FILE);
  const login = await passwordLogin(request, admin);
  expect(login.status()).toBe(200);
  const body = JSON.stringify(await login.json());
  expect(body).not.toContain("totpSecret");
  expect(body).not.toContain(admin.totpSecret);

  for (const slug of protectedCollections()) {
    expect([401, 403], `GET /api/${slug} without MFA`).toContain(
      (await request.get(`/api/${slug}`)).status(),
    );
  }

  // In a browser, the same password-only session lands on the MFA screen.
  const state = await request.storageState();
  await page.context().addCookies(state.cookies);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/mfa/);
  await expect(page.getByRole("heading", { name: "Enter your authenticator code" })).toBeVisible();
});

test("with a TOTP code the admin works, and the code cannot be replayed", async ({ request }) => {
  const admin = readAccount(ADMIN_FILE);
  expect((await passwordLogin(request, admin)).status()).toBe(200);
  const code = await freshCode(admin.totpSecret);
  const verify = await request.post("/api/users/mfa/verify", {
    form: { code, next: "/admin" },
    maxRedirects: 0,
  });
  expect(verify.status()).toBe(303);
  expect(verify.headers()["location"]).toBe("/admin");
  const setCookie = verify.headers()["set-cookie"] ?? "";
  expect(setCookie).toMatch(/dts-mfa=/);
  expect(setCookie).toMatch(/HttpOnly/i);
  expect(setCookie).toMatch(/SameSite=Strict/i);

  expect((await request.get("/api/users")).status()).toBe(200);
  expect((await request.get("/api/audit-log")).status()).toBe(200);

  const replay = await request.post("/api/users/mfa/verify", {
    form: { code, next: "/admin" },
    maxRedirects: 0,
  });
  expect(replay.headers()["location"]).toContain("error=code");
});

test("the browser flow reaches the dashboard after the code", async ({ page }) => {
  const admin = readAccount(ADMIN_FILE);
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(admin.email);
  await page.getByLabel(/password/i).fill(admin.password);
  await page.getByRole("button", { name: /log ?in|sign ?in/i }).click();
  await expect(page).toHaveURL(/\/admin\/mfa/);
  await page.getByLabel("Authenticator code").fill(await freshCode(admin.totpSecret));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByText(/audit log/i).first()).toBeVisible();
});

test("an editor without the approver role cannot change roles", async ({ request }) => {
  const editor = readAccount(EDITOR_FILE);
  await fullLogin(request, editor);
  const me = await request.get("/api/users/me");
  const id = ((await me.json()) as { user: { id: number } }).user.id;
  const update = await request.patch(`/api/users/${id}`, { data: { roles: ["approver"] } });
  // Field access silently drops the change; the stored roles must be unchanged.
  expect(update.status()).toBeLessThan(500);
  const after = (await (await request.get(`/api/users/${id}`)).json()) as { roles: string[] };
  expect(after.roles).toEqual(["editor"]);

  // An editor cannot change another account (here, the approver's).
  const others = (await (await request.get("/api/users?limit=10")).json()) as {
    docs: { id: number; email: string }[];
  };
  const other = others.docs.find((user) => user.email === "editor@example.com");
  if (!other) throw new Error("approver account not found");
  const takeover = await request.patch(`/api/users/${other.id}`, {
    data: { password: "Takeover-password-1" },
  });
  expect([401, 403]).toContain(takeover.status());
});

test("admin and API responses are never cached or indexed", async ({ request }) => {
  for (const route of ["/admin/login", "/api/users"]) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.headers()["x-robots-tag"], route).toBe("noindex, nofollow");
    expect(response.headers()["cache-control"], route).toContain("no-store");
    expect(response.headers()["content-security-policy"], route).toContain(
      "frame-ancestors 'none'",
    );
    expect(response.headers()["content-security-policy"], route).not.toContain("plausible.io");
  }
  const home = await request.get("/");
  expect(home.headers()["x-robots-tag"]).toBeUndefined();
  expect(home.headers()["content-security-policy"]).toContain("https://challenges.cloudflare.com");
});

test("repeated wrong passwords lock the account, then the IP limit applies", async ({
  request,
}) => {
  const account = readAccount(LOCKOUT_FILE);
  // A dedicated (documentation-range) address, so this test's attempts do not use up the
  // allowance of the other CMS tests, which all come from the default address.
  const headers = { "x-forwarded-for": "203.0.113.10" };
  const attempt = (password: string) =>
    request.post("/api/users/login", { headers, data: { email: account.email, password } });

  for (let n = 1; n <= 5; n += 1) {
    expect(
      (await attempt(`wrong-password-${n}`)).status(),
      `wrong attempt ${n}`,
    ).toBeGreaterThanOrEqual(400);
  }
  expect(
    (await attempt(account.password)).status(),
    "correct password while locked",
  ).toBeGreaterThanOrEqual(400);
  for (let n = 7; n <= 10; n += 1) {
    expect((await attempt(`wrong-password-${n}`)).status()).toBeGreaterThanOrEqual(400);
  }
  // Ten attempts from this address in 15 minutes; the eleventh is refused before any password check.
  expect((await attempt(account.password)).status()).toBe(429);
});
