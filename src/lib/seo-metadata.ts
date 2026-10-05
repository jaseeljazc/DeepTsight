import type { Metadata } from "next";
import type { SeoEntry } from "@/content/types";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Title, description, canonical and link-preview metadata for a page, from its SEO entry. When the
 * entry has an approved share image it is used for Open Graph and Twitter previews; otherwise the
 * generated card (src/app/opengraph-image.tsx) is used.
 */
export function seoMetadata(seo: SeoEntry): Metadata {
  const image = seo.ogImage ? absoluteUrl(seo.ogImage) : undefined;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    ...(image ? { twitter: { card: "summary_large_image", images: [image] } } : {}),
  };
}
