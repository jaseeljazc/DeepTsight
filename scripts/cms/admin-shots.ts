/**
 * Screenshots of the CMS admin for design review (development tool).
 *
 *   tsx scripts/cms/admin-shots.ts <outDir>
 *
 * Starts `next dev` on SHOTS_PORT (default 3000) in CMS mode against DATABASE_URI, signs in with a throwaway
 * account (design-check@example.com, created and deleted by this script), and captures the main
 * screens at desktop and phone width into <outDir> (git-ignored under .data/). The port (SHOTS_PORT, default 3000) must be free.
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { connectionString } from "./lib/db";
import { OFFLINE_ENV } from "./lib/server";
import { totpCode, timeStep } from "../../src/cms/mfa/totp";

const PORT = Number(process.env.SHOTS_PORT ?? 3000);
const BASE = `http://localhost:${PORT}`;
const EMAIL = "design-check@example.com";
const outDir = path.resolve(process.argv[2] ?? path.join(".data", "shots"));
const accountFile = path.join(".data", "design-check.json");

const tsxBin = path.join("node_modules", "tsx", "dist", "cli.mjs");
const runTsx = (script: string, args: string[]) =>
  spawnSync(process.execPath, [tsxBin, script, ...args], { encoding: "utf8", env: process.env });

function kill(child: ChildProcess) {
  if (child.pid === undefined || child.exitCode !== null) return;
  spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
}

async function waitFor(url: string, ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      if ((await fetch(url, { redirect: "manual" })).status > 0) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Dev server did not start in time.");
}

/** Opens the sidebar if it is closed (it starts closed in a fresh browser profile). */
async function openNav(page: Page) {
  if ((await page.locator(".nav--nav-open").count()) > 0) return;
  await page.locator(".nav-toggler:visible").first().click();
  await page.locator(".nav--nav-open").waitFor({ timeout: 15_000 });
  await page.waitForTimeout(1200); // the sidebar animates open; capture it finished
}

/** Loads a page and lets it settle; "network idle" never arrives on pages that poll. */
async function open(page: Page, url: string) {
  await page.goto(url, { waitUntil: "load", timeout: 180_000 });
  await page.waitForTimeout(2500);
}

async function signIn(page: Page, account: { password: string; totpSecret: string }) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle", timeout: 180_000 });
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).fill(account.password);
  await page.getByRole("button", { name: /log ?in/i }).click();
  await page.waitForURL(/\/admin\/mfa/, { timeout: 120_000 });
  await page.getByLabel("Authenticator code").fill(totpCode(account.totpSecret, timeStep()));
  await page.getByRole("button", { name: "Verify" }).click();
  await page.waitForURL(/\/admin\/?$/, { timeout: 120_000 });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const create = runTsx(path.join("scripts", "cms", "create-admin.ts"), [
    "--db",
    "DATABASE_URI",
    "--email",
    EMAIL,
    "--name",
    "Design Check",
    "--out",
    accountFile,
    "--json",
  ]);
  if (create.status !== 0) throw new Error(`create-admin failed: ${create.stderr.split("\n")[0]}`);
  const account = JSON.parse(fs.readFileSync(accountFile, "utf8")) as {
    password: string;
    totpSecret: string;
  };

  const seed = runTsx(path.join("scripts", "cms", "demo-enquiries.ts"), [
    "--db",
    "DATABASE_URI",
    "add",
  ]);
  console.log(seed.stdout.trim() || seed.stderr.trim());

  // Next allows one dev server per project folder: reuse one that is already running (and leave it
  // running) rather than start a second that would refuse to boot.
  const running = await fetch(`${BASE}/api/graphql`, { redirect: "manual" }).then(
    () => true,
    () => false,
  );
  const server = running
    ? null
    : spawn(
        process.execPath,
        [path.join("node_modules", "next", "dist", "bin", "next"), "dev", "-p", String(PORT)],
        {
          env: {
            ...process.env,
            ...OFFLINE_ENV,
            CONTENT_SOURCE: "cms",
            DATABASE_URI: connectionString("DATABASE_URI"),
          },
          stdio: "ignore",
        },
      );
  const browser = await chromium.launch();
  try {
    await waitFor(`${BASE}/api/graphql`, 120_000);
    const sizes = [
      { name: "desktop", width: 1440, height: 900 },
      { name: "phone", width: 390, height: 844 },
    ];
    for (const size of sizes) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
      });
      const page = await context.newPage();
      await open(page, `${BASE}/admin/login`);
      await page.getByLabel(/email/i).waitFor({ timeout: 120_000 });
      await page.screenshot({ path: path.join(outDir, `${size.name}-login.png`) });
      await signIn(page, account);
      const isDesktop = size.name === "desktop";
      const shots: [string, string][] = [
        ["dashboard", "/admin"],
        ["service-edit", "/admin/collections/services/1"],
        ["enquiries-list", "/admin/collections/enquiries"],
        ["site-settings", "/admin/globals/site-settings"],
      ];
      const phoneShots = new Set(["dashboard", "service-edit"]);
      for (const [name, route] of shots) {
        if (!isDesktop && !phoneShots.has(name)) continue;
        await open(page, `${BASE}${route}`);
        // Desktop shows the sidebar open throughout; on the phone it is a drawer, captured once below.
        if (isDesktop) await openNav(page);
        await page.screenshot({
          path: path.join(outDir, `${size.name}-${name}.png`),
          fullPage: size.name === "desktop" && name === "dashboard",
        });
      }
      if (!isDesktop) {
        await open(page, `${BASE}/admin`);
        await openNav(page);
        await page.screenshot({ path: path.join(outDir, `${size.name}-nav-open.png`) });
      }
      await context.close();
    }
    console.log(`Screenshots written to ${path.relative(process.cwd(), outDir)}`);
  } finally {
    await browser.close();
    if (server) kill(server);
    const unseed = runTsx(path.join("scripts", "cms", "demo-enquiries.ts"), [
      "--db",
      "DATABASE_URI",
      "remove",
    ]);
    console.log(unseed.stdout.trim() || unseed.stderr.trim());
    const cleanup = runTsx(path.join("scripts", "cms", "remove-user.ts"), [
      "--db",
      "DATABASE_URI",
      "--email",
      EMAIL,
    ]);
    fs.rmSync(accountFile, { force: true });
    console.log(cleanup.stdout.trim() || cleanup.stderr.trim());
  }
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
