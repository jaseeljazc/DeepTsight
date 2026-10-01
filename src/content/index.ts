import type {
  Site,
  HomeContent,
  AboutContent,
  Service,
  CredentialGroup,
  ArticleSummary,
  Article,
  LegalPage,
  LegalSlug,
  SeoEntry,
  FigureData,
  PagesContent,
  EnquiryOptions,
} from "./types";
export { buildEnquirySchema, enquirySchema, type EnquiryData } from "./enquiry-schema";

/**
 * THE CONTENT ADAPTER SEAM (ARCHITECTURE.md §4)
 * The only public surface for retrieving content in the application. Every function is async and
 * returns data validated against the Zod schemas in ./schema.ts.
 *
 * CONTENT_SOURCE picks where content comes from (D-02): `static` (default) reads the TypeScript
 * files in ./source; `cms` reads Payload through ./cms-source. Both apply the same rules (./rules.ts).
 * The CMS source is loaded only when selected, so static mode never starts Payload.
 */

type Source = typeof import("./static-source");

function contentSource(): "static" | "cms" {
  return process.env["CONTENT_SOURCE"]?.trim() === "cms" ? "cms" : "static";
}

async function source(): Promise<Source> {
  return contentSource() === "cms" ? import("./cms-source") : import("./static-source");
}

export async function getSite(): Promise<Site> {
  return (await source()).getSite();
}

export async function getHomeContent(): Promise<HomeContent> {
  return (await source()).getHomeContent();
}

/** Every figure the pages can reference, keyed by id: approved or mock photographs and reserved slots. */
export async function getFigures(): Promise<Record<string, FigureData>> {
  return (await source()).getFigures();
}

export async function getAboutContent(): Promise<AboutContent> {
  return (await source()).getAboutContent();
}

/** Copy that belongs to a single page or template (about, services, credentials, contact, thank-you). */
export async function getPageContent(): Promise<PagesContent> {
  return (await source()).getPageContent();
}

/** Options for the enquiry form's area-of-enquiry select: the enabled types, in display order. */
export async function getEnquiryOptions(): Promise<EnquiryOptions> {
  return (await source()).getEnquiryOptions();
}

/**
 * The enquiry types enabled right now, never from a cache. The Server Action validates against
 * these, so a type switched off in the CMS is refused immediately (Phase 8).
 */
export async function getEnquiryOptionsNow(): Promise<EnquiryOptions> {
  if (contentSource() === "cms") return (await import("./cms-source")).getEnquiryOptionsNow();
  return (await import("./static-source")).getEnquiryOptions();
}

/** Enabled services in display order. */
export async function getServices(): Promise<Service[]> {
  return (await source()).getServices();
}

/** One enabled service, or null when it does not exist or is switched off. */
export async function getService(slug: string): Promise<Service | null> {
  return (await source()).getService(slug);
}

export async function getCredentials(): Promise<CredentialGroup[]> {
  return (await source()).getCredentials();
}

export async function getArticles(): Promise<ArticleSummary[]> {
  return (await source()).getArticles();
}

export async function getArticle(slug: string): Promise<Article | null> {
  return (await source()).getArticle(slug);
}

export async function getLegalPage(slug: LegalSlug): Promise<LegalPage | null> {
  return (await source()).getLegalPage(slug);
}

export async function getSeo(route: string): Promise<SeoEntry> {
  return (await source()).getSeo(route);
}
