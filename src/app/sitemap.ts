import type { MetadataRoute } from "next";
import { getServices, getArticles, getSite } from "@/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const services = await getServices();
  const articles = await getArticles();
  const baseUrl = "https://deeptsight.com.au";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/credentials`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/accessibility`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Include services child routes
  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // Include insights only if enabled & articles exist
  const insightRoutes: MetadataRoute.Sitemap = site.insightsEnabled
    ? articles.map((article) => ({
        url: `${baseUrl}/insights/${article.slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: "monthly",
        priority: 0.7,
      }))
    : [];

  return [...staticRoutes, ...serviceRoutes, ...insightRoutes];
}
