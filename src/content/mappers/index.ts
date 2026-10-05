import type {
  AboutContent,
  Article,
  Credential,
  EnquiryType,
  FigureData,
  HomeContent,
  LegalPage,
  PagesContent,
  ProofItem,
  SeoEntry,
  Service,
  SiteSource,
} from "../types";
import {
  asDoc,
  bool,
  group,
  list,
  num,
  opt,
  refKey,
  refs,
  rows,
  str,
  updatedAt,
  type Doc,
} from "./util";

/*
 * Payload documents → the Zod shapes in ../schema.ts (the contract). One mapper per collection or
 * global. Used by the CMS adapter (populated documents) and by the publish guard (ids only).
 */

export const MEDIA_FILE_ROUTE = "/api/media/file";

/** The figure id a page refers to: the legacy id for imported media, otherwise "media-<id>". */
export function figureKey(ref: unknown): string {
  if (ref && typeof ref === "object") {
    const doc = ref as Doc;
    return opt(doc, "legacyId") ?? `media-${str(doc, "id")}`;
  }
  return ref === null || ref === undefined || ref === "" ? "" : `media-${String(ref)}`;
}

/** Public path of an uploaded file. Relative, so next/image treats it as a local image. */
export function mediaSrc(doc: Doc): string {
  const filename = str(doc, "filename");
  return filename ? `${MEDIA_FILE_ROUTE}/${encodeURIComponent(filename)}` : "";
}

/** A share image's public path, only when the image is populated and approved for public use. */
export function shareImageSrc(ref: unknown): string | undefined {
  if (!ref || typeof ref !== "object") return undefined;
  const doc = ref as Doc;
  if (!bool(doc, "approvedForPublic")) return undefined;
  return mediaSrc(doc) || undefined;
}

export function mapMedia(doc: Doc): FigureData {
  const id = figureKey(doc);
  if (str(doc, "kind") === "slot") {
    return {
      kind: "slot",
      id,
      subject: str(doc, "subject"),
      caption: str(doc, "caption"),
      promptRef: str(doc, "promptRef"),
    };
  }
  return {
    kind: "image",
    id,
    src: mediaSrc(doc),
    alt: bool(doc, "decorative") ? "" : str(doc, "alt"),
    caption: str(doc, "caption"),
    width: num(doc, "width"),
    height: num(doc, "height"),
    source: str(doc, "source"),
    licence: str(doc, "licence"),
    usageRights: str(doc, "usageRights"),
    attribution: opt(doc, "attribution"),
    approvedForPublic: bool(doc, "approvedForPublic"),
    ...(typeof doc["focalX"] === "number" ? { focalX: doc["focalX"] } : {}),
    ...(typeof doc["focalY"] === "number" ? { focalY: doc["focalY"] } : {}),
  };
}

export function mapService(doc: Doc): Service {
  const slug = str(doc, "slug");
  const seo = group(doc, "seo");
  const media = group(doc, "media");
  return {
    slug,
    title: str(doc, "title"),
    shortTitle: str(doc, "shortTitle"),
    summary: str(doc, "summary"),
    outcome: str(doc, "outcome"),
    icon: str(doc, "icon") as Service["icon"],
    challenge: str(doc, "challenge"),
    whyItMatters: str(doc, "whyItMatters"),
    capability: str(doc, "capability"),
    scopeAndOutputs: rows(doc, "scopeAndOutputs").map((row) => ({
      scope: str(row, "scope"),
      outputs: list(row, "outputs"),
    })),
    deliveryApproach: rows(doc, "deliveryApproach").map((row) => ({
      step: str(row, "step"),
      title: str(row, "title"),
      description: str(row, "description"),
    })),
    standards: list(doc, "standards"),
    evidence: opt(doc, "evidence"),
    relatedSlugs: refs(doc, "relatedServices").map((ref) => refKey(ref, "slug")),
    media: { hero: figureKey(media["hero"]), detail: figureKey(media["detail"]) },
    // Canonicals are derived, never edited (02 Conventions).
    seo: {
      title: str(seo, "title"),
      description: str(seo, "description"),
      canonical: `/services/${slug}`,
      ...(shareImageSrc(seo["ogImage"]) ? { ogImage: shareImageSrc(seo["ogImage"]) } : {}),
    },
    enabled: doc["enabled"] !== false,
    sortOrder: num(doc, "sortOrder", 100),
    updatedAt: updatedAt(doc),
  };
}

export function mapCredential(doc: Doc): Credential {
  const badge = doc["badge"];
  return {
    id: opt(doc, "legacyId") ?? `credential-${str(doc, "id")}`,
    category: str(doc, "category"),
    title: str(doc, "title"),
    issuer: str(doc, "issuer"),
    identifier: opt(doc, "identifier"),
    year: opt(doc, "year"),
    expiry: opt(doc, "expiry"),
    url: opt(doc, "url"),
    badge: badge && typeof badge === "object" ? mediaSrc(badge as Doc) || undefined : undefined,
    verified: bool(doc, "verified"),
  };
}

export function mapProofItem(doc: Doc): ProofItem {
  return {
    id: opt(doc, "legacyId") ?? `proof-${str(doc, "id")}`,
    sector: str(doc, "sector"),
    challenge: str(doc, "challenge"),
    outcome: str(doc, "outcome"),
    metric: opt(doc, "metric"),
    disclosureApproved: bool(doc, "disclosureApproved"),
  };
}

function finalCta(doc: Doc, key = "finalCta") {
  const cta = group(doc, key);
  return { title: str(cta, "title"), supportingText: str(cta, "supportingText") };
}

/** Home as rendered; the trust strip and proof items are supplied already resolved and filtered. */
export function mapHome(
  doc: Doc,
  trustStrip: Credential[],
  selectedProof: ProofItem[],
): HomeContent {
  const hero = group(doc, "hero");
  const media = group(doc, "media");
  const why = group(doc, "whyDeepTsight");
  const problems = group(doc, "problemsAddressed");
  const delivery = group(doc, "deliveryApproach");
  const perth = group(doc, "perthContext");
  const trustCopy = group(doc, "trustStripCopy");
  const categoryLabels = group(trustCopy, "categoryLabels");
  return {
    hero: {
      headline: str(hero, "headline"),
      supportingText: str(hero, "supportingText"),
      facts: rows(hero, "facts").map((row) => ({
        label: str(row, "label"),
        value: str(row, "value"),
        ...(bool(row, "mono") ? { mono: true } : {}),
      })),
    },
    trustStrip,
    media: {
      problems: figureKey(media["problems"]),
      why: figureKey(media["why"]),
      close: figureKey(media["close"]),
    },
    coreCapabilitiesTitle: str(doc, "coreCapabilitiesTitle"),
    coreCapabilitiesIntro: str(doc, "coreCapabilitiesIntro"),
    coreCapabilities: rows(doc, "coreCapabilities").map((row) => ({
      slug: refKey(row["service"], "slug"),
      title: str(row, "title"),
      outcome: str(row, "outcome"),
    })),
    whyDeepTsight: {
      title: str(why, "title"),
      convergenceLabel: str(why, "convergenceLabel"),
      paragraphs: list(why, "paragraphs"),
      pillars: rows(why, "pillars").map((row) => ({
        title: str(row, "title"),
        description: str(row, "description"),
      })),
    },
    problemsAddressed: {
      title: str(problems, "title"),
      items: rows(problems, "items").map((row) => ({
        challenge: str(row, "challenge"),
        solution: str(row, "solution"),
      })),
    },
    deliveryApproach: {
      title: str(delivery, "title"),
      intro: str(delivery, "intro"),
      steps: rows(delivery, "steps").map((row) => ({
        step: str(row, "step"),
        title: str(row, "title"),
        description: str(row, "description"),
      })),
    },
    selectedProofTitle: str(doc, "selectedProofTitle"),
    selectedProof,
    perthContext: {
      title: str(perth, "title"),
      description: str(perth, "description"),
      officeArea: str(perth, "officeArea"),
      sectors: list(perth, "sectors"),
    },
    finalCta: finalCta(doc),
    updatedAt: updatedAt(doc),
    trustStripCopy: {
      title: str(trustCopy, "title"),
      registerLinkLabel: str(trustCopy, "registerLinkLabel"),
      categoryLabels: Object.fromEntries(
        ["qualifications", "registrations", "certifications", "platforms"].map((key) => [
          key,
          str(categoryLabels, key),
        ]),
      ),
    },
  };
}

export function mapAbout(doc: Doc): AboutContent {
  const founder = group(doc, "founder");
  const narrative = group(doc, "narrative");
  const media = group(doc, "media");
  return {
    founder: { name: str(founder, "name"), jobTitle: str(founder, "jobTitle") },
    narrative: { title: str(narrative, "title"), paragraphs: list(narrative, "paragraphs") },
    principles: rows(doc, "principles").map((row) => ({
      title: str(row, "title"),
      description: str(row, "description"),
    })),
    media: {
      portrait: figureKey(media["portrait"]),
      site: figureKey(media["site"]),
      desk: figureKey(media["desk"]),
    },
    timeline: rows(doc, "timeline").map((row) => ({
      period: str(row, "period"),
      role: str(row, "role"),
      context: str(row, "context"),
    })),
    updatedAt: updatedAt(doc),
  };
}

export function mapPages(doc: Doc): PagesContent {
  const about = group(doc, "about");
  const services = group(doc, "services");
  const template = group(doc, "serviceTemplate");
  const credentials = group(doc, "credentials");
  const contact = group(doc, "contact");
  const before = group(contact, "beforeYouWrite");
  const thankYou = group(doc, "thankYou");
  return {
    about: { finalCta: finalCta(about) },
    services: {
      title: str(services, "title"),
      lead: str(services, "lead"),
      finalCta: finalCta(services),
      figure: figureKey(services["figure"]),
    },
    serviceTemplate: {
      engagement: str(template, "engagement"),
      enquiryTitlePrefix: str(template, "enquiryTitlePrefix"),
      supportingText: str(template, "supportingText"),
    },
    credentials: {
      title: str(credentials, "title"),
      lead: str(credentials, "lead"),
      finalCta: finalCta(credentials),
      figure: figureKey(credentials["figure"]),
    },
    contact: {
      lead: str(contact, "lead"),
      figure: figureKey(contact["figure"]),
      beforeYouWrite: { title: str(before, "title"), body: str(before, "body") },
    },
    thankYou: {
      title: str(thankYou, "title"),
      lead: str(thankYou, "lead"),
      nextStepsTitle: str(thankYou, "nextStepsTitle"),
      nextSteps: rows(thankYou, "nextSteps").map((row) => ({
        title: str(row, "title"),
        description: str(row, "description"),
      })),
    },
  };
}

/** Fixed routes with an SEO entry, and the group that stores each in the `seo` global. */
export const SEO_ROUTES = {
  "/": "home",
  "/about": "about",
  "/services": "services",
  "/credentials": "credentials",
  "/insights": "insights",
  "/contact": "contact",
  "/contact/thank-you": "thankYou",
  "/legal/privacy": "privacy",
  "/legal/terms": "terms",
  "/legal/accessibility": "accessibility",
} as const;

export function mapSeo(doc: Doc): Record<string, SeoEntry> {
  const entries: Record<string, SeoEntry> = {};
  for (const [route, key] of Object.entries(SEO_ROUTES)) {
    const entry = group(doc, key);
    const ogImage = shareImageSrc(entry["ogImage"]);
    entries[route] = {
      title: str(entry, "title"),
      description: str(entry, "description"),
      canonical: route,
      ...(ogImage ? { ogImage } : {}),
    };
  }
  return entries;
}

export function mapLegalPage(doc: Doc): LegalPage {
  return {
    slug: str(doc, "slug") as LegalPage["slug"],
    title: str(doc, "title"),
    lastUpdated: str(doc, "lastUpdated"),
    reference: str(doc, "reference"),
    status: str(doc, "adviserStatus") === "approved" ? "approved" : "pending-adviser",
    sections: rows(doc, "sections").map((row) => ({
      title: str(row, "title"),
      content: str(row, "content"),
    })),
    updatedAt: updatedAt(doc),
  };
}

export function mapEnquiryType(doc: Doc): EnquiryType {
  return {
    value: str(doc, "value"),
    label: str(doc, "label"),
    enabled: doc["enabled"] !== false,
    sortOrder: num(doc, "sortOrder", 100),
  };
}

export function mapSite(doc: Doc): SiteSource {
  const address = group(doc, "officeAddress");
  const hasAddress = ["street", "locality", "region", "postcode"].some(
    (key) => str(address, key).length > 0,
  );
  const hours = rows(doc, "businessHours");
  const nav = group(doc, "navLabels");
  const cta = group(doc, "ctaLabels");
  const ui = group(doc, "uiLabels");
  return {
    legalName: str(doc, "legalName"),
    displayName: str(doc, "displayName"),
    tagline: str(doc, "tagline"),
    abn: opt(doc, "abn"),
    address: opt(doc, "address"),
    phone: str(doc, "phone"),
    email: str(doc, "email"),
    linkedIn: opt(doc, "linkedIn"),
    responseTime: str(doc, "responseTime"),
    serviceArea: str(doc, "serviceArea"),
    locationLabel: str(doc, "locationLabel"),
    socialLinks: rows(doc, "socialLinks").map((row) => ({
      platform: str(row, "platform") as SiteSource["socialLinks"][number]["platform"],
      url: str(row, "url"),
    })),
    mapsUrl: opt(doc, "mapsUrl"),
    officeAddress: hasAddress
      ? {
          street: str(address, "street"),
          locality: str(address, "locality"),
          region: str(address, "region"),
          postcode: str(address, "postcode"),
        }
      : undefined,
    showOfficeAddress: bool(doc, "showOfficeAddress"),
    businessHours:
      hours.length > 0
        ? hours.map((row) => ({
            day: str(row, "day") as NonNullable<SiteSource["businessHours"]>[number]["day"],
            opens: opt(row, "opens"),
            closes: opt(row, "closes"),
            closed: bool(row, "closed"),
          }))
        : undefined,
    showBusinessHours: bool(doc, "showBusinessHours"),
    navLabels: {
      home: str(nav, "home"),
      about: str(nav, "about"),
      services: str(nav, "services"),
      credentials: str(nav, "credentials"),
      insights: str(nav, "insights"),
      contact: str(nav, "contact"),
    },
    ctaLabels: {
      primary: str(cta, "primary"),
      secondary: str(cta, "secondary"),
      credentials: str(cta, "credentials"),
      header: str(cta, "header"),
    },
    uiLabels: {
      allServices: str(ui, "allServices"),
      viewService: str(ui, "viewService"),
      viewPrefix: str(ui, "viewPrefix"),
      returnHome: str(ui, "returnHome"),
      connectOnLinkedIn: str(ui, "connectOnLinkedIn"),
      onLinkedInSuffix: str(ui, "onLinkedInSuffix"),
      orEmail: str(ui, "orEmail"),
      orCall: str(ui, "orCall"),
      openInMaps: str(ui, "openInMaps"),
    },
    insightsEnabled: bool(doc, "insightsEnabled"),
    updatedAt: updatedAt(doc),
  };
}

/** An article as the site shows it. Categories are given as names, published ones only. */
export function mapArticle(doc: Doc, draft = false): Article {
  const body = doc["body"];
  const categories = refs(doc, "categories")
    .map(asDoc)
    .filter((category) => draft || category["_status"] === "published")
    .map((category) => ({ slug: str(category, "slug"), name: str(category, "name") }))
    .filter((category) => category.slug.length > 0 && category.name.length > 0);
  return {
    slug: str(doc, "slug"),
    title: str(doc, "title"),
    summary: str(doc, "summary"),
    publishedAt: opt(doc, "publishedAt") ?? opt(doc, "updatedAt") ?? "",
    readingMinutes: Math.max(1, num(doc, "readingMinutes", 1)),
    categories,
    tags: categories.map((category) => category.name),
    updatedAt: updatedAt(doc),
    status: str(doc, "_status") === "published" ? "published" : "draft",
    body: (body && typeof body === "object" ? body : { root: { children: [] } }) as Article["body"],
    seo: {
      title: str(group(doc, "seo"), "title") || str(doc, "title"),
      description: str(group(doc, "seo"), "description") || str(doc, "summary"),
      canonical: `/insights/${str(doc, "slug")}`,
    },
  };
}
