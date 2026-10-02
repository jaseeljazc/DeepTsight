import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getArticles, getSite } from "@/content";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SpecBlock } from "@/components/primitives/spec-block";
import { RichText } from "@/components/content/rich-text";
import { JsonLd } from "@/components/seo/json-ld";
import { articleLd, breadcrumbLd } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site-url";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-static";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const site = await getSite();
  if (!site.insightsEnabled) return [];
  return (await getArticles()).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [site, article] = await Promise.all([getSite(), getArticle(slug)]);
  if (!site.insightsEnabled || !article) return { title: "Page not found" };
  const seo = article.seo ?? {
    title: article.title,
    description: article.summary,
    canonical: `/insights/${article.slug}`,
  };
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      type: "article",
      publishedTime: article.publishedAt,
      ...(article.updatedAt ? { modifiedTime: article.updatedAt } : {}),
    },
  };
}

/** One Insights article (FR-26). Rich text is rendered as React nodes inside Prose. */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [site, article] = await Promise.all([getSite(), getArticle(slug)]);
  if (!site.insightsEnabled || !article) notFound();

  return (
    <>
      <JsonLd data={articleLd(article, site)} />
      <JsonLd
        data={breadcrumbLd([
          { name: site.navLabels.home, url: absoluteUrl("/") },
          { name: site.navLabels.insights, url: absoluteUrl("/insights") },
          { name: article.title, url: absoluteUrl(`/insights/${article.slug}`) },
        ])}
      />
      <PageHeader
        breadcrumbs={[
          { label: site.navLabels.insights, href: "/insights" },
          { label: article.title },
        ]}
        title={article.title}
        lead={article.summary}
        aside={
          <SpecBlock
            label="Article details"
            items={[
              {
                label: "Published",
                value: (
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                ),
                mono: true,
              },
              { label: "Reading time", value: `${article.readingMinutes} min`, mono: true },
              ...(article.tags.length > 0
                ? [{ label: "Categories", value: article.tags.join(", ") }]
                : []),
            ]}
          />
        }
      />
      <Container className="section-b grid grid-cols-1 gap-x-8 lg:grid-cols-12">
        <div className="lg:col-span-8 lg:col-start-5">
          <RichText value={article.body} />
        </div>
      </Container>
    </>
  );
}
