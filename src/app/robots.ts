import type { MetadataRoute } from "next";
import { isProductionSite } from "@/lib/public-env";
import { absoluteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // Decided by NEXT_PUBLIC_ENV only: `next build` sets NODE_ENV=production for previews too (SEO-07).
  if (!isProductionSite) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The CMS admin and its API are never crawled (D-13); they also send X-Robots-Tag.
        disallow: ["/design-system", "/contact/thank-you", "/admin", "/api", "/preview"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
