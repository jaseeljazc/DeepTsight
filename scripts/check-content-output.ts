/**
 * check-content-output.ts
 * Scans what the site would actually show: calls every content getter (static or CMS, whichever
 * CONTENT_SOURCE selects) and looks for placeholder markers in every returned string (D-12).
 * Fails when NEXT_PUBLIC_ENV=production; otherwise prints the count and the field paths.
 * check-placeholders.ts still scans the code itself. Prints paths, never content values.
 */

import nextEnv from "@next/env";
import { placeholderPaths } from "../src/lib/placeholder";

nextEnv.loadEnvConfig(process.cwd());

async function main(): Promise<void> {
  const content = await import("../src/content/index");
  const findings: string[] = [];
  const scan = (name: string, value: unknown) => findings.push(...placeholderPaths(value, name));

  scan("site", await content.getSite());
  scan("home", await content.getHomeContent());
  scan("about", await content.getAboutContent());
  scan("pages", await content.getPageContent());
  scan("figures", await content.getFigures());
  scan("credentials", await content.getCredentials());
  scan("enquiryOptions", await content.getEnquiryOptions());
  const services = await content.getServices();
  scan("services", services);
  for (const article of await content.getArticles()) {
    scan(`articles[${article.slug}]`, await content.getArticle(article.slug));
  }
  for (const slug of ["privacy", "terms", "accessibility"] as const) {
    scan(`legal[${slug}]`, await content.getLegalPage(slug));
  }
  for (const route of [
    "/",
    "/about",
    "/services",
    "/credentials",
    "/insights",
    "/contact",
    "/contact/thank-you",
  ]) {
    scan(`seo[${route}]`, await content.getSeo(route));
  }

  const source = process.env["CONTENT_SOURCE"]?.trim() === "cms" ? "cms" : "static";
  const production = process.env["NEXT_PUBLIC_ENV"]?.trim() === "production";
  if (findings.length === 0) {
    console.log(`Content output check (${source}): no placeholder markers.`);
    return;
  }
  if (production) {
    console.error(
      `\nCRITICAL: ${findings.length} placeholder marker(s) in ${source} content output:`,
    );
    findings.forEach((path) => console.error(` - ${path}`));
    process.exit(1);
  }
  console.log(
    `Content output check (${source}): ${findings.length} placeholder marker(s); allowed outside production.`,
  );
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error("Content output check failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
