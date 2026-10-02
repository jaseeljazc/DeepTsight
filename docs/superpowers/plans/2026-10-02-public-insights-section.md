# Public Insights (articles) section: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the already-built `/insights` section from "built, switched off, half-tested" to "ready to launch with real articles", authored in the CMS, with a category filter, a reviewed design, JSON-LD authorship and full accessibility/responsive proof.

**Architecture:** Nothing is rebuilt. The routes (`/insights`, `/insights/[slug]`, `/insights/rss.xml`), the Lexical renderer, the `articles` and `article-categories` collections and the sitemap entries already exist and are gated by `insightsEnabled`. This plan (1) proves them end to end against the test database, (2) adds category data to the Zod contract first, then the mapper and a statically generated `/insights/category/[slug]` route, (3) does a design pass against `DESIGN.md` §0, (4) completes Article JSON-LD, (5) adds accessibility and responsive tests, and (6) writes the owner launch runbook. All content still flows through `@/content`.

**Tech Stack:** Next.js 16.3.7 (static, `force-static`), Payload 3.90.2 (Lexical), Zod, Tailwind v4 tokens from `globals.css`, `node:test` + `tsx` for unit tests, Playwright + axe for E2E and a11y. No new dependency.

**Spec:** `REQUIREMENTS.md` §1.5 (FR-25 to FR-29), `SEO-04`; `docs/cms/01_BUILD_PLAN.md` Phase 13; `docs/cms/02_CONTENT_MODEL.md`; decisions below, which were given by the project owner on 2026-10-02.

## Decisions (from the owner, 2026-10-02)

| Question | Decision |
| --- | --- |
| Launch scope (Q-01 / OPEN-05) | **Launch with articles.** Insights is switched on only after real, approved articles are published. |
| Authoring | **In the CMS only.** No MDX files and no MDX dependency. FR-26's "MDX in Phase 1" is superseded; record it in `TASKS.md` decisions log. |
| Extras in scope | Design pass on index and article pages; category filter (FR-28); accessibility and responsive QA. |

## Global Constraints

- **Never invent client facts** (`CLAUDE.md` §3). No article text, author, date, category or statistic is written by an agent. Test fixtures use "Test" names and `example.com` only (`CLAUDE.md` §10).
- **Approval flags are approver-only.** Agents never set `insightsEnabled` to `true` anywhere except inside a test that resets it to `false` in `finally` (as `tests/cms/insights.spec.ts` already does). The static `site.ts` stays `insightsEnabled: false`.
- **Do not set `CMS_ADMIN_ENABLED` or change `src/proxy.ts`.** Enabling the CMS in production is the owner's call (`CLAUDE.md` §10).
- **Content seam:** pages and components read only through `@/content`; no component imports Payload; client components never import `@/content`.
- **Zod is the contract:** add the field to `src/content/schema.ts` first, then the mapper, then the CMS source, then tests (`CLAUDE.md` §10).
- **Design (`CLAUDE.md` §4, `DESIGN.md` §0.2):** no shadows, radius 2px/4px only, tokens only (no raw hex, no arbitrary Tailwind values), no uppercase mono eyebrows, no card grids, no gradients, no emoji icons, sentence case.
- **No client-side data fetching;** the site is statically rendered.
- **Accessibility:** WCAG 2.2 AA, 44×44px targets, visible focus, zero axe violations.
- **Definition of done per task** (`CLAUDE.md` §8): `pnpm typecheck`, `pnpm lint`, `pnpm build` clean; relevant tests pass; tick the item in `TASKS.md` and `pending_work.md`; add judgement calls to the decisions log.
- Unit test command: `npx tsx --test <file>`. Commit style: Conventional Commits, ending with the attribution trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Skills to use while executing

| When | Skill |
| --- | --- |
| Every new function | `superpowers:test-driven-development` |
| Task 5 (design pass) | `frontend-design`, `impeccable` (critique, then polish), `design-taste-frontend`; review with the `UI Finish-Gate Reviewer` agent; copy check with `deslop` |
| Task 6 (JSON-LD) | `claude-seo:seo-schema` to validate the output |
| Task 7 | `web-design-guidelines` for the review pass |
| Before claiming any task done | `superpowers:verification-before-completion` |
| End | `superpowers:requesting-code-review`, then `superpowers:finishing-a-development-branch` |

## Review Focus

Failure modes the requirements imply but no existing test exercises, most likely first:

1. An article whose slug is `category` would be unreachable once `/insights/category/[slug]` exists. Expected: publishing it is refused with a clear message (Task 3).
2. A category with no published articles, or a draft category, must not produce a page or a filter link. Expected: not listed; its URL answers 404 (Tasks 2, 4).
3. An article with no categories, or whose only category is a draft. Expected: renders normally with no "Categories" row and no empty links (Tasks 2, 5).
4. An article edited after publishing. Expected: "Updated" date shown only when it differs from the published date (Task 5).
5. Founder name or job title still a `[PLACEHOLDER]`. Expected: Article JSON-LD omits `author` rather than emitting placeholder text (Task 6).

## File Structure

| File | Responsibility |
| --- | --- |
| `src/content/schema.ts` (modify) | Add `categories` to `articleSummarySchema` (the contract). |
| `src/content/mappers/index.ts` (modify) | `mapArticle` emits `categories` and derives `tags` from it. |
| `src/content/cms-source.ts` (modify) | `getArticles` passes `categories` through. |
| `src/lib/insights.ts` (create) | Pure helpers: `usedCategories`, `articlesInCategory`, `RESERVED_ARTICLE_SLUGS`. |
| `src/cms/hooks/validators.ts` (modify) | `validateArticle` refuses reserved slugs. |
| `src/components/content/article-list.tsx` (create) | The ruled article list, shared by the index and category pages. |
| `src/components/content/category-filter.tsx` (create) | Links row: "All" plus each used category. Server component, no JS. |
| `src/app/(public)/(site)/insights/page.tsx` (modify) | Use the shared list and filter. |
| `src/app/(public)/(site)/insights/category/[slug]/page.tsx` (create) | Statically generated category listing. |
| `src/app/(public)/(site)/insights/[slug]/page.tsx` (modify) | Updated date, category links, end-of-article actions. |
| `src/lib/jsonld.ts` (modify) | `articleLd` gains `author` and `mainEntityOfPage`. |
| `tests/cms/unit/article-categories.test.ts` (create) | Mapper and helper tests. |
| `tests/cms/unit/article-jsonld.test.ts` (create) | JSON-LD tests. |
| `tests/cms/insights.spec.ts` (modify) | Category, nav, a11y and overflow checks with fixtures. |
| `docs/CONTENT_EDITING_GUIDE.md`, `TASKS.md`, `pending_work.md` (modify) | Runbook and ticks. |

---

### Task 1: Baseline the untested Phase 13 work

The CMS Insights spec was written during a night with no database (blocker B-1) and never run. Find out what is really broken before building on it.

**Files:**
- Read: `tests/cms/insights.spec.ts`, `tests/e2e/insights-off.spec.ts`, `docs/cms/PROGRESS.md` (Phase 13)
- Modify (only if a test fails for a real defect): the file the failure points to

**Interfaces:**
- Consumes: `.env.local` with `DATABASE_URI_TEST` (database name ends in `_test`); never `DATABASE_URI`.
- Produces: a recorded baseline (pass/fail per spec) in the `TASKS.md` decisions log.

- [ ] **Step 1: Confirm the test database is configured**

Run: `npx tsx scripts/cms/check-db.ts`
Expected: reports `DATABASE_URI_TEST` reachable. If not, stop and ask the owner (do not create databases or roles).

- [ ] **Step 2: Run the Insights-off spec against the static build**

Run: `npx pnpm test:e2e -- tests/e2e/insights-off.spec.ts`
Expected: 2 passed.

- [ ] **Step 3: Run the CMS suite, which includes `tests/cms/insights.spec.ts`**

Run: `npx pnpm cms:test`
Expected: all specs pass. If `insights.spec.ts` fails, note the exact assertion.

- [ ] **Step 4: Fix any real defect with a failing test first**

For each failure: reproduce with the smallest spec, fix the cause in the code (not the test), re-run Step 3. Use `superpowers:systematic-debugging`.

- [ ] **Step 5: Record the baseline and commit**

Add one line to the `TASKS.md` decisions log: `2026-10-DD: Insights Phase 13 baseline: <passed / what was fixed>.` Also log the authoring decision: `FR-26 "MDX" superseded: articles are authored in the CMS only (owner, 2026-10-02).`

```bash
git add TASKS.md
git commit -m "docs: record Insights baseline and CMS-only authoring decision"
```

---

### Task 2: Category data in the contract (Zod, mapper, CMS source)

**Files:**
- Modify: `src/content/schema.ts` (the `articleSummarySchema`, around line 251)
- Modify: `src/content/mappers/index.ts` (`mapArticle`, around line 433)
- Modify: `src/content/cms-source.ts` (`getArticles`, around line 295)
- Test: `tests/cms/unit/article-categories.test.ts` (create)

**Interfaces:**
- Produces: `ArticleSummary.categories: { slug: string; name: string }[]` (published categories only). `tags: string[]` is kept and is always `categories.map(c => c.name)`. `Article` inherits `categories` because `articleSchema` extends the summary.
- Consumed by: Tasks 4, 5, 6.

- [ ] **Step 1: Write the failing test**

Create `tests/cms/unit/article-categories.test.ts`:

```ts
/**
 * Article categories reach the site as {slug, name} pairs, published ones only.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { mapArticle } from "../../../src/content/mappers";

const base = {
  slug: "test-note",
  title: "Test note",
  summary: "Test summary",
  publishedAt: "2026-10-01T00:00:00.000Z",
  readingMinutes: 2,
  _status: "published",
  body: { root: { children: [] } },
};

test("mapArticle returns published categories with slug and name", () => {
  const article = mapArticle({
    ...base,
    categories: [
      { id: 1, slug: "test-one", name: "Test one", _status: "published" },
      { id: 2, slug: "test-two", name: "Test two", _status: "draft" },
    ],
  });
  assert.deepEqual(article.categories, [{ slug: "test-one", name: "Test one" }]);
  assert.deepEqual(article.tags, ["Test one"]);
});

test("mapArticle gives an empty list when an article has no categories", () => {
  const article = mapArticle({ ...base });
  assert.deepEqual(article.categories, []);
  assert.deepEqual(article.tags, []);
});

test("mapArticle drops a category with no slug or no name", () => {
  const article = mapArticle({
    ...base,
    categories: [{ id: 3, name: "Test no slug", _status: "published" }],
  });
  assert.deepEqual(article.categories, []);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test tests/cms/unit/article-categories.test.ts`
Expected: FAIL (`article.categories` is `undefined`).

- [ ] **Step 3: Add the field to the contract**

In `src/content/schema.ts`, inside `articleSummarySchema` after `readingMinutes`:

```ts
  /** Published categories, for the filter and the category links. `tags` holds the same names. */
  categories: z.array(z.object({ slug: z.string(), name: z.string() })),
```

- [ ] **Step 4: Emit it from the mapper**

In `src/content/mappers/index.ts`, replace the `tags:` block of `mapArticle` and compute `categories` first:

```ts
export function mapArticle(doc: Doc, draft = false): Article {
  const body = doc["body"];
  const categories = refs(doc, "categories")
    .map(asDoc)
    .filter((category) => draft || category["_status"] === "published")
    .map((category) => ({ slug: str(category, "slug"), name: str(category, "name") }))
    .filter((category) => category.slug.length > 0 && category.name.length > 0);
  return {
    slug: str(doc, "slug"),
    title: str(doc, "title"),
    summary: str(doc, "summary"),
    publishedAt: opt(doc, "publishedAt") ?? opt(doc, "updatedAt") ?? "",
    readingMinutes: Math.max(1, num(doc, "readingMinutes", 1)),
    categories,
    tags: categories.map((category) => category.name),
    updatedAt: updatedAt(doc),
    // ...status, body and seo unchanged
```

Keep the rest of the returned object exactly as it is.

- [ ] **Step 5: Pass it through the CMS source**

In `src/content/cms-source.ts` `getArticles`, destructure and parse `categories` too:

```ts
      const { slug, title, summary, publishedAt, readingMinutes, categories, tags } = mapArticle(
        doc,
        draft,
      );
      return articleSummarySchema.parse({
        slug,
        title,
        summary,
        publishedAt,
        readingMinutes,
        categories,
        tags,
      });
```

- [ ] **Step 6: Run the tests and the typechecker**

Run: `npx tsx --test tests/cms/unit/article-categories.test.ts && npx tsc --noEmit`
Expected: 3 passed; no type errors. Fix every other place `ArticleSummary` is constructed (`static-source.ts` returns `[]`, so none expected).

- [ ] **Step 7: Parity check and commit**

Run: `npx pnpm cms:parity`
Expected: 0 differences (Insights is off in both sources).

```bash
git add src/content tests/cms/unit/article-categories.test.ts
git commit -m "feat(content): articles carry published categories as slug and name"
```

---

### Task 3: Reserve the `category` slug

`/insights/category/[slug]` is a static segment and wins over `/insights/[slug]`, so an article called `category` could never be opened.

**Files:**
- Create: `src/lib/insights.ts`
- Modify: `src/cms/hooks/validators.ts` (`validateArticle`, line 129)
- Test: `tests/cms/unit/article-categories.test.ts` (append)

**Interfaces:**
- Produces: `RESERVED_ARTICLE_SLUGS: readonly string[]` from `@/lib/insights`.

- [ ] **Step 1: Write the failing test** (append to the test file from Task 2)

```ts
import { validateArticle } from "../../../src/cms/hooks/validators";

test("validateArticle refuses the reserved slug 'category'", () => {
  const issues = validateArticle({
    ...base,
    slug: "category",
    body: { root: { children: [{ type: "paragraph" }] } },
  });
  assert.ok(
    issues.some((issue) => issue.path === "slug" && /reserved/i.test(issue.message)),
    JSON.stringify(issues),
  );
});

test("validateArticle accepts an ordinary slug", () => {
  const issues = validateArticle({
    ...base,
    body: { root: { children: [{ type: "paragraph" }] } },
  });
  assert.ok(!issues.some((issue) => issue.path === "slug"), JSON.stringify(issues));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test tests/cms/unit/article-categories.test.ts`
Expected: FAIL on the first new test (no reserved-slug issue).

- [ ] **Step 3: Create the constant**

`src/lib/insights.ts`:

```ts
/** Addresses under /insights that are routes, not articles. */
export const RESERVED_ARTICLE_SLUGS: readonly string[] = ["category"];
```

- [ ] **Step 4: Use it in the validator**

In `src/cms/hooks/validators.ts`, import `RESERVED_ARTICLE_SLUGS` from `../../lib/insights` and in `validateArticle`, before the body check:

```ts
  const slug = typeof doc["slug"] === "string" ? doc["slug"] : "";
  if (RESERVED_ARTICLE_SLUGS.includes(slug))
    issues.push({
      path: "slug",
      message: `"${slug}" is reserved for the site. Choose a different web address.`,
    });
```

- [ ] **Step 5: Run the tests, then commit**

Run: `npx tsx --test tests/cms/unit/article-categories.test.ts`
Expected: 5 passed.

```bash
git add src/lib/insights.ts src/cms/hooks/validators.ts tests/cms/unit/article-categories.test.ts
git commit -m "feat(cms): refuse the reserved article slug 'category'"
```

---

### Task 4: Category filter and category pages

**Files:**
- Modify: `src/lib/insights.ts`
- Create: `src/components/content/article-list.tsx`, `src/components/content/category-filter.tsx`
- Create: `src/app/(public)/(site)/insights/category/[slug]/page.tsx`
- Modify: `src/app/(public)/(site)/insights/page.tsx`
- Test: `tests/cms/unit/article-categories.test.ts` (append)

**Interfaces:**
- Produces in `@/lib/insights`:
  - `type CategoryLink = { slug: string; name: string; count: number }`
  - `usedCategories(articles: ArticleSummary[]): CategoryLink[]` — categories on at least one article, sorted by name.
  - `articlesInCategory(articles: ArticleSummary[], slug: string): ArticleSummary[]`
- Produces components: `ArticleList({ articles })`, `CategoryFilter({ categories, current? })` (`current` is a category slug; omitted means "All").

- [ ] **Step 1: Write the failing helper tests** (append)

```ts
import { articlesInCategory, usedCategories } from "../../../src/lib/insights";

const summary = (slug: string, categories: { slug: string; name: string }[]) => ({
  slug,
  title: `Test ${slug}`,
  summary: "Test summary",
  publishedAt: "2026-10-01T00:00:00.000Z",
  readingMinutes: 1,
  categories,
  tags: categories.map((category) => category.name),
});

const articles = [
  summary("a", [{ slug: "b-cat", name: "Test B" }]),
  summary("b", [
    { slug: "b-cat", name: "Test B" },
    { slug: "a-cat", name: "Test A" },
  ]),
  summary("c", []),
];

test("usedCategories counts articles per category and sorts by name", () => {
  assert.deepEqual(usedCategories(articles), [
    { slug: "a-cat", name: "Test A", count: 1 },
    { slug: "b-cat", name: "Test B", count: 2 },
  ]);
});

test("usedCategories is empty when no article has a category", () => {
  assert.deepEqual(usedCategories([summary("c", [])]), []);
});

test("articlesInCategory keeps order and returns nothing for an unknown slug", () => {
  assert.deepEqual(
    articlesInCategory(articles, "b-cat").map((article) => article.slug),
    ["a", "b"],
  );
  assert.deepEqual(articlesInCategory(articles, "nope"), []);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx tsx --test tests/cms/unit/article-categories.test.ts`
Expected: FAIL (`usedCategories` is not exported).

- [ ] **Step 3: Implement the helpers** (append to `src/lib/insights.ts`)

```ts
import type { ArticleSummary } from "@/content/types";

export type CategoryLink = { slug: string; name: string; count: number };

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
  return articles.filter((article) => article.categories.some((category) => category.slug === slug));
}
```

Move the `import type` line to the top of the file.

- [ ] **Step 4: Run to verify the helpers pass**

Run: `npx tsx --test tests/cms/unit/article-categories.test.ts`
Expected: 8 passed.

- [ ] **Step 5: Extract the shared list**

Create `src/components/content/article-list.tsx` containing the `<ol>` currently inline in `insights/page.tsx`, unchanged in markup and classes:

```tsx
import NextLink from "next/link";
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
            {article.tags.length > 0 && (
              <p className="text-steel-600 text-small mt-3">{article.tags.join(", ")}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
```

(Task 5 refines the markup after the design review; this step is a pure extraction.)

- [ ] **Step 6: Create the filter**

`src/components/content/category-filter.tsx`:

```tsx
import NextLink from "next/link";
import type { CategoryLink } from "@/lib/insights";
import { cn } from "@/lib/utils";

/** Filter by category: plain links, so it works without JavaScript and every state has its own address. */
export function CategoryFilter({
  categories,
  current,
}: {
  categories: CategoryLink[];
  current?: string;
}) {
  if (categories.length === 0) return null;
  const items = [
    { href: "/insights", label: "All", active: current === undefined },
    ...categories.map((category) => ({
      href: `/insights/category/${category.slug}`,
      label: category.name,
      active: current === category.slug,
    })),
  ];
  return (
    <nav aria-label="Filter articles by category" className="mb-10">
      <ul className="flex flex-wrap gap-x-6 gap-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <NextLink
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "link-rule min-h-target inline-flex items-center",
                item.active ? "text-ink-900 font-medium" : "text-steel-600 hover:text-ink-900",
              )}
            >
              {item.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 7: Use both on the index page**

In `insights/page.tsx` replace the inline `<ol>` with:

```tsx
<Container className="section-b">
  <CategoryFilter categories={usedCategories(articles)} />
  <ArticleList articles={articles} />
</Container>
```

and import `ArticleList`, `CategoryFilter` and `usedCategories`.

- [ ] **Step 8: Create the category page**

`src/app/(public)/(site)/insights/category/[slug]/page.tsx`:

```tsx
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
```

- [ ] **Step 9: Verify and commit**

Run: `npx tsc --noEmit && npx eslint src tests && npx pnpm build`
Expected: clean. With Insights off, the build lists no category pages and `/insights/category/x` answers 404 (checked in Task 7).

```bash
git add src tests
git commit -m "feat(insights): category filter and statically generated category pages"
```

---

### Task 5: Design pass on the index and article pages

This task is a critique-then-fix loop, not a code recipe, because "does it look designed" cannot be written as a test. The deliverable is a short written critique and the resulting edits.

**Files:**
- Modify: `src/components/content/article-list.tsx`, `src/components/content/category-filter.tsx`, `src/app/(public)/(site)/insights/[slug]/page.tsx`
- Read first: `DESIGN.md` §0 to §6, `PRODUCT.md`, `src/components/primitives/prose.tsx`, `src/components/content/index-list.tsx`

**Interfaces:**
- Consumes: `Article.categories` (Task 2), `usedCategories` (Task 4).
- Produces: no new exports.

- [ ] **Step 1: Build realistic fixtures and look at the pages**

Start a CMS-source build with the test database, create (via the admin or the API as in `tests/cms/insights.spec.ts`) three "Test" articles of different lengths (one with H2, H3, list, quotation and a link; one with a long title; one with no category) and two categories. Turn Insights on **in the test database only**. Capture screenshots at 360, 768, 1280 and 1920px of `/insights`, a category page and each article.

- [ ] **Step 2: Run the design critique**

Invoke `impeccable` (critique mode) and `design-taste-frontend` on those screenshots and the three files, and re-read `DESIGN.md` §0.2. Write the findings as a list in the PR description. Judge specifically: does the index read like the credentials register (ruled, hairline) rather than a blog template? Is the date in mono acceptable (data) and the title the strongest element? Is there a single clear primary action per page?

- [ ] **Step 3: Apply the fixes the critique supports**

Concrete changes this plan commits to regardless of critique outcome (all using existing tokens and primitives):

1. In the article page's `SpecBlock`, add an "Updated" row only when the dates differ, and link each category:

```tsx
const publishedOn = formatDate(article.publishedAt);
const showUpdated =
  article.updatedAt !== undefined && formatDate(article.updatedAt) !== publishedOn;
// ...inside items:
...(showUpdated && article.updatedAt
  ? [
      {
        label: "Updated",
        value: <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>,
        mono: true,
      },
    ]
  : []),
...(article.categories.length > 0
  ? [
      {
        label: "Categories",
        value: (
          <ul>
            {article.categories.map((category) => (
              <li key={category.slug}>
                <NextLink href={`/insights/category/${category.slug}`} className="link-rule">
                  {category.name}
                </NextLink>
              </li>
            ))}
          </ul>
        ),
      },
    ]
  : []),
```

2. After `<RichText>`, an end-of-article row with no new client copy (labels come from the site content):

```tsx
<div className="border-rule mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
  <Link href="/insights" variant="default">
    All {site.navLabels.insights.toLowerCase()}
  </Link>
  <Link href="/contact" variant="buttonPrimary">
    {site.ctaLabels.primary}
  </Link>
</div>
```

(`Link` is `@/components/primitives/link`; verify the variant names against that file before use.)

3. In `ArticleList`, replace the plain `tags.join(", ")` line with the category names only if the critique finds it reads as a tag cloud; otherwise leave it.

- [ ] **Step 4: Gate review**

Dispatch the `UI Finish-Gate Reviewer` agent with the screenshots and `DESIGN.md` §0.2. Fix everything it rejects. Run `deslop` over any visible copy added.

- [ ] **Step 5: Verify and commit**

Run: `npx tsc --noEmit && npx eslint src && npx pnpm build`
Expected: clean (the lint rules reject raw hex and arbitrary values).

```bash
git add src
git commit -m "feat(insights): design pass, updated date, category links, end-of-article actions"
```

---

### Task 6: Complete the Article JSON-LD

`articleLd` currently has publisher and dates but no `author` and no `mainEntityOfPage`. Authorship must come from the About content, and never from a placeholder.

**Files:**
- Modify: `src/lib/jsonld.ts` (`articleLd`, line 116)
- Modify: `src/app/(public)/(site)/insights/[slug]/page.tsx` (call site)
- Test: `tests/cms/unit/article-jsonld.test.ts` (create)

**Interfaces:**
- Produces: `articleLd(article: Article, site: Site, about?: AboutContent)`. `author` is present only when `about` is given and `about.founder.name` is not a placeholder.
- Consumes: `getAboutContent()` from `@/content`.

- [ ] **Step 1: Write the failing test**

```ts
/**
 * Article JSON-LD: author comes from the founder record, never from a placeholder.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { articleLd } from "../../../src/lib/jsonld";
import { getAboutContent, getSite } from "../../../src/content/index";
import type { Article } from "../../../src/content/types";

const article: Article = {
  slug: "test-note",
  title: "Test note",
  summary: "Test summary",
  publishedAt: "2026-10-01T00:00:00.000Z",
  readingMinutes: 1,
  categories: [],
  tags: [],
  status: "published",
  body: { root: { children: [] } },
};

test("articleLd adds the founder as author and the page as main entity", async () => {
  const [site, about] = await Promise.all([getSite(), getAboutContent()]);
  const ld = articleLd(article, site, {
    ...about,
    founder: { ...about.founder, name: "Test Author", jobTitle: "Test Title" },
  });
  assert.equal(ld?.author?.["@type"], "Person");
  assert.equal(ld?.author?.name, "Test Author");
  assert.ok(String(ld?.mainEntityOfPage?.["@id"]).endsWith("/insights/test-note"));
});

test("articleLd omits author when the founder name is a placeholder", async () => {
  const [site, about] = await Promise.all([getSite(), getAboutContent()]);
  const ld = articleLd(article, site, {
    ...about,
    founder: { ...about.founder, name: "[PLACEHOLDER] Name" },
  });
  assert.ok(ld);
  assert.equal("author" in ld, false);
});

test("articleLd still works without the About content", async () => {
  const site = await getSite();
  const ld = articleLd(article, site);
  assert.ok(ld);
  assert.equal("author" in ld, false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx tsx --test tests/cms/unit/article-jsonld.test.ts`
Expected: FAIL (`author` undefined).

- [ ] **Step 3: Implement**

In `articleLd` add the third parameter and spread:

```ts
export function articleLd(article: Article, site: Site, about?: AboutContent) {
  if (hasPlaceholder(article.title) || hasPlaceholder(article.summary)) {
    return null;
  }
  const url = absoluteUrl(`/insights/${article.slug}`);
  const founder = about?.founder;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    ...(founder && !hasPlaceholder(founder.name)
      ? { author: { "@type": "Person" as const, name: founder.name } }
      : {}),
    publisher: { "@type": "Organization", name: site.displayName, url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}
```

TypeScript: the optional `author` is read in the test with optional chaining on a union; if the compiler complains, give `articleLd` an explicit return type with `author?: { "@type": "Person"; name: string }`.

- [ ] **Step 4: Update the call site**

In `insights/[slug]/page.tsx` fetch `getAboutContent()` in the existing `Promise.all` and call `articleLd(article, site, about)`.

- [ ] **Step 5: Verify, validate with the SEO skill, commit**

Run: `npx tsx --test tests/cms/unit/article-jsonld.test.ts && npx tsc --noEmit`
Expected: 3 passed. Then run `claude-seo:seo-schema` against the JSON-LD from a fixture article and fix anything it flags.

```bash
git add src tests
git commit -m "feat(seo): Article JSON-LD gains author and main entity"
```

---

### Task 7: Accessibility, navigation and responsive proof with fixtures

**Files:**
- Modify: `tests/cms/insights.spec.ts`
- Read: `tests/cms/helpers.ts`, `tests/cms/global-setup.ts`

**Interfaces:**
- Consumes: the helpers already used in that file (`fullLogin`, `readAccount`, `setInsights`, `body`, `INSIGHTS_FILE`).

- [ ] **Step 1: Extend the existing test with category, nav, axe and overflow checks**

After the published article is created (and before `setInsights(request, true)`), create a category and attach it:

```ts
const category = await request.post("/api/article-categories", {
  data: { name: "Test category", slug: "test-category", _status: "published" },
});
expect(category.status()).toBe(201);
const categoryId = ((await category.json()) as { doc: { id: number } }).doc.id;
// ...and in the published article's data: categories: [categoryId]
```

Delete the category in `finally` after the articles. After the existing assertions add:

```ts
// Navigation shows Insights only while it is on.
await page.goto("/");
await expect(page.locator('header a[href="/insights"]')).toHaveCount(1);

// Category page lists the article; an unknown category and an empty one answer 404.
await page.goto("/insights/category/test-category");
await expect(page.getByRole("link", { name: "Test published note" })).toBeVisible();
expect((await page.request.get("/insights/category/no-such-category")).status()).toBe(404);

// Axe on the index and the category page, and no sideways scroll at the four review widths.
for (const path of ["/insights", "/insights/category/test-category", `/insights/${PUBLISHED}`]) {
  for (const width of [360, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `${path} at ${width}px`).toBe(false);
  }
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, path).toEqual([]);
}
```

- [ ] **Step 2: Run**

Run: `npx pnpm cms:test`
Expected: pass. If axe or the overflow check fails, fix the page (Task 4 or 5 files), not the test.

- [ ] **Step 3: Static-build off-state checks**

Add to `tests/e2e/insights-off.spec.ts` the category route to the 404 list: `"/insights/category/any-category"`.

Run: `npx pnpm test:e2e -- tests/e2e/insights-off.spec.ts`
Expected: pass.

- [ ] **Step 4: Manual checks (cannot be automated)**

With the fixtures live: tab through `/insights`, a category page and an article; focus must be visible on every link and the order logical. Check 200% browser zoom at 1280px. Run `web-design-guidelines` over the changed files. Record the result in the PR description.

- [ ] **Step 5: Commit**

```bash
git add tests
git commit -m "test(insights): category, navigation, axe and overflow checks with fixtures"
```

---

### Task 8: Owner launch runbook and tracking

No agent action here turns Insights on. This task writes down what the owner must do and ticks what is finished.

**Files:**
- Modify: `docs/CONTENT_EDITING_GUIDE.md`, `TASKS.md`, `pending_work.md`

- [ ] **Step 1: Add an "Insights" section to the editing guide**

Cover, in plain English: create categories first (they must be published to show); write an article (headings H2/H3, bold, italic, links, lists, quotations only; no client, site, plant or network names); Save draft, Preview, Publish; reading time and published date are automatic; the slug cannot be `category` and locks after first publish; articles appear only while "Insights" is on in Site settings; where the category filter appears.

- [ ] **Step 2: Write the owner's launch checklist** (same file, so it travels with the guide)

1. The founder writes at least one article and the owner approves it (client content; no agent writes it).
2. `CONTENT_SOURCE=cms` is set in the production environment.
3. `CMS_ADMIN_ENABLED=true` is set by the owner after `pnpm cms:test` passes.
4. An approver publishes the article(s), then sets **Insights** to on in Site settings (approver-only flag).
5. Check `/insights`, one article, a category page, `/insights/rss.xml` and `/sitemap.xml`; confirm the Insights link appears in the header and footer.
6. Submit the sitemap if search tooling is used.

- [ ] **Step 3: Tick and log**

In `TASKS.md`: tick "Insights: add MDX articles ..." only when the owner's checklist is complete (leave it open until then and rewrite its text to "Insights: publish real articles in the CMS, then switch Insights on in Site settings"). Resolve Q-01 with "Launch with articles (owner, 2026-10-02)". Add decisions-log lines for: category pages are `noindex, follow` and excluded from the sitemap; `category` is a reserved slug; FR-26 MDX superseded. Tick the matching line in `pending_work.md` only when launched.

- [ ] **Step 4: Final verification**

Run: `npx pnpm typecheck && npx pnpm lint && npx pnpm build && npx pnpm test:cms-unit && npx pnpm test:a11y && npx pnpm cms:test`
Expected: all green. Use `superpowers:verification-before-completion` before stating this.

- [ ] **Step 5: Review and commit**

Run `superpowers:requesting-code-review` on the branch, fix findings, then:

```bash
git add docs TASKS.md pending_work.md
git commit -m "docs(insights): editing guide, owner launch checklist, tracking"
```

Then `superpowers:finishing-a-development-branch`.

---

## Self-review (done at writing time)

- **Coverage:** FR-25 (list; Tasks 4, 5), FR-26 (CMS authoring; Task 1 decision, Task 8), FR-27 (off state; Tasks 1, 7), FR-28 (Tasks 2 to 4), FR-29 (feed already built; verified in Tasks 1, 7), SEO-04 Article (Task 6), FR-07 breadcrumbs (Task 4 category page; article page already has them). Owner's three extras map to Tasks 4, 5, 7.
- **Open points to confirm before executing:** the `Link` variant names in Task 5 Step 3 (`default`, `buttonPrimary`) were read from `link.tsx` but the second snippet should be compiled before committing; `scripts/cms/check-db.ts` is referenced from the `cms:check-db` script entry and its name should be confirmed with `pnpm cms:check-db`.
- **Not in scope on purpose:** cover images (the rich text forbids images and no approved imagery exists), previous/next links, search, comments, share buttons, a content calendar, writing any article.
