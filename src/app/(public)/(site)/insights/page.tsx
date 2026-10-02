import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getArticles, getSeo, getSite } from "@/content";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { MarkedText } from "@/components/primitives/placeholder";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("/insights");
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonical,
      types: { "application/rss+xml": "/insights/rss.xml" },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      type: "website",
    },
  };
}

/** Insights index (FR-25). A ruled list, newest first; 404 while Insights is off or empty (FR-27). */
export default async function InsightsPage() {
  const [site, articles, seo] = await Promise.all([getSite(), getArticles(), getSeo("/insights")]);

  if (!site.insightsEnabled || articles.length === 0) {
    notFound();
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: site.navLabels.insights }]}
        title={seo.title}
        lead={seo.description}
      />
      <Container className="section-b">
        <ol className="border-ink-900 border-t">
          {articles.map((article) => (
            <li
              key={article.slug}
              className="border-rule grid grid-cols-1 gap-x-8 gap-y-3 border-b py-8 lg:grid-cols-12"
            >
              <p className="text-steel-600 text-caption font-mono lg:col-span-3">
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                <br />
                {article.readingMinutes} min
              </p>
              <div className="lg:col-span-8 lg:col-start-5">
                <h2 className="font-display text-h3 text-ink-900 font-medium">
                  <NextLink href={`/insights/${article.slug}`} className="link-rule">
                    <MarkedText text={article.title} />
                  </NextLink>
                </h2>
                <p className="text-ink-700 measure mt-3">
                  <MarkedText text={article.summary} />
                </p>
                {article.tags.length > 0 && (
                  <p className="text-steel-600 text-small mt-3">{article.tags.join(", ")}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
