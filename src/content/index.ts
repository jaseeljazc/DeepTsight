import {
  navRoutes,
  siteSchema,
  siteSourceSchema,
  homeContentSchema,
  aboutContentSchema,
  serviceSchema,
  credentialGroupSchema,
  articleSummarySchema,
  articleSchema,
  legalPageSchema,
  seoEntrySchema,
  figureSchema,
  pagesContentSchema,
  enquiryOptionsSchema,
} from "./schema";
import type {
  Credential,
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
import { staticEnquiryTypes } from "./enquiry-schema";
export { buildEnquirySchema, enquirySchema, type EnquiryData } from "./enquiry-schema";

// Internal source imports (permitted only inside src/content/)
import { siteSource } from "./source/site";
import { homeSource } from "./source/home";
import { aboutSource } from "./source/about";
import { servicesSource } from "./source/services";
import { credentialsSource } from "./source/credentials";
import { pagesSource } from "./source/pages";
import { seoSource } from "./source/seo";
import { mediaRegisterSource, imageSlotSource } from "./source/media";
import { privacySource } from "./source/legal/privacy";
import { termsSource } from "./source/legal/terms";
import { accessibilitySource } from "./source/legal/accessibility";

/**
 * THE CONTENT ADAPTER SEAM (ARCHITECTURE.md §4)
 * The only public surface for retrieving content in the application.
 * All functions are async and validate their payload against Zod schemas.
 * In Phase 2, this file alone is swapped to query the CMS.
 */

export async function getSite(): Promise<Site> {
  const source = siteSourceSchema.parse(siteSource);
  // Routes and their order are fixed in code; only the labels are content (D-07).
  const nav = navRoutes
    .filter((route) => route.key !== "insights" || source.insightsEnabled)
    .map((route) => ({ label: source.navLabels[route.key], href: route.href }));
  return siteSchema.parse({ ...source, nav });
}

/** Every figure id the media register defines (photographs and reserved slots). */
function figureIds(): Set<string> {
  return new Set([
    ...mediaRegisterSource.map((asset) => asset.id),
    ...imageSlotSource.map((slot) => slot.id),
  ]);
}

/** A reference to a figure that does not exist is a content error and fails the build. */
function assertFigures(ids: Record<string, string>, where: string): void {
  const known = figureIds();
  for (const [field, id] of Object.entries(ids)) {
    if (!known.has(id)) throw new Error(`${where} ${field} refers to unknown figure "${id}".`);
  }
}

function byOrder(a: Service, b: Service): number {
  return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);
}

/**
 * Every service, validated, with reference checks: related services and figures must exist.
 * Disabled services are then removed, and removed from other services' related lists (FR-19).
 */
function publishedServices(): Service[] {
  const all = servicesSource.map((service) => serviceSchema.parse(service));
  const slugs = new Set(all.map((service) => service.slug));
  for (const service of all) {
    for (const related of service.relatedSlugs) {
      if (!slugs.has(related)) {
        throw new Error(`Service "${service.slug}" lists unknown related service "${related}".`);
      }
    }
    assertFigures(service.media, `Service "${service.slug}" media`);
  }
  const enabled = all.filter((service) => service.enabled).sort(byOrder);
  const enabledSlugs = new Set(enabled.map((service) => service.slug));
  return enabled.map((service) => ({
    ...service,
    relatedSlugs: service.relatedSlugs.filter((slug) => enabledSlugs.has(slug)),
  }));
}

/**
 * Unverified entries never reach a production build (FR-13, FR-15, FR-21). Outside production
 * they are passed through so the design can show them as marked placeholders (CR-02).
 */
function showPending(): boolean {
  return process.env["NEXT_PUBLIC_ENV"] !== "production";
}

/** Looks a credential up in the register by id. A missing id is a content error and fails the build. */
function credentialById(id: string): Credential {
  for (const group of credentialsSource) {
    const item = group.items.find((candidate) => candidate.id === id);
    if (item) return item;
  }
  throw new Error(`Home trust strip refers to unknown credential "${id}".`);
}

export async function getHomeContent(): Promise<HomeContent> {
  const pending = showPending();
  const { trustStripIds, ...home } = homeSource;
  assertFigures(home.media, "Home media");

  for (const capability of home.coreCapabilities) {
    if (!servicesSource.some((service) => service.slug === capability.slug)) {
      throw new Error(`Home core capabilities refer to unknown service "${capability.slug}".`);
    }
  }

  const filteredHome: HomeContent = {
    ...home,
    trustStrip: trustStripIds.map(credentialById).filter((item) => item.verified || pending),
    selectedProof: home.selectedProof.filter((item) => item.disclosureApproved || pending),
  };

  return homeContentSchema.parse(filteredHome);
}

/** Every figure the pages can reference, keyed by id: approved or mock photographs and reserved slots. */
export async function getFigures(): Promise<Record<string, FigureData>> {
  const figures: Record<string, FigureData> = {};
  for (const asset of mediaRegisterSource) {
    figures[asset.id] = figureSchema.parse({ ...asset, kind: "image" });
  }
  for (const slot of imageSlotSource) {
    figures[slot.id] = figureSchema.parse({ ...slot, kind: "slot" });
  }
  return figures;
}

export async function getAboutContent(): Promise<AboutContent> {
  const about = aboutContentSchema.parse(aboutSource);
  assertFigures(about.media, "About media");
  return about;
}

/** Copy that belongs to a single page or template (about, services, credentials, contact, thank-you). */
export async function getPageContent(): Promise<PagesContent> {
  const pages = pagesContentSchema.parse(pagesSource);
  assertFigures(
    {
      "services.figure": pages.services.figure,
      "credentials.figure": pages.credentials.figure,
      "contact.figure": pages.contact.figure,
    },
    "Page content",
  );
  return pages;
}

/** Options for the enquiry form's area-of-enquiry select: the enabled types, in display order. */
export async function getEnquiryOptions(): Promise<EnquiryOptions> {
  return enquiryOptionsSchema.parse({
    placeholder: "Select an area",
    types: staticEnquiryTypes.map(({ value, label }) => ({ value, label })),
  });
}

/** Enabled services in display order. */
export async function getServices(): Promise<Service[]> {
  return publishedServices();
}

/** One enabled service, or null when it does not exist or is switched off. */
export async function getService(slug: string): Promise<Service | null> {
  return publishedServices().find((service) => service.slug === slug) ?? null;
}

export async function getCredentials(): Promise<CredentialGroup[]> {
  const pending = showPending();
  const verifiedGroups = credentialsSource
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.verified || pending),
    }))
    .filter((group) => group.items.length > 0);

  return verifiedGroups.map((g) => credentialGroupSchema.parse(g));
}

export async function getArticles(): Promise<ArticleSummary[]> {
  // In Phase 1 launch, empty if no articles are published
  return [];
}

export async function getArticle(slug: string): Promise<Article | null> {
  return null;
}

export async function getLegalPage(slug: LegalSlug): Promise<LegalPage | null> {
  const pages: Record<LegalSlug, LegalPage> = {
    privacy: privacySource,
    terms: termsSource,
    accessibility: accessibilitySource,
  };

  const page = pages[slug];
  if (!page) return null;
  return legalPageSchema.parse(page);
}

export async function getSeo(route: string): Promise<SeoEntry> {
  const entry = seoSource[route] ?? {
    title: "Industrial engineering and OT cybersecurity",
    description:
      "Engineering consulting for critical infrastructure and heavy industry: control systems, OT cybersecurity, IT/OT segregation and plant reliability.",
    canonical: route,
  };

  return seoEntrySchema.parse(entry);
}
