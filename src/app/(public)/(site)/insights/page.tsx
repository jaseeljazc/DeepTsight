import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticles, getSeo, getSite } from "@/content";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ArticleList } from "@/components/content/article-list";
import { CategoryFilter } from "@/components/content/category-filter";
import { usedCategories } from "@/lib/insights";

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
        <CategoryFilter categories={usedCategories(articles)} />
        <ArticleList articles={articles} />
      </Container>
    </>
  );
}
