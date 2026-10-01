/**
 * verify-content.ts
 * Tests the content adapter by invoking every getter function
 * and ensuring all source data strictly satisfies its Zod schema.
 */

import {
  getSite,
  getHomeContent,
  getAboutContent,
  getServices,
  getService,
  getCredentials,
  getArticles,
  getLegalPage,
  getSeo,
  getFigures,
  getPageContent,
  getEnquiryOptions,
  getArticle,
} from "../src/content/index";

async function verifyAllContent() {
  console.log("Verifying content adapter schemas...");

  // 1. Site
  const site = await getSite();
  console.log(`✓ getSite: verified (${site.displayName})`);

  // 2. Home Content
  const home = await getHomeContent();
  console.log(
    `✓ getHomeContent: verified (${home.coreCapabilities.length} capabilities, ${home.trustStrip.length} trust items)`,
  );

  // 3. About Content
  const about = await getAboutContent();
  console.log(`✓ getAboutContent: verified (${about.principles.length} principles)`);

  // 4. Services
  const services = await getServices();
  console.log(`✓ getServices: verified (${services.length} services)`);

  for (const s of services) {
    const single = await getService(s.slug);
    if (!single) throw new Error(`Failed to retrieve service by slug: ${s.slug}`);
  }
  console.log(`✓ getService(slug): verified all ${services.length} service slugs`);

  // 5. Credentials
  const creds = await getCredentials();
  console.log(`✓ getCredentials: verified (${creds.length} credential groups)`);

  // 6. Articles
  const articles = await getArticles();
  console.log(`✓ getArticles: verified (${articles.length} articles)`);

  // 7. Legal
  for (const slug of ["privacy", "terms", "accessibility"] as const) {
    const page = await getLegalPage(slug);
    if (!page) throw new Error(`Missing legal page for slug: ${slug}`);
    console.log(`✓ getLegalPage('${slug}'): verified (${page.title})`);
  }

  // 8. Figures, page copy and enquiry options (each checks its references)
  const figures = await getFigures();
  console.log(`✓ getFigures: verified (${Object.keys(figures).length} figures)`);
  const pages = await getPageContent();
  console.log(`✓ getPageContent: verified (${pages.thankYou.nextSteps.length} next steps)`);
  const options = await getEnquiryOptions();
  if (options.types.length === 0) throw new Error("No enabled enquiry types.");
  console.log(`✓ getEnquiryOptions: verified (${options.types.length} types)`);
  for (const article of articles) {
    if (!(await getArticle(article.slug))) throw new Error(`Missing article: ${article.slug}`);
  }

  // 9. SEO
  for (const route of [
    "/",
    "/about",
    "/services",
    "/credentials",
    "/insights",
    "/contact",
    "/contact/thank-you",
    "/legal/privacy",
    "/legal/terms",
    "/legal/accessibility",
  ]) {
    const seo = await getSeo(route);
    if (!seo) throw new Error(`Missing SEO entry for route: ${route}`);
  }
  console.log("✓ getSeo: verified primary routes");

  console.log("\nAll content adapter getters successfully validated against Zod schemas!");
}

verifyAllContent().catch((err) => {
  console.error("\nContent validation failed:", err);
  process.exit(1);
});
