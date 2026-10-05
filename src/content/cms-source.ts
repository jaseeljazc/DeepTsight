import { unstable_cache } from "next/cache";
import { getPayload, type Payload, type Where } from "payload";
import config from "@payload-config";
import {
  aboutContentSchema,
  articleSchema,
  articleSummarySchema,
  credentialGroupSchema,
  enquiryOptionsSchema,
  figureSchema,
  homeContentSchema,
  legalPageSchema,
  pagesContentSchema,
  siteSourceSchema,
} from "./schema";
import type {
  AboutContent,
  Article,
  ArticleSummary,
  CredentialGroup,
  EnquiryOptions,
  FigureData,
  HomeContent,
  LegalPage,
  LegalSlug,
  PagesContent,
  SeoEntry,
  Service,
  Site,
} from "./types";
import {
  figureKey,
  mapAbout,
  mapArticle,
  mapCredential,
  mapEnquiryType,
  mapHome,
  mapLegalPage,
  mapMedia,
  mapPages,
  mapProofItem,
  mapSeo,
  mapService,
  mapSite,
} from "./mappers";
import { asDoc, refs, rows, type Doc } from "./mappers/util";
import {
  REMOVED_FIGURE_ID,
  assertFigures,
  buildSite,
  enabledServices,
  removedFigure,
  seoOrFallback,
  showPending,
  visibleCredentialGroups,
  visibleCredentials,
} from "./rules";

/*
 * CMS content source (CONTENT_SOURCE=cms): Payload's Local API, in process, never the public REST
 * API. Documents go through the same mappers, Zod schemas and approval rules as the static source.
 *
 * - Public reads see only published documents (`_status = published`), even though the Local API
 *   bypasses access control (D-06).
 * - In draft mode (preview, Phase 7) the latest drafts are read, uncached, and unapproved items are
 *   shown with their placeholder markers, as in development.
 * - Published reads are cached with Next's data cache under the tags in 02_CONTENT_MODEL.md, so a
 *   change in the CMS invalidates exactly the pages that used it.
 */

const PUBLISHED: Where = { _status: { equals: "published" } };

async function cms(): Promise<Payload> {
  return getPayload({ config });
}

/** Preview: only inside a request with Next's draft mode enabled. Scripts and builds read published. */
async function isDraft(): Promise<boolean> {
  try {
    const { draftMode } = await import("next/headers");
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

/**
 * Caches a published read under content tags. Outside a Next.js server (verify-content, scripts)
 * there is no data cache, so the read runs directly.
 */
async function cached<T>(key: string[], tags: string[], read: () => Promise<T>): Promise<T> {
  if (!process.env["NEXT_RUNTIME"]) return read();
  return unstable_cache(read, ["cms", ...key], { tags, revalidate: false })();
}

/** Reads published content (cached) or, in draft mode, the latest drafts (uncached). */
async function read<T>(
  key: string[],
  tags: string[],
  load: (draft: boolean) => Promise<T>,
): Promise<T> {
  if (await isDraft()) return load(true);
  return cached(key, tags, () => load(false));
}

async function findAll(
  collection: string,
  draft: boolean,
  depth: number,
  sort?: string | string[],
): Promise<Doc[]> {
  const payload = await cms();
  const result = await (
    payload as unknown as {
      find: (args: Record<string, unknown>) => Promise<{ docs: unknown[] }>;
    }
  ).find({
    collection,
    draft,
    depth,
    pagination: false,
    overrideAccess: true,
    ...(draft ? {} : { where: PUBLISHED }),
    ...(sort ? { sort } : {}),
  });
  return result.docs.map(asDoc);
}

async function findGlobal(slug: string, draft: boolean, depth: number): Promise<Doc> {
  const payload = await cms();
  const doc = asDoc(
    await (
      payload as unknown as {
        findGlobal: (args: Record<string, unknown>) => Promise<unknown>;
      }
    ).findGlobal({ slug, draft, depth, overrideAccess: true }),
  );
  if (!draft && doc["_status"] !== "published") {
    throw new Error(`The "${slug}" content has not been published yet.`);
  }
  return doc;
}

function isPublished(doc: unknown, draft: boolean): boolean {
  return draft || asDoc(doc)["_status"] === "published";
}

async function loadFigures(draft: boolean): Promise<Record<string, FigureData>> {
  const figures: Record<string, FigureData> = {};
  for (const doc of await findAll("media", draft, 0)) {
    const figure = figureSchema.parse(mapMedia(doc));
    figures[figure.id] = figure;
  }
  // Previews and non-production builds show a marked placeholder where an image was removed. The
  // live site leaves the spot out (the page gets no figure for the empty id).
  if (draft || showPending()) figures[REMOVED_FIGURE_ID] = removedFigure();
  return figures;
}

async function figureIds(draft: boolean): Promise<Set<string>> {
  return new Set(Object.keys(await loadFigures(draft)));
}

export async function getSite(): Promise<Site> {
  return read(["site"], ["site"], async (draft) =>
    buildSite(siteSourceSchema.parse(mapSite(await findGlobal("site-settings", draft, 0)))),
  );
}

export async function getFigures(): Promise<Record<string, FigureData>> {
  return read(["figures"], ["media"], loadFigures);
}

async function loadServices(draft: boolean): Promise<Service[]> {
  const docs = await findAll("services", draft, 1, ["sortOrder", "title"]);
  const services = docs.map((doc) => {
    const service = mapService(doc);
    // A related service that is not published is left out, like a disabled one.
    const published = refs(doc, "relatedServices").filter((ref) => isPublished(ref, draft));
    return {
      ...service,
      relatedSlugs: service.relatedSlugs.filter((slug) =>
        published.some((ref) => asDoc(ref)["slug"] === slug),
      ),
    };
  });
  return enabledServices(services, await figureIds(draft));
}

export async function getServices(): Promise<Service[]> {
  return read(["services"], ["services", "media"], loadServices);
}

export async function getService(slug: string): Promise<Service | null> {
  return read(["service", slug], ["services", `service:${slug}`, "media"], async (draft) => {
    return (await loadServices(draft)).find((service) => service.slug === slug) ?? null;
  });
}

export async function getHomeContent(): Promise<HomeContent> {
  return read(["home"], ["home", "credentials", "services", "media"], async (draft) => {
    const pending = draft || showPending();
    const doc = await findGlobal("home", draft, 2);
    const trustStrip = visibleCredentials(
      refs(doc, "trustStrip")
        .filter((ref) => isPublished(ref, draft))
        .map((ref) => mapCredential(asDoc(ref))),
      pending,
    );
    const selectedProof = refs(doc, "selectedProof")
      .filter((ref) => isPublished(ref, draft))
      .map((ref) => mapProofItem(asDoc(ref)))
      .filter((item) => item.disclosureApproved || pending);
    const home = homeContentSchema.parse(mapHome(doc, trustStrip, selectedProof));

    assertFigures(home.media, await figureIds(draft), "Home media");
    const serviceSlugs = new Set((await loadServices(draft)).map((service) => service.slug));
    // A capability for a service that is off or unpublished is dropped, as the rail lists services.
    for (const row of rows(doc, "coreCapabilities")) {
      if (!row["service"])
        throw new Error("Home core capabilities have an entry without a service.");
    }
    return {
      ...home,
      coreCapabilities: home.coreCapabilities.filter((item) => serviceSlugs.has(item.slug)),
    };
  });
}

export async function getAboutContent(): Promise<AboutContent> {
  return read(["about"], ["about", "media"], async (draft) => {
    const about = aboutContentSchema.parse(mapAbout(await findGlobal("about", draft, 1)));
    assertFigures(about.media, await figureIds(draft), "About media");
    return about;
  });
}

export async function getPageContent(): Promise<PagesContent> {
  return read(["pages"], ["pages", "media"], async (draft) => {
    const pages = pagesContentSchema.parse(mapPages(await findGlobal("pages", draft, 1)));
    assertFigures(
      {
        "services.figure": pages.services.figure,
        "credentials.figure": pages.credentials.figure,
        "contact.figure": pages.contact.figure,
      },
      await figureIds(draft),
      "Page content",
    );
    return pages;
  });
}

/** Enquiry types have no drafts. Read through the cache for pages; see getEnquiryTypesNow(). */
async function loadEnquiryOptions(): Promise<EnquiryOptions> {
  const payload = await cms();
  const result = await payload.find({
    collection: "enquiry-types",
    where: { enabled: { equals: true } },
    sort: ["sortOrder", "label"],
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  return enquiryOptionsSchema.parse({
    placeholder: "Select an area",
    types: result.docs
      .map((doc) => mapEnquiryType(asDoc(doc)))
      .map(({ value, label }) => ({ value, label })),
  });
}

export async function getEnquiryOptions(): Promise<EnquiryOptions> {
  return cached(["enquiry-types"], ["enquiry-types"], loadEnquiryOptions);
}

/** Uncached: the Server Action validates against the types enabled at this moment (Phase 8). */
export async function getEnquiryOptionsNow(): Promise<EnquiryOptions> {
  return loadEnquiryOptions();
}

export async function getCredentials(): Promise<CredentialGroup[]> {
  return read(["credentials"], ["credentials", "media"], async (draft) => {
    const groups = await findAll("credential-groups", draft, 0, ["sortOrder", "title"]);
    const items = (await findAll("credentials", draft, 1, ["sortOrder", "title"])).map(
      mapCredential,
    );
    const assembled = groups.map((group) => ({
      category: String(group["category"] ?? ""),
      title: String(group["title"] ?? ""),
      items: items.filter((item) => item.category === group["category"]),
    }));
    return visibleCredentialGroups(assembled, draft || showPending()).map((group) =>
      credentialGroupSchema.parse(group),
    );
  });
}

/** Published articles, newest first. Whether Insights is shown at all is decided by the pages. */
export async function getArticles(): Promise<ArticleSummary[]> {
  return read(["articles"], ["articles"], async (draft) => {
    const docs = await findAll("articles", draft, 1, ["-publishedAt", "title"]);
    return docs.map((doc) => {
      const { slug, title, summary, publishedAt, readingMinutes, categories, tags } = mapArticle(
        doc,
        draft,
      );
      return articleSummarySchema.parse({
        slug,
        title,
        summary,
        publishedAt,
        readingMinutes,
        categories,
        tags,
      });
    });
  });
}

export async function getArticle(slug: string): Promise<Article | null> {
  return read(["article", slug], ["articles", `article:${slug}`], async (draft) => {
    const payload = await cms();
    const result = await payload.find({
      collection: "articles",
      where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, PUBLISHED] },
      draft,
      limit: 1,
      depth: 1,
      overrideAccess: true,
    });
    const doc = result.docs[0];
    return doc ? articleSchema.parse(mapArticle(asDoc(doc), draft)) : null;
  });
}

export async function getLegalPage(slug: LegalSlug): Promise<LegalPage | null> {
  return read(["legal", slug], [`legal:${slug}`], async (draft) => {
    const payload = await cms();
    const result = await payload.find({
      collection: "legal-pages",
      where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, PUBLISHED] },
      draft,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const doc = result.docs[0];
    return doc ? legalPageSchema.parse(mapLegalPage(asDoc(doc))) : null;
  });
}

export async function getSeo(route: string): Promise<SeoEntry> {
  const entries = await read(["seo"], ["seo"], async (draft) =>
    mapSeo(await findGlobal("seo", draft, 1)),
  );
  return seoOrFallback(entries[route], route);
}

/** The MediaAsset id an image field points at (used by previews and the inbox). */
export { figureKey };
