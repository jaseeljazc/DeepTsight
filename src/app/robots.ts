import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env["NEXT_PUBLIC_ENV"] === "production" || process.env.NODE_ENV === "production";
  const baseUrl = "https://deeptsight.com.au";

  if (!isProduction) {
    // Disallow all crawlers outside production (SEO-07)
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
        disallow: ["/design-system", "/contact/thank-you"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
