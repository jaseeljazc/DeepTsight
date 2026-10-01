import { getArticles, getSeo, getSite } from "@/content";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/** Every value is escaped for XML; nothing from the CMS reaches the feed unescaped. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 feed of published articles (FR-29). 404 while Insights is off. */
export async function GET() {
  const [site, seo, articles] = await Promise.all([getSite(), getSeo("/insights"), getArticles()]);
  if (!site.insightsEnabled) return new Response("Not found", { status: 404 });

  const items = articles.map((article) => {
    const url = absoluteUrl(`/insights/${article.slug}`);
    const published = new Date(article.publishedAt);
    return [
      "    <item>",
      `      <title>${xml(article.title)}</title>`,
      `      <link>${xml(url)}</link>`,
      `      <guid isPermaLink="true">${xml(url)}</guid>`,
      ...(Number.isNaN(published.getTime())
        ? []
        : [`      <pubDate>${published.toUTCString()}</pubDate>`]),
      `      <description>${xml(article.summary)}</description>`,
      ...article.tags.map((tag) => `      <category>${xml(tag)}</category>`),
      "    </item>",
    ].join("\n");
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${xml(`${seo.title} | ${site.displayName}`)}</title>`,
    `    <link>${xml(absoluteUrl("/insights"))}</link>`,
    `    <description>${xml(seo.description)}</description>`,
    "    <language>en-AU</language>",
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
