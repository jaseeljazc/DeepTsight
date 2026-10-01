import { navRoutes, seoEntrySchema, serviceSchema, siteSchema } from "./schema";
import type { Credential, CredentialGroup, SeoEntry, Service, Site, SiteSource } from "./types";

/*
 * Rules both content sources apply, so static and CMS mode behave identically (D-02, D-06).
 * The data comes from the source; what is shown, in which order, and what fails the build is decided
 * here.
 */

/**
 * Unverified entries never reach a production build (FR-13, FR-15, FR-21). Outside production
 * they are passed through so the design can show them as marked placeholders (CR-02).
 */
export function showPending(): boolean {
  return process.env["NEXT_PUBLIC_ENV"] !== "production";
}

/** Navigation from the fixed routes and the stored labels (D-07). Insights shows only when on. */
export function buildSite(source: SiteSource): Site {
  const nav = navRoutes
    .filter((route) => route.key !== "insights" || source.insightsEnabled)
    .map((route) => ({ label: source.navLabels[route.key], href: route.href }));
  return siteSchema.parse({ ...source, nav });
}

/** A reference to a figure that does not exist is a content error and fails the render. */
export function assertFigures(
  ids: Record<string, string>,
  known: Set<string>,
  where: string,
): void {
  for (const [field, id] of Object.entries(ids)) {
    if (!known.has(id)) throw new Error(`${where} ${field} refers to unknown figure "${id}".`);
  }
}

function byOrder(a: Service, b: Service): number {
  return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);
}

/**
 * Validates every service and its references, then keeps the enabled ones in display order and
 * removes disabled services from the related lists (FR-19).
 */
export function enabledServices(services: unknown[], knownFigures: Set<string>): Service[] {
  const all = services.map((service) => serviceSchema.parse(service));
  const slugs = new Set(all.map((service) => service.slug));
  for (const service of all) {
    for (const related of service.relatedSlugs) {
      if (!slugs.has(related)) {
        throw new Error(`Service "${service.slug}" lists unknown related service "${related}".`);
      }
    }
    assertFigures(service.media, knownFigures, `Service "${service.slug}" media`);
  }
  const enabled = all.filter((service) => service.enabled).sort(byOrder);
  const enabledSlugs = new Set(enabled.map((service) => service.slug));
  return enabled.map((service) => ({
    ...service,
    relatedSlugs: service.relatedSlugs.filter((slug) => enabledSlugs.has(slug)),
  }));
}

/** Groups in order with only verified items (outside production: all), empty groups dropped. */
export function visibleCredentialGroups(
  groups: CredentialGroup[],
  pending = showPending(),
): CredentialGroup[] {
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.verified || pending) }))
    .filter((group) => group.items.length > 0);
}

export function visibleCredentials(items: Credential[], pending = showPending()): Credential[] {
  return items.filter((item) => item.verified || pending);
}

export function seoOrFallback(entry: SeoEntry | undefined, route: string): SeoEntry {
  return seoEntrySchema.parse(
    entry ?? {
      title: "Industrial engineering and OT cybersecurity",
      description:
        "Engineering consulting for critical infrastructure and heavy industry: control systems, OT cybersecurity, IT/OT segregation and plant reliability.",
      canonical: route,
    },
  );
}
