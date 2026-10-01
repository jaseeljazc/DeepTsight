# ARCHITECTURE.md

How the codebase is organised and why. Updated 1 October 2026 to describe the code as built; planned
parts that do not exist yet are marked **(planned)**. The central idea: **the site is a statically rendered document
with one dynamic action (the enquiry form), and all content passes through a single adapter module so
that adding a CMS later changes one file.**

---

## 1. Principles

1. **Static by default.** Every route is prerendered at build time. No runtime data fetching, no ISR
   in Phase 1. A consulting site with a dozen pages should be a set of HTML files on a CDN.
2. **One content seam.** Components import from `@/content` and nothing else. They never read a data
   file, never know whether content came from TypeScript, MDX or a CMS.
3. **Server Components by default.** `"use client"` appears in a handful of leaf components and nowhere
   else. Target: under 100 kB of JS per route.
4. **Schema first.** The content model is defined in Zod now. The Phase 2 CMS is configured to match the
   schema, not the other way round.
5. **Primitives are hand-written.** The design system's constraints (2px radius, no shadows, specific
   border contrast) are easier to guarantee in our own components than to override in someone else's.

---

## 2. Folder structure

```
claude-designed/
├── AGENTS.md  CLAUDE.md  AGENT_ROLES.md  PROJECT.md  PRODUCT.md  REQUIREMENTS.md
├── DESIGN.md  ARCHITECTURE.md  TECH_STACK.md  TASKS.md  pending_work.md
├── .env.example                    every variable, with what is required in production
├── next.config.ts                  security headers and CSP
├── eslint.config.mjs               design-system and content-seam rules (§7)
├── playwright.config.ts
├── public/
│   ├── images/                     photographs (+ illu/)
│   ├── badges/                     issuer badge artwork for credentials
│   ├── dither/                     globe-perth.svg
│   └── fonts/                      self-hosted WOFF2 subsets
├── scripts/                        run before every build by `check:content`
│   ├── check-env.ts                fails a production build on missing or test env vars
│   ├── generate-tokens.ts          globals.css → src/styles/tokens.generated.ts
│   ├── check-placeholders.ts       fails a production build on unapproved content
│   ├── check-contrast.ts           recomputes DESIGN.md §3.5 from tokens
│   ├── verify-content.ts           calls the adapter so Zod parses every source file
│   └── generate-dither.ts  generate-globe-data.ts  download-fonts.mjs  lib/
├── src/
│   ├── app/
│   │   ├── layout.tsx              html lang="en-AU", fonts, skip link, metadata base, noindex outside production
│   │   ├── global-error.tsx  not-found.tsx
│   │   ├── sitemap.ts  robots.ts  opengraph-image.tsx  twitter-image.tsx
│   │   ├── .well-known/security.txt/route.ts
│   │   ├── actions/enquiry.ts      the only Server Action
│   │   ├── design-system/page.tsx  internal specimen; 404 in production
│   │   └── (site)/
│   │       ├── layout.tsx          Header + main + Footer
│   │       ├── error.tsx
│   │       ├── page.tsx                            /
│   │       ├── about/page.tsx                      /about
│   │       ├── services/page.tsx                   /services
│   │       ├── services/[slug]/page.tsx            /services/:slug
│   │       ├── credentials/page.tsx                /credentials
│   │       ├── insights/page.tsx                   /insights (404 until articles exist)
│   │       ├── contact/page.tsx  contact/thank-you/page.tsx
│   │       └── legal/{privacy,terms,accessibility}/page.tsx
│   ├── components/
│   │   ├── primitives/             hand-written, design-system-locked: button, link, field, input,
│   │   │                           textarea, select, checkbox, radio, badge, alert, table, figure,
│   │   │                           spec-block, section-header, drawing-rule, rail-tag, prose,
│   │   │                           placeholder (Placeholder, MarkedText)
│   │   ├── layout/                 header, mobile-nav, footer, breadcrumbs, page-header,
│   │   │                           anchor-nav, container, section, grid, wordmark
│   │   ├── sections/               the nine Home sections, one file each
│   │   ├── content/                templates and composed parts: service-template, service-body,
│   │   │                           service-icon, credential-group, legal-document, part, index-list,
│   │   │                           process-sequence, project-note, rail-wiring, dot-*, ascii-hero-power-plant
│   │   ├── forms/                  enquiry-form (client), error-summary
│   │   └── seo/                    json-ld, track-event-on-mount
│   ├── content/
│   │   ├── index.ts                ★ THE ADAPTER — the only public surface
│   │   ├── schema.ts               Zod schemas = the content model
│   │   ├── types.ts                inferred types, exported for components
│   │   ├── enquiry-schema.ts       enquiry form schema and enquiry types
│   │   └── source/                 Phase 1 storage. Deleted or migrated in Phase 2.
│   │       ├── site.ts  home.ts  about.ts  services.ts  credentials.ts
│   │       ├── pages.ts            copy that belongs to one page or template
│   │       ├── media.ts            image rights register and reserved image slots
│   │       ├── seo.ts              per-route titles and descriptions (canonicals are paths)
│   │       └── legal/{privacy,terms,accessibility}.ts
│   ├── lib/
│   │   ├── env.ts                  server environment (server code only)
│   │   ├── env-rules.ts            what production requires; shared with scripts/check-env.ts
│   │   ├── public-env.ts           NEXT_PUBLIC_* values; safe in client components
│   │   ├── site-url.ts             the one origin; absoluteUrl() for every absolute URL
│   │   ├── placeholder.ts          the unverified-content marker strings
│   │   ├── jsonld.ts               structured data builders
│   │   ├── rate-limit.ts  turnstile.ts  analytics.ts  utils.ts
│   └── styles/
│       ├── globals.css             @theme tokens, base layer, component classes — single source of truth
│       ├── fonts.ts                next/font/local
│       └── tokens.generated.ts     generated; never edit
└── tests/
    ├── a11y/routes.spec.ts         axe-core across every route
    ├── e2e/enquiry-form.spec.ts    happy path, validation, blur focus, no-JS, rate limit
    └── e2e/qa-suite.spec.ts        skip link, 320px reflow, external links, mobile menu, keyboard, 404
```

Not built yet: `ui/` (Radix-backed widgets, §5.1), MDX legal and article pipeline, `/insights/[slug]`,
`/insights/rss.xml`, `lib/seo.ts` metadata builder, favicon (waits for the logo), `proxy.ts`.

## 3. Routes and rendering

| Route                         | Rendering                      | Generated from                                         |
| ----------------------------- | ------------------------------ | ------------------------------------------------------ |
| `/`                           | Static                         | `getHomeContent()`, `getServices()`, `getFigures()`    |
| `/about`                      | Static                         | `getAboutContent()`, `getPageContent()`                |
| `/services`                   | Static                         | `getServices()`, `getPageContent()`                    |
| `/services/[slug]`            | Static, `generateStaticParams` | `getServices()` → `getService(slug)`                   |
| `/credentials`                | Static                         | `getCredentials()`, `getPageContent()`                 |
| `/insights`                   | Static (404 for now)           | `getArticles()` — returns nothing yet                  |
| `/insights/[slug]`            | **(planned)**                  | `getArticle(slug)`                                     |
| `/contact`                    | Static shell + Server Action   | `getSite()`, `getPageContent()`, `getEnquiryOptions()` |
| `/contact/thank-you`          | Static                         | `getPageContent()`                                     |
| `/legal/*`                    | Static                         | `getLegalPage(slug)` (TypeScript objects, not MDX)     |
| `/sitemap.xml`, `/robots.txt` | Build-time                     | content and `NEXT_PUBLIC_SITE_URL`                     |
| `/insights/rss.xml`           | **(planned)**                  | articles                                               |

`dynamic = "force-static"` is asserted on every page so an accidental dynamic API call fails the build
rather than silently switching a route to SSR. No route group has a `loading.tsx`: a loading boundary
would hide prerendered content until JavaScript runs (removed 1 October 2026).

## 4. The content layer — the most important part of this document

### 4.1 Why

Phase 1 ships without a CMS. Phase 2 adds one. If components read data files directly, Phase 2 becomes
a rewrite of every page. With an adapter, Phase 2 is a rewrite of `src/content/index.ts` and nothing else.

### 4.2 The contract

`src/content/index.ts` exports only functions, never data objects:

```ts
export async function getSite(): Promise<Site>;
export async function getHomeContent(): Promise<HomeContent>;
export async function getAboutContent(): Promise<AboutContent>;
export async function getPageContent(): Promise<PagesContent>;
export async function getFigures(): Promise<Record<string, FigureData>>;
export async function getEnquiryOptions(): Promise<EnquiryOptions>;
export async function getServices(): Promise<Service[]>;
export async function getService(slug: string): Promise<Service | null>;
export async function getCredentials(): Promise<CredentialGroup[]>;
export async function getArticles(): Promise<ArticleSummary[]>; // returns [] until Insights is built
export async function getArticle(slug: string): Promise<Article | null>; // returns null until then
export async function getLegalPage(slug: LegalSlug): Promise<LegalPage | null>;
export async function getSeo(route: string): Promise<SeoEntry>;
```

It also re-exports `enquirySchema` and `EnquiryData` for the form and the Server Action.

Rules:

- Every function is `async` even though Phase 1 is synchronous, so Phase 2 needs no call-site changes.
- Every return value is parsed through its Zod schema before being returned. Invalid content throws at
  build time (CR-01).
- Nothing outside `src/content/` imports from `src/content/source/`. Enforced by an ESLint
  `no-restricted-imports` rule.
- The adapter filters on approval flags when `NEXT_PUBLIC_ENV=production`: unverified credentials and
  unapproved proof entries never reach a component there. Outside production they are passed through so the
  design shows them as marked placeholders.
- The adapter resolves and checks references it owns: the Home trust strip is stored as credential ids and
  resolved against the register; Home capability summaries must name an existing service. An unknown id fails
  the build. (Media ids and `relatedSlugs` are not yet checked.)
- Content stores site paths, never absolute URLs. Absolute URLs come from `src/lib/site-url.ts`.

### 4.3 Content model (Zod, `schema.ts`)

`src/content/schema.ts` is the authority; this is a summary.

```ts
Site            { legalName, displayName, tagline, abn?, address?, phone, email, linkedIn?,
                  responseTime, serviceArea, nav[], ctaLabels, insightsEnabled: boolean }
Service         { slug, title, shortTitle, summary, outcome, icon (fixed set),
                  challenge, whyItMatters, capability, scopeAndOutputs[],
                  deliveryApproach[], standards[], evidence?, relatedSlugs[],
                  media: { hero, detail }, seo: SeoEntry }
Credential      { id, category, title, issuer, identifier?, year?, expiry?, url?,
                  badge?, verified: boolean }
CredentialGroup { category, title, items: Credential[] }
ProofItem       { id, sector, challenge, outcome, metric?, disclosureApproved: boolean }
Article         { slug, title, summary, publishedAt, updatedAt?, readingMinutes,
                  tags[], status: "draft" | "published", body }
MediaAsset      { id, src, alt, caption, width, height, source, licence,
                  usageRights, attribution?, approvedForPublic: boolean }
ImageSlot       { id, subject, caption, promptRef }       // a reserved image position
HomeSource      what home.ts stores: Home copy + trustStripIds[] (resolved to Credential[])
AboutContent    { founder: { name, jobTitle }, narrative, principles[], media, timeline[] }
PagesContent    page intros and closing copy for about, services, service template,
                credentials, contact, thank-you
LegalPage       { slug, title, lastUpdated, sections: { title, content }[] }
SeoEntry        { title, description, canonical (a site path), ogImage? }
```

Every user-facing string field also accepts the `[PLACEHOLDER] ` prefix, which the
`check-placeholders` script rejects in production builds. Call-to-action button labels live only in
`Site.ctaLabels`.

### 4.4 Data flow

```
build time
  content/source/*.ts|mdx
        │  parsed + validated (Zod)
        ▼
  content/index.ts  ← the seam
        │  typed, approval-filtered
        ▼
  Server Components (app/**/page.tsx)
        │  props
        ▼
  section + primitive components
        │
        ▼
  static HTML + minimal JS to the CDN
```

```
runtime (the only dynamic path)
  EnquiryForm (client)
        │  FormData via Server Action
        ▼
  app/actions/enquiry.ts
        ├─ honeypot
        ├─ Zod parse (same schema as the client)
        ├─ rate limit by IP and globally (valid submissions only)
        ├─ Turnstile verification (a missing token fails in production)
        ├─ elapsed-time check against Cloudflare's challenge time (3 s)
        ├─ send transactional email (an error, never a silent success, if delivery is not configured)
        └─ redirect → /contact/thank-you
```

No database in Phase 1. No enquiry persistence; email is the system of record. From Phase 2 enquiries
are also saved to the CMS and shown in an admin inbox (FR-38 changed, FR-44).

### 4.5 Phase 2 migration path

1. Install the CMS into the same Next.js app (`TECH_STACK.md` §4).
2. Generate collections from the existing Zod schemas — the model already exists.
3. Run a one-off import script: `content/source/*` → CMS collections.
4. Rewrite the bodies of the functions in `content/index.ts` to query the CMS. Signatures unchanged.
5. Switch the affected routes from fully static to on-demand revalidation triggered by a publish webhook.
6. Delete `content/source/`.

No page component, section component or primitive is touched in steps 1–6. That is the whole point.

Known exceptions, to plan for (`docs/PROJECT_CONTEXT_FOR_CMS.md` §18.3): copy still hardcoded in components,
the source-scanning placeholder gate, build-time dates (credential expiry, sitemap), the Insights renderer,
and the enquiry inbox, which changes the Server Action as well as the adapter.

---

## 5. Component layers

| Layer             | Responsibility                                                        | May import                   |
| ----------------- | --------------------------------------------------------------------- | ---------------------------- |
| `primitives/`     | Design-system atoms. No content knowledge, no data.                   | tokens, `utils`              |
| `ui/`             | Radix-backed interactive widgets with tokens overridden.              | primitives                   |
| `layout/`         | Page chrome: header, footer, containers, grid, breadcrumbs.           | primitives, `@/content`      |
| `sections/`       | One homepage section each. Presentational; receives data as props.    | primitives, layout           |
| `content/`        | Templates that render a content type (service, article, credentials). | primitives, layout, sections |
| `forms/`          | The enquiry form. The only place with meaningful client state.        | primitives, actions          |
| `app/**/page.tsx` | Fetch from `@/content`, compose, export metadata. Thin.               | everything                   |

Imports flow downward only. A primitive never imports a section. In the code as built, several sections also import
from `content/` (rail wiring, dot devices, process sequence, project note, service icon); either move those
into a shared layer or widen this table (audit M-07).

### 5.1 shadcn/ui policy

Take **only** the Radix-backed primitives where accessible behaviour is genuinely hard: `Dialog`,
`Accordion`, `Tabs`, and `Select` if a native `<select>` proves insufficient. Everything else —
Button, Card, Input, Badge, Table, Alert, Checkbox, Radio — is hand-written.

Reason: shadcn defaults are `rounded-md`, `shadow-sm`, soft `border-input` greys. Those are precisely
the three things `DESIGN.md` forbids, and every future `npx shadcn add` would reintroduce them. On
install, each component's classes are rewritten to project tokens in the same commit, and the diff is
reviewed against `DESIGN.md` §11.

---

## 6. Forms and the Server Action

`src/app/actions/enquiry.ts` is the only Server Action in the codebase.

- Shares `enquirySchema` with the client component; client validation is a convenience only.
- Returns `{ success, errors?, formError?, values? }` consumed by `useActionState`, so the form works before
  hydration. On success it redirects instead of returning.
- Order: honeypot, validation, rate limit, Turnstile, timing, email. Validation comes before the rate limit so
  correcting a mistake does not use up the allowance.
- Rate limiting: sliding window, 5/hour per IP and 30/hour global (FR-36). Upstash Redis is required in
  production; the in-memory limiter is for development and a logged fallback if Redis errors. The client IP
  comes from `x-forwarded-for`, which the host must overwrite (Vercel does).
- Spam: honeypot input hidden with CSS (`aria-hidden`, `tabindex="-1"`, off-screen), Turnstile (required on the
  live site, so the form needs JavaScript there; open question Q-11), and a 3-second minimum between
  Cloudflare's challenge time and submission.
- Email via Resend with a plain-text part. Recipient and sender from `ENQUIRY_TO_EMAIL` and
  `ENQUIRY_FROM_EMAIL`; no fallbacks in code.
- Never logs field contents (PRIV-08). Errors log an error name only.
- The error summary takes focus only after a failed submit; inline errors are linked by `aria-describedby`
  and are not live regions.

## 7. Styling architecture

- Tailwind v4, configured entirely in `src/styles/globals.css` with `@theme`. No `tailwind.config.js`.
- Default Tailwind colour palette, shadow scales, radii and container widths are cleared in the theme
  (`--color-*: initial` and so on), so `bg-slate-800` and `shadow-md` do not compile. This is the enforcement
  mechanism for `DESIGN.md`.
- ESLint `no-restricted-syntax` rules ban, in `className`, `cn()` and `cva()` string literals: raw hex colours,
  arbitrary values (`w-[12px]`), `rounded-sm` to `rounded-3xl`, and the `strokeWidth` prop on icons. Template
  literals are not checked, and there is no rule yet for `outline-none` without a focus replacement (audit L-05).
- Icon stroke width comes from `--icon-stroke` via the `.lucide` rule; `.icon-line` aligns an icon with the
  first line of a wrapping title.
- Component variants via `class-variance-authority`. No runtime CSS-in-JS.
- Places CSS cannot reach (the enquiry email, the share image) use `colorTokens` from
  `src/styles/tokens.generated.ts`, regenerated from `globals.css` before every build.

## 8. Metadata, SEO and structured data

- `generateMetadata` on each route pulls from `getSeo(route)` or the service's `seo` block. The root layout
  holds the title template and site-wide defaults.
- `metadataBase` comes from `NEXT_PUBLIC_SITE_URL`; content canonicals are paths resolved against it.
- `src/lib/site-url.ts` is the one origin: JSON-LD, sitemap, robots, the share image and security.txt all
  build absolute URLs with `absoluteUrl()`.
- `lib/jsonld.ts` exports `organizationLd`, `localBusinessLd`, `personLd`, `serviceLd`, `articleLd`,
  `breadcrumbLd`. A builder returns `null` if required approved data is missing; structured data is never
  populated with placeholder values. `JsonLd` serialises with `<`, `>` and `&` escaped, so content cannot
  break out of the script tag. (It has no CSP nonce: the CSP allows inline scripts, see `TECH_STACK.md` §1.)
- `sitemap.ts` enumerates static routes plus service routes. `lastModified` is still the build time
  (audit M-05; needs content `updatedAt`).
- `robots.ts` returns `Disallow: /`, and the root layout adds `noindex`, whenever
  `NEXT_PUBLIC_ENV !== "production"`.

## 9. Environment and configuration

`src/lib/env.ts` parses the server environment with Zod at module load; `src/lib/public-env.ts` reads the
`NEXT_PUBLIC_*` values (full dot-notation reads, so Next.js inlines them for the browser). Client code must only
import `public-env.ts`. With `NEXT_PUBLIC_ENV=production`, the variables marked required below must be set and
must not be Cloudflare test keys: `scripts/check-env.ts` fails the build, and `env.ts` throws at runtime. Rules
live in `src/lib/env-rules.ts`; messages name variables, never values.

| Variable                         | Scope  | Production      | Purpose                                    |
| -------------------------------- | ------ | --------------- | ------------------------------------------ |
| `NEXT_PUBLIC_ENV`                | client | `production`    | `development` \| `preview` \| `production` |
| `NEXT_PUBLIC_SITE_URL`           | client | required, https | canonical origin                           |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client | required        | CAPTCHA widget                             |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN`   | client | optional        | analytics host (tool not yet agreed)       |
| `TURNSTILE_SECRET_KEY`           | server | required        | CAPTCHA verification                       |
| `RESEND_API_KEY`                 | server | required        | email delivery                             |
| `ENQUIRY_TO_EMAIL`               | server | required        | recipient                                  |
| `ENQUIRY_FROM_EMAIL`             | server | required        | verified sender                            |
| `UPSTASH_REDIS_REST_URL`         | server | required        | rate limiting                              |
| `UPSTASH_REDIS_REST_TOKEN`       | server | required        | rate limiting                              |

Outside production, empty values fall back to Cloudflare's test keys, simulated email and the in-memory
rate limiter, so the site runs locally with no configuration.

## 10. Testing architecture

| Layer         | Tool                                       | Scope                                                                                                 |
| ------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Types         | `tsc --noEmit`                             | whole repo, strict                                                                                    |
| Lint          | ESLint + the design rules in §7            | whole repo                                                                                            |
| Environment   | `scripts/check-env.ts`                     | production builds only                                                                                |
| Content       | Zod at build + `scripts/verify-content.ts` | every content file                                                                                    |
| Placeholders  | `scripts/check-placeholders.ts`            | production builds only (scans `src/`; to be replaced by a content check for the CMS, audit H-02)      |
| Contrast      | `scripts/check-contrast.ts`                | every token pair, fails below its documented ratio                                                    |
| Accessibility | Playwright + `@axe-core/playwright`        | every route, desktop and mobile                                                                       |
| E2E           | Playwright                                 | enquiry happy path, validation, focus, no-JS submission, rate limit, mobile menu, keyboard order, 404 |
| Performance   | Lighthouse CI **(planned)**                | four representative pages against `REQUIREMENTS.md` §5 budgets; no config yet                         |

Run the Playwright suites against a production build: `pnpm build`, `next start -p 3002`, then
`PLAYWRIGHT_TEST_BASE_URL=http://localhost:3002 npx playwright test`. Without the variable, Playwright starts
`pnpm dev` on port 3001.

CI that runs all of the above on every pull request is **(planned)**: it waits for the hosting decision
(audit H-05). Until then, run the commands locally before every commit.

## 11. Deployment

- Git is the source of truth. `main` is protected; production deploys only from CI (SEC-18). **(planned:
  hosting and CI are not set up yet.)**
- Preview deployment per pull request, fully `noindex` and `Disallow: /` (SEO-07).
- Build is reproducible from a clean clone with only the documented environment variables.
- Rollback is a redeploy of the previous build; the procedure is tested once before launch (OPS-03).
