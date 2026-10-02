import type { ArticleSummary } from "@/content/types";

/** Addresses under /insights that are routes, not articles. */
export const RESERVED_ARTICLE_SLUGS: readonly string[] = ["category"];

export type CategoryLink = { slug: string; name: string; count: number };

/** Categories that at least one article carries, sorted by name. */
export function usedCategories(articles: ArticleSummary[]): CategoryLink[] {
  const found = new Map<string, CategoryLink>();
  for (const article of articles) {
    for (const category of article.categories) {
      const existing = found.get(category.slug);
      if (existing) existing.count += 1;
      else found.set(category.slug, { ...category, count: 1 });
    }
  }
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name, "en-AU"));
}

export function articlesInCategory(articles: ArticleSummary[], slug: string): ArticleSummary[] {
  return articles.filter((article) =>
    article.categories.some((category) => category.slug === slug),
  );
}
