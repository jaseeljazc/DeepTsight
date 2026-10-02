/**
 * Imports the static content (src/content/source) into the CMS. Idempotent: records are upserted
 * by natural key (slug, legacy id, category, value), so running it twice gives the same counts.
 * Everything is published (D-05); placeholder markers are carried over unchanged and stay visible.
 *
 *   tsx scripts/cms/import-from-source.ts --db DATABASE_URI_TEST [--reset] [--report]
 *   tsx scripts/cms/import-from-source.ts --dry-run   (report from the source only; no database)
 *
 * --reset deletes content collections first (never users, the audit log or enquiries).
 * --report writes docs/cms/import-report.md (counts and field paths with placeholder markers;
 * never content values).
 * Image files are copied from public/ into the CMS media store; public/ is left untouched
 * because static mode still uses it.
 */
import fs from "node:fs";
import path from "node:path";
import type { Payload, Where } from "payload";
import { argValue, parseDbEnvName, redact } from "./lib/db";
import { payloadFor } from "./lib/payload";
import { isPlaceholder } from "../../src/lib/placeholder";
import { DISABLE_REVALIDATE } from "../../src/cms/hooks/revalidate";
import { IMPORT_PUBLISH, SKIP_AUDIT } from "../../src/cms/hooks/lifecycle";
// The import is the one place outside src/content allowed to read the static source directly.
import { siteSource } from "../../src/content/source/site";
import { homeSource } from "../../src/content/source/home";
import { aboutSource } from "../../src/content/source/about";
import { servicesSource } from "../../src/content/source/services";
import { credentialsSource } from "../../src/content/source/credentials";
import { pagesSource } from "../../src/content/source/pages";
import { seoSource } from "../../src/content/source/seo";
import { mediaRegisterSource, imageSlotSource } from "../../src/content/source/media";
import { enquiryTypesSource } from "../../src/content/source/enquiry-types";
import { privacySource } from "../../src/content/source/legal/privacy";
import { termsSource } from "../../src/content/source/legal/terms";
import { accessibilitySource } from "../../src/content/source/legal/accessibility";
import { SEO_ROUTES } from "../../src/content/mappers";

const CONTENT_COLLECTIONS = [
  "services",
  "proof-items",
  "credentials",
  "credential-groups",
  "legal-pages",
  "enquiry-types",
  "media",
] as const;
type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];

const context = { [DISABLE_REVALIDATE]: true, [SKIP_AUDIT]: true };
const base = { overrideAccess: true, context, depth: 0 } as const;
const PUBLISHED = { _status: "published" as const };

/* Badges are issuer artwork the founder supplied (credentials.ts); their licence terms are not
 * recorded anywhere, so the import marks them for the client to confirm. */
const BADGE_SOURCE = "Issuer badge artwork supplied by the founder";
const BADGE_LICENCE = "TBD — CLIENT";
const BADGE_RIGHTS = "Shown on the current site beside the credential it belongs to";

const list = (values: string[]) => values.map((value) => ({ value }));

type Loose = {
  find: (args: Record<string, unknown>) => Promise<{ docs: { id: number }[]; totalDocs: number }>;
  create: (args: Record<string, unknown>) => Promise<{ id: number }>;
  update: (args: Record<string, unknown>) => Promise<{ id: number }>;
  delete: (args: Record<string, unknown>) => Promise<unknown>;
  updateGlobal: (args: Record<string, unknown>) => Promise<unknown>;
};

/**
 * The typed Local API checks data against the generated types; the import builds documents from
 * the Zod-typed source instead, so it goes through this narrow untyped view.
 */
function loose(payload: Payload): Loose {
  return payload as unknown as Loose;
}

async function upsert(
  payload: Payload,
  collection: ContentCollection,
  where: Where,
  data: Record<string, unknown>,
  extra: Record<string, unknown> = {},
): Promise<number> {
  const api = loose(payload);
  const found = await api.find({ ...base, collection, where, limit: 1, draft: true });
  const existing = found.docs[0];
  if (existing) {
    await api.update({ ...base, ...extra, collection, id: existing.id, data });
    return existing.id;
  }
  const created = await api.create({ ...base, ...extra, collection, data });
  return created.id;
}

async function importMedia(payload: Payload): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  const api = loose(payload);
  const withFile = async (legacyId: string, data: Record<string, unknown>, publicPath: string) => {
    const filePath = path.join(process.cwd(), "public", ...publicPath.split("/").filter(Boolean));
    if (!fs.existsSync(filePath))
      throw new Error(`Missing image file for ${legacyId}: public${publicPath}`);
    const found = await api.find({
      ...base,
      collection: "media",
      where: { legacyId: { equals: legacyId } },
      limit: 1,
      draft: true,
    });
    const existing = found.docs[0];
    // Files are uploaded once; a re-run updates the record without re-uploading.
    const id = existing
      ? (await api.update({ ...base, collection: "media", id: existing.id, data })).id
      : (await api.create({ ...base, collection: "media", data, filePath })).id;
    ids.set(legacyId, id);
  };

  for (const asset of mediaRegisterSource) {
    await withFile(
      asset.id,
      {
        legacyId: asset.id,
        kind: "image",
        assetClass: "photograph",
        alt: asset.alt,
        decorative: asset.alt === "",
        caption: asset.caption,
        source: asset.source,
        licence: asset.licence,
        usageRights: asset.usageRights,
        attribution: asset.attribution ?? null,
        approvedForPublic: asset.approvedForPublic,
        ...PUBLISHED,
      },
      asset.src,
    );
  }

  for (const slot of imageSlotSource) {
    ids.set(
      slot.id,
      await upsert(
        payload,
        "media",
        { legacyId: { equals: slot.id } },
        {
          legacyId: slot.id,
          kind: "slot",
          assetClass: "photograph",
          subject: slot.subject,
          caption: slot.caption,
          promptRef: slot.promptRef,
          approvedForPublic: false,
          ...PUBLISHED,
        },
      ),
    );
  }

  const badges = new Set(
    credentialsSource.flatMap((group) => group.items.map((item) => item.badge)).filter(Boolean),
  );
  for (const badge of badges) {
    if (!badge) continue;
    const legacyId = `badge-${path.posix.basename(badge, path.posix.extname(badge))}`;
    await withFile(
      legacyId,
      {
        legacyId,
        kind: "image",
        assetClass: "issuer-badge",
        alt: "",
        decorative: true,
        caption: "Issuer badge",
        source: BADGE_SOURCE,
        licence: BADGE_LICENCE,
        usageRights: BADGE_RIGHTS,
        approvedForPublic: true,
        ...PUBLISHED,
      },
      badge,
    );
    ids.set(badge, ids.get(legacyId) ?? 0);
  }
  return ids;
}

function mediaId(ids: Map<string, number>, key: string): number {
  const id = ids.get(key);
  if (!id) throw new Error(`No media record for "${key}".`);
  return id;
}

async function importContent(payload: Payload): Promise<void> {
  const media = await importMedia(payload);

  // Credentials and their groups.
  const credentialIds = new Map<string, number>();
  for (const [groupIndex, group] of credentialsSource.entries()) {
    await upsert(
      payload,
      "credential-groups",
      { category: { equals: group.category } },
      {
        category: group.category,
        title: group.title,
        sortOrder: (groupIndex + 1) * 10,
        ...PUBLISHED,
      },
    );
    for (const [index, item] of group.items.entries()) {
      credentialIds.set(
        item.id,
        await upsert(
          payload,
          "credentials",
          { legacyId: { equals: item.id } },
          {
            legacyId: item.id,
            category: item.category,
            title: item.title,
            issuer: item.issuer,
            identifier: item.identifier ?? null,
            year: item.year ?? null,
            expiry: item.expiry ?? null,
            url: item.url ?? null,
            badge: item.badge ? mediaId(media, item.badge) : null,
            verified: item.verified,
            sortOrder: (index + 1) * 10,
            ...PUBLISHED,
          },
        ),
      );
    }
  }

  // Project notes: published as today, but the "no identifying details" tick is left for a person.
  const proofIds: number[] = [];
  for (const proof of homeSource.selectedProof) {
    proofIds.push(
      await upsert(
        payload,
        "proof-items",
        { legacyId: { equals: proof.id } },
        {
          legacyId: proof.id,
          sector: proof.sector,
          challenge: proof.challenge,
          outcome: proof.outcome,
          metric: proof.metric ?? null,
          disclosureApproved: proof.disclosureApproved,
          noIdentifyingDetailsConfirmed: false,
          ...PUBLISHED,
        },
        { context: { ...context, [IMPORT_PUBLISH]: true } },
      ),
    );
  }

  // Services: first without related links, then the links once every service exists.
  const serviceIds = new Map<string, number>();
  for (const service of servicesSource) {
    serviceIds.set(
      service.slug,
      await upsert(
        payload,
        "services",
        { slug: { equals: service.slug } },
        {
          slug: service.slug,
          title: service.title,
          shortTitle: service.shortTitle,
          summary: service.summary,
          outcome: service.outcome,
          icon: service.icon,
          challenge: service.challenge,
          whyItMatters: service.whyItMatters,
          capability: service.capability,
          scopeAndOutputs: service.scopeAndOutputs.map((row) => ({
            scope: row.scope,
            outputs: list(row.outputs),
          })),
          deliveryApproach: service.deliveryApproach,
          standards: list(service.standards),
          evidence: service.evidence ?? null,
          media: {
            hero: mediaId(media, service.media.hero),
            detail: mediaId(media, service.media.detail),
          },
          seo: { title: service.seo.title, description: service.seo.description },
          enabled: service.enabled,
          sortOrder: service.sortOrder,
          ...PUBLISHED,
        },
      ),
    );
  }
  for (const service of servicesSource) {
    const id = serviceIds.get(service.slug);
    await loose(payload).update({
      ...base,
      collection: "services",
      id,
      data: {
        relatedServices: service.relatedSlugs.map((slug) => serviceIds.get(slug)).filter(Boolean),
        ...PUBLISHED,
      },
    });
  }

  for (const page of [privacySource, termsSource, accessibilitySource]) {
    await upsert(
      payload,
      "legal-pages",
      { slug: { equals: page.slug } },
      {
        slug: page.slug,
        title: page.title,
        lastUpdated: page.lastUpdated,
        reference: page.reference,
        adviserStatus: page.status,
        sections: page.sections,
        ...PUBLISHED,
      },
    );
  }

  for (const type of enquiryTypesSource) {
    await upsert(payload, "enquiry-types", { value: { equals: type.value } }, { ...type });
  }

  // Globals.
  const api = loose(payload);
  await api.updateGlobal({
    ...base,
    slug: "site-settings",
    data: {
      ...siteSource,
      abn: siteSource.abn ?? null,
      address: siteSource.address ?? null,
      linkedIn: siteSource.linkedIn ?? null,
      mapsUrl: siteSource.mapsUrl ?? null,
      officeAddress: siteSource.officeAddress ?? {},
      businessHours: siteSource.businessHours ?? [],
      ...PUBLISHED,
    },
  });

  const { trustStripIds, ...home } = homeSource;
  await api.updateGlobal({
    ...base,
    slug: "home",
    data: {
      hero: home.hero,
      trustStrip: trustStripIds.map((id) => credentialIds.get(id)),
      trustStripCopy: home.trustStripCopy,
      coreCapabilitiesTitle: home.coreCapabilitiesTitle,
      coreCapabilitiesIntro: home.coreCapabilitiesIntro,
      coreCapabilities: home.coreCapabilities.map((row) => ({
        service: serviceIds.get(row.slug),
        title: row.title,
        outcome: row.outcome,
      })),
      whyDeepTsight: { ...home.whyDeepTsight, paragraphs: list(home.whyDeepTsight.paragraphs) },
      problemsAddressed: home.problemsAddressed,
      deliveryApproach: home.deliveryApproach,
      selectedProofTitle: home.selectedProofTitle,
      selectedProof: proofIds,
      perthContext: { ...home.perthContext, sectors: list(home.perthContext.sectors) },
      finalCta: home.finalCta,
      media: {
        problems: mediaId(media, home.media.problems),
        why: mediaId(media, home.media.why),
        close: mediaId(media, home.media.close),
      },
      ...PUBLISHED,
    },
  });

  await api.updateGlobal({
    ...base,
    slug: "about",
    data: {
      founder: aboutSource.founder,
      narrative: { ...aboutSource.narrative, paragraphs: list(aboutSource.narrative.paragraphs) },
      principles: aboutSource.principles,
      timeline: aboutSource.timeline,
      media: {
        portrait: mediaId(media, aboutSource.media.portrait),
        site: mediaId(media, aboutSource.media.site),
        desk: mediaId(media, aboutSource.media.desk),
      },
      ...PUBLISHED,
    },
  });

  await api.updateGlobal({
    ...base,
    slug: "pages",
    data: {
      ...pagesSource,
      services: { ...pagesSource.services, figure: mediaId(media, pagesSource.services.figure) },
      credentials: {
        ...pagesSource.credentials,
        figure: mediaId(media, pagesSource.credentials.figure),
      },
      contact: { ...pagesSource.contact, figure: mediaId(media, pagesSource.contact.figure) },
      ...PUBLISHED,
    },
  });

  const seo: Record<string, unknown> = {};
  for (const [route, key] of Object.entries(SEO_ROUTES)) {
    const entry = seoSource[route];
    if (!entry) throw new Error(`No SEO entry for ${route} in the static source.`);
    seo[key] = { title: entry.title, description: entry.description };
  }
  await api.updateGlobal({ ...base, slug: "seo", data: { ...seo, ...PUBLISHED } });
}

async function resetContent(payload: Payload): Promise<void> {
  const api = loose(payload);
  for (const collection of CONTENT_COLLECTIONS) {
    await api.delete({ ...base, collection, where: { id: { exists: true } } });
  }
}

/** Field paths (never values) whose text carries a placeholder marker. */
function placeholderPaths(value: unknown, prefix: string, out: string[]): void {
  if (typeof value === "string") {
    if (isPlaceholder(value)) out.push(prefix);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => placeholderPaths(item, `${prefix}[${index}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value))
      placeholderPaths(item, prefix ? `${prefix}.${key}` : key, out);
  }
}

async function counts(payload: Payload): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const collection of CONTENT_COLLECTIONS) {
    result[collection] = (await loose(payload).find({ ...base, collection, limit: 0 })).totalDocs;
  }
  return result;
}

/** What the import will create, counted from the static source. */
function expectedCounts(): Record<string, number> {
  const badges = new Set(
    credentialsSource.flatMap((group) => group.items.map((item) => item.badge)).filter(Boolean),
  );
  return {
    services: servicesSource.length,
    "proof-items": homeSource.selectedProof.length,
    credentials: credentialsSource.reduce((total, group) => total + group.items.length, 0),
    "credential-groups": credentialsSource.length,
    "legal-pages": 3,
    "enquiry-types": enquiryTypesSource.length,
    media: mediaRegisterSource.length + imageSlotSource.length + badges.size,
  };
}

function writeReport(dbName: string, totals: Record<string, number>): void {
  const paths: string[] = [];
  placeholderPaths(siteSource, "site-settings", paths);
  placeholderPaths(homeSource, "home", paths);
  placeholderPaths(aboutSource, "about", paths);
  placeholderPaths(pagesSource, "pages", paths);
  placeholderPaths(seoSource, "seo", paths);
  servicesSource.forEach((service) =>
    placeholderPaths(service, `services[${service.slug}]`, paths),
  );
  credentialsSource.forEach((group) =>
    group.items.forEach((item) => placeholderPaths(item, `credentials[${item.id}]`, paths)),
  );
  mediaRegisterSource.forEach((asset) => placeholderPaths(asset, `media[${asset.id}]`, paths));
  [privacySource, termsSource, accessibilitySource].forEach((page) =>
    placeholderPaths(page, `legal-pages[${page.slug}]`, paths),
  );
  const badgeCount = new Set(
    credentialsSource.flatMap((group) => group.items.map((item) => item.badge)).filter(Boolean),
  ).size;

  const lines = [
    "# Import report",
    "",
    dbName
      ? `Generated by \`scripts/cms/import-from-source.ts\` on ${new Date().toISOString()} into \`${dbName}\`.`
      : `Generated by \`scripts/cms/import-from-source.ts --dry-run\` on ${new Date().toISOString()}. **Nothing was imported** (no database): the counts are what the import will create, read from the static source.`,
    "Counts are records after the import. Field paths only; no content values.",
    "",
    "## Records per collection",
    "",
    "| Collection | Records |",
    "|---|---|",
    ...Object.entries(totals).map(([name, total]) => `| ${name} | ${total} |`),
    "",
    "Globals imported: site-settings, home, about, pages, seo.",
    "",
    "## Notes",
    "",
    `- ${badgeCount} issuer badges became media records with licence \`TBD — CLIENT\` (rights to confirm).`,
    '- Project notes are published as today, with "Contains no client, site or plant names" left unticked:',
    "  an editor must confirm it before the next publish.",
    "",
    `## Field paths with placeholder markers (${paths.length})`,
    "",
    ...paths.map((item) => `- \`${item}\``),
    "",
  ];
  fs.writeFileSync(path.join("docs", "cms", "import-report.md"), lines.join("\n"));
}

async function main(): Promise<void> {
  if (process.argv.includes("--dry-run")) {
    writeReport("", expectedCounts());
    console.log("Dry run: wrote docs/cms/import-report.md from the static source.");
    return;
  }
  const db = parseDbEnvName(argValue("--db") ?? "");
  const payload = await payloadFor(db);
  try {
    if (process.argv.includes("--reset")) await resetContent(payload);
    await importContent(payload);
    const totals = await counts(payload);
    console.log(
      `Imported into ${db}: ${Object.entries(totals)
        .map(([name, total]) => `${name} ${total}`)
        .join(", ")}`,
    );
    if (process.argv.includes("--report")) {
      writeReport(
        new URL(process.env["DATABASE_URI"] ?? "postgres://x/unknown").pathname.slice(1),
        totals,
      );
      console.log("Wrote docs/cms/import-report.md");
    }
  } finally {
    await payload.destroy();
  }
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(
      `Import failed: ${redact(error instanceof Error ? error.message : String(error))}`,
    );
    process.exit(1);
  },
);
