import {
  siteSourceSchema,
  homeContentSchema,
  aboutContentSchema,
  credentialGroupSchema,
  legalPageSchema,
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
import {
  assertFigures,
  buildSite,
  enabledServices,
  seoOrFallback,
  showPending,
  visibleCredentialGroups,
  visibleCredentials,
} from "./rules";

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

/*
 * Static content source (CONTENT_SOURCE=static, the default): the TypeScript files in ./source,
 * as before the CMS. Kept as the fallback (D-02).
 */

/** Every figure id the media register defines (photographs and reserved slots). */
function figureIds(): Set<string> {
  return new Set([
    ...mediaRegisterSource.map((asset) => asset.id),
    ...imageSlotSource.map((slot) => slot.id),
  ]);
}

export async function getSite(): Promise<Site> {
  return buildSite(siteSourceSchema.parse(siteSource));
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
  assertFigures(home.media, figureIds(), "Home media");

  for (const capability of home.coreCapabilities) {
    if (!servicesSource.some((service) => service.slug === capability.slug)) {
      throw new Error(`Home core capabilities refer to unknown service "${capability.slug}".`);
    }
  }

  const filteredHome: HomeContent = {
    ...home,
    trustStrip: visibleCredentials(trustStripIds.map(credentialById)),
    selectedProof: home.selectedProof.filter((item) => item.disclosureApproved || pending),
  };

  return homeContentSchema.parse(filteredHome);
}

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
  assertFigures(about.media, figureIds(), "About media");
  return about;
}

export async function getPageContent(): Promise<PagesContent> {
  const pages = pagesContentSchema.parse(pagesSource);
  assertFigures(
    {
      "services.figure": pages.services.figure,
      "credentials.figure": pages.credentials.figure,
      "contact.figure": pages.contact.figure,
    },
    figureIds(),
    "Page content",
  );
  return pages;
}

export async function getEnquiryOptions(): Promise<EnquiryOptions> {
  return enquiryOptionsSchema.parse({
    placeholder: "Select an area",
    types: staticEnquiryTypes.map(({ value, label }) => ({ value, label })),
  });
}

export async function getServices(): Promise<Service[]> {
  return enabledServices(servicesSource, figureIds());
}

export async function getService(slug: string): Promise<Service | null> {
  return (await getServices()).find((service) => service.slug === slug) ?? null;
}

export async function getCredentials(): Promise<CredentialGroup[]> {
  return visibleCredentialGroups(credentialsSource).map((group) =>
    credentialGroupSchema.parse(group),
  );
}

/** Insights is not live in static mode: no articles. */
export async function getArticles(): Promise<ArticleSummary[]> {
  return [];
}

export async function getArticle(_slug: string): Promise<Article | null> {
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
  return seoOrFallback(seoSource[route], route);
}
