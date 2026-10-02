import type { Site, AboutContent, Service, Article } from "@/content/types";
import { isPlaceholder as hasPlaceholder } from "@/lib/placeholder";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

/**
 * Organization JSON-LD schema (SEO-04)
 * Emits schema only if essential information is not a placeholder.
 */
export function organizationLd(site: Site) {
  if (hasPlaceholder(site.displayName) || hasPlaceholder(site.email)) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.displayName,
    legalName: site.legalName,
    url: siteUrl,
    email: site.email,
    ...(site.phone && !hasPlaceholder(site.phone) ? { telephone: site.phone } : {}),
    ...(site.address && !hasPlaceholder(site.address)
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: site.address,
            addressLocality: "Perth",
            addressRegion: "WA",
            addressCountry: "AU",
          },
        }
      : {}),
    ...(site.linkedIn && !hasPlaceholder(site.linkedIn) ? { sameAs: [site.linkedIn] } : {}),
  };
}

/**
 * LocalBusiness JSON-LD schema (SEO-04)
 */
export function localBusinessLd(site: Site) {
  if (hasPlaceholder(site.displayName)) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.displayName,
    url: siteUrl,
    ...(site.phone && !hasPlaceholder(site.phone) ? { telephone: site.phone } : {}),
    email: site.email,
    // No street address is published (founder instruction); locality only.
    address: {
      "@type": "PostalAddress",
      ...(site.address && !hasPlaceholder(site.address) ? { streetAddress: site.address } : {}),
      addressLocality: "Perth",
      addressRegion: "WA",
      addressCountry: "AU",
    },
    areaServed: {
      "@type": "Country",
      name: "Australia",
    },
  };
}

/**
 * Person JSON-LD schema (About page) (SEO-04)
 */
export function personLd(about: AboutContent, site: Site) {
  if (hasPlaceholder(about.founder.name) || hasPlaceholder(about.founder.jobTitle)) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.founder.name,
    jobTitle: about.founder.jobTitle,
    worksFor: {
      "@type": "Organization",
      name: site.displayName,
      url: siteUrl,
    },
    description: about.narrative.title,
    ...(site.linkedIn && !hasPlaceholder(site.linkedIn) ? { sameAs: [site.linkedIn] } : {}),
  };
}

/**
 * Service JSON-LD schema (SEO-04)
 */
export function serviceLd(service: Service, site: Site) {
  if (hasPlaceholder(service.title) || hasPlaceholder(service.summary)) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.shortTitle,
    description: service.summary,
    provider: {
      "@type": "Organization",
      name: site.displayName,
      url: siteUrl,
    },
    url: absoluteUrl(`/services/${service.slug}`),
  };
}

/**
 * Article JSON-LD schema (SEO-04)
 */
export function articleLd(article: Article, site: Site, about?: AboutContent) {
  if (hasPlaceholder(article.title) || hasPlaceholder(article.summary)) {
    return null;
  }

  const url = absoluteUrl(`/insights/${article.slug}`);
  const founder = about?.founder;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    // Only a verified name: a placeholder is never published as an author.
    ...(founder && !hasPlaceholder(founder.name)
      ? { author: { "@type": "Person" as const, name: founder.name } }
      : {}),
    publisher: {
      "@type": "Organization",
      name: site.displayName,
      url: siteUrl,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

/**
 * BreadcrumbList JSON-LD schema (SEO-04)
 */
export function breadcrumbLd(items: { name: string; url: string }[]) {
  if (!items || items.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
