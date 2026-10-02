/**
 * Parity snapshot: starts the production build on port 3100, visits every public route and writes
 * one JSON file per route with what a visitor and a crawler see. Compare two snapshots with
 * parity-compare.ts.
 *
 *   tsx scripts/cms/parity-snapshot.ts <outDir> [--port 3100]
 *
 * Run `pnpm build` first. Uses Playwright's Chromium (already a dev dependency) to read the DOM,
 * with JavaScript disabled so the snapshot reflects the server-rendered page.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startServer } from "./lib/server";

const HEADER_NAMES = [
  "content-security-policy",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "strict-transport-security",
  "x-content-type-options",
] as const;

const EXTRA_ROUTES = [
  "/contact/thank-you",
  "/legal/privacy",
  "/legal/terms",
  "/legal/accessibility",
  "/cms-parity-unknown-path",
];

const TEXT_ROUTES = ["/robots.txt", "/sitemap.xml", "/.well-known/security.txt"];

interface DomData {
  title: string;
  description: string | null;
  robots: string | null;
  canonical: string | null;
  jsonLd: string[];
  header: string;
  main: string;
  footer: string;
  images: { alt: string | null; src: string }[];
}

/**
 * Runs in the page. Kept as a string: tsx's transform adds helper calls to functions, which do
 * not exist in the browser.
 */
const DOM_SCRIPT = `(() => {
  const text = (selector) => {
    const element = document.querySelector(selector);
    return element ? element.innerText.replace(/\s+/g, " ").trim() : "";
  };
  const meta = (name) => document.querySelector('meta[name="' + name + '"]')?.getAttribute("content") ?? null;
  return {
    title: document.title,
    description: meta("description"),
    robots: meta("robots"),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent ?? ""),
    header: text("header"),
    main: text("main"),
    footer: text("footer"),
    images: [...document.querySelectorAll("img")].map((img) => ({ alt: img.getAttribute("alt"), src: img.getAttribute("src") ?? "" })),
  };
})()`;

export interface RouteSnapshot {
  route: string;
  status: number;
  headers: Record<string, string | null>;
  title?: string;
  description?: string | null;
  canonical?: string | null;
  robots?: string | null;
  jsonLd?: unknown[];
  header?: string;
  main?: string;
  footer?: string;
  images?: { alt: string | null; file: string }[];
  body?: string;
}

function fileNameFor(route: string): string {
  const name = route === "/" ? "index" : route.replace(/^\//, "").replace(/[/.]/g, "_");
  return `${name}.json`;
}

/** The file name behind an image URL, including next/image's `?url=` form. */
function imageBasename(src: string): string {
  try {
    const url = new URL(src, "http://parity.local");
    const inner = url.searchParams.get("url");
    const target = inner ? new URL(inner, "http://parity.local").pathname : url.pathname;
    return path.posix.basename(target);
  } catch {
    return src;
  }
}

/** Build-time dates are not content: replace them so two builds on different days compare equal. */
function normaliseTextBody(route: string, body: string): string {
  if (route === "/sitemap.xml")
    return body.replace(/<lastmod>[^<]*<\/lastmod>/g, "<lastmod>[date]</lastmod>");
  if (route === "/.well-known/security.txt")
    return body.replace(/^Expires: .*$/m, "Expires: [date]");
  return body;
}

async function routesFromSitemap(baseUrl: string): Promise<string[]> {
  const xml = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const loc = match[1] ?? "/";
    const pathname = new URL(loc).pathname;
    return pathname === "" ? "/" : pathname.replace(/\/$/, "") || "/";
  });
  return routes;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const outDir = args[0];
  if (!outDir || outDir.startsWith("--")) {
    console.error("Usage: tsx scripts/cms/parity-snapshot.ts <outDir> [--port 3100]");
    process.exit(2);
  }
  const portFlag = args.indexOf("--port");
  const port = portFlag === -1 ? 3100 : Number(args[portFlag + 1]);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const server = await startServer(port);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const htmlRoutes = [...new Set([...(await routesFromSitemap(server.url)), ...EXTRA_ROUTES])];

    for (const route of htmlRoutes) {
      const response = await page.goto(`${server.url}${route}`, { waitUntil: "load" });
      if (!response) throw new Error(`No response for ${route}`);
      const headers = response.headers();
      const dom = (await page.evaluate(DOM_SCRIPT)) as DomData;
      const snapshot: RouteSnapshot = {
        route,
        status: response.status(),
        headers: Object.fromEntries(HEADER_NAMES.map((name) => [name, headers[name] ?? null])),
        title: dom.title,
        description: dom.description,
        canonical: dom.canonical,
        robots: dom.robots,
        jsonLd: dom.jsonLd.map((raw) => {
          try {
            return JSON.parse(raw) as unknown;
          } catch {
            return raw;
          }
        }),
        header: dom.header,
        main: dom.main,
        footer: dom.footer,
        images: dom.images.map((image) => ({ alt: image.alt, file: imageBasename(image.src) })),
      };
      fs.writeFileSync(path.join(outDir, fileNameFor(route)), JSON.stringify(snapshot, null, 2));
    }

    for (const route of TEXT_ROUTES) {
      const response = await fetch(`${server.url}${route}`);
      const snapshot: RouteSnapshot = {
        route,
        status: response.status,
        headers: Object.fromEntries(HEADER_NAMES.map((name) => [name, response.headers.get(name)])),
        body: normaliseTextBody(route, await response.text()),
      };
      fs.writeFileSync(path.join(outDir, fileNameFor(route)), JSON.stringify(snapshot, null, 2));
    }
    console.log(`Wrote ${htmlRoutes.length + TEXT_ROUTES.length} route snapshots to ${outDir}`);
  } finally {
    await browser.close();
    server.stop();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
