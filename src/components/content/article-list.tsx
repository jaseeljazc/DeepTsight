import NextLink from "next/link";
import { Link } from "@/components/primitives/link";
import { MarkedText } from "@/components/primitives/placeholder";
import { formatDate } from "@/lib/dates";
import type { ArticleSummary } from "@/content/types";

/** The Insights register: a ruled list, newest first, as the index and the category pages show it. */
export function ArticleList({ articles }: { articles: ArticleSummary[] }) {
  return (
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
            {article.categories.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-x-4">
                {article.categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/insights/category/${category.slug}`}
                      variant="subtle"
                      className="text-small"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
