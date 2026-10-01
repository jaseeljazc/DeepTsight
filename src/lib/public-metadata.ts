import type { Metadata } from "next";
import { isProductionSite } from "@/lib/public-env";
import { siteUrl } from "@/lib/site-url";

/**
 * Default metadata for every public page. Shared by the public root layout and the global 404,
 * which renders outside any layout because the app has two root layouts (public site and CMS admin).
 */
export const publicMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Preview, staging and local builds are never indexed (SEO-07).
  ...(isProductionSite ? {} : { robots: { index: false, follow: false } }),
  title: {
    template: "%s | DeepTsight Consulting",
    default: "DeepTsight Consulting | Industrial engineering and OT cybersecurity",
  },
  description:
    "Engineering consulting for critical infrastructure and heavy industry: control systems, OT cybersecurity, IT/OT segregation and plant reliability.",
  openGraph: {
    title: "DeepTsight Consulting | Industrial engineering and OT cybersecurity",
    description:
      "Engineering consulting for critical infrastructure and heavy industry: control systems, OT cybersecurity, IT/OT segregation and plant reliability.",
    url: siteUrl,
    siteName: "DeepTsight Consulting",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepTsight Consulting | Industrial engineering and OT cybersecurity",
    description:
      "Engineering consulting for critical infrastructure and heavy industry: control systems, OT cybersecurity, IT/OT segregation and plant reliability.",
  },
};
