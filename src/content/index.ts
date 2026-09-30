import {
  siteSchema,
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
import { enquiryTypes } from "./enquiry-schema";
export { enquirySchema, type EnquiryData } from "./enquiry-schema";

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
  const site = {
    ...siteSource,
    nav: siteSource.insightsEnabled
      ? siteSource.nav
      : siteSource.nav.filter((item) => item.href !== "/insights"),
  };
  return siteSchema.parse(site);
}

/**
 * Unverified entries never reach a production build (FR-13, FR-15, FR-21). Outside production
 * they are passed through so the design can show them as marked placeholders (CR-02).
 */
function showPending(): boolean {
  return process.env["NEXT_PUBLIC_ENV"] !== "production";
}

export async function getHomeContent(): Promise<HomeContent> {
  const pending = showPending();
  const filteredHome: HomeContent = {
    ...homeSource,
    trustStrip: homeSource.trustStrip.filter((item) => item.verified || pending),
    selectedProof: homeSource.selectedProof.filter((item) => item.disclosureApproved || pending),
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
  return aboutContentSchema.parse(aboutSource);
}

/** Copy that belongs to a single page or template (about, services, credentials, contact, thank-you). */
export async function getPageContent(): Promise<PagesContent> {
  return pagesContentSchema.parse(pagesSource);
}

/** Options for the enquiry form's area-of-enquiry select. Values match the enquiry schema enum. */
export async function getEnquiryOptions(): Promise<EnquiryOptions> {
  return enquiryOptionsSchema.parse({ placeholder: "Select an area", types: [...enquiryTypes] });
}

export async function getServices(): Promise<Service[]> {
  return servicesSource.map((s) => serviceSchema.parse(s));
}

export async function getService(slug: string): Promise<Service | null> {
  const service = servicesSource.find((s) => s.slug === slug);
  if (!service) return null;
  return serviceSchema.parse(service);
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
    canonical: `https://deeptsight.com.au${route === "/" ? "" : route}`,
  };

  return seoEntrySchema.parse(entry);
}
