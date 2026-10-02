import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticles, getSite } from "@/content";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ArticleList } from "@/components/content/article-list";
import { CategoryFilter } from "@/components/content/category-filter";
import { articlesInCategory, usedCategories } from "@/lib/insights";

export const dynamic = "force-static";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const [site, articles] = await Promise.all([getSite(), getArticles()]);
  if (!site.insightsEnabled) return [];
  return usedCategories(articles).map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [site, articles] = await Promise.all([getSite(), getArticles()]);
  const category = usedCategories(articles).find((item) => item.slug === slug);
  if (!site.insightsEnabled || !category) return { title: "Page not found" };
  return {
    title: `${category.name} | ${site.navLabels.insights}`,
    alternates: { canonical: `/insights/category/${category.slug}` },
    // The same articles are on /insights; keep the filtered views out of search results.
    robots: { index: false, follow: true },
  };
}

/** Insights filtered to one category (FR-28). 404 for an unknown or empty category. */
export default async function InsightsCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [site, articles] = await Promise.all([getSite(), getArticles()]);
  const categories = usedCategories(articles);
  const category = categories.find((item) => item.slug === slug);
  if (!site.insightsEnabled || !category) notFound();

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: site.navLabels.insights, href: "/insights" },
          { label: category.name },
        ]}
        title={category.name}
      />
      <Container className="section-b">
        <CategoryFilter categories={categories} current={category.slug} />
        <ArticleList articles={articlesInCategory(articles, category.slug)} />
      </Container>
    </>
  );
}
