import type { MetadataRoute } from "next";
import {
  getAboutContent,
  getArticles,
  getHomeContent,
  getLegalPage,
  getServices,
  getSite,
} from "@/content";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const services = await getServices();
  const articles = await getArticles();
  const [home, about, privacy, terms, accessibility] = await Promise.all([
    getHomeContent(),
    getAboutContent(),
    getLegalPage("privacy"),
    getLegalPage("terms"),
    getLegalPage("accessibility"),
  ]);
  const baseUrl = siteUrl;
  // A stored change date where the CMS records one; otherwise the build date.
  const changed = (updatedAt?: string) => (updatedAt ? new Date(updatedAt) : new Date());

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: changed(home.updatedAt),
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
      lastModified: changed(about.updatedAt),
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
      lastModified: changed(privacy?.updatedAt),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: changed(terms?.updatedAt),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/accessibility`,
      lastModified: changed(accessibility?.updatedAt),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Include services child routes
  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: changed(service.updatedAt),
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
