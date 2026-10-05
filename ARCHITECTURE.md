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

Updated 1 October 2026 for the Phase 2 CMS (branch `cms/phase-2`). Payload 3 runs inside this Next.js app.

```
claude-designed/
├── AGENTS.md  CLAUDE.md  AGENT_ROLES.md  PROJECT.md  PRODUCT.md  REQUIREMENTS.md
├── DESIGN.md  ARCHITECTURE.md  TECH_STACK.md  TASKS.md  pending_work.md
├── .env.example                    every variable, with what is required in production
├── next.config.ts                  public headers and CSP; separate admin/API policy; withPayload
├── eslint.config.mjs               design-system, content-seam and Payload-boundary rules (§7)
├── playwright.config.ts            public E2E and axe suites (tests/e2e, tests/a11y)
├── playwright.cms.config.ts        CMS suites (tests/cms) against the test database, port 3000
├── public/                         images/, badges/, dither/, fonts/ (static mode reads these)
├── scripts/                        build checks (`check:content`) and generators
│   ├── check-env.ts                production and CMS environment rules (names only)
│   ├── check-placeholders.ts       markers in code
│   ├── check-content-output.ts     markers in what the adapter returns (static or CMS)
│   ├── verify-content.ts           calls every getter so Zod parses all content
│   └── cms/                        CMS operations: migrate, reset-db (test/restore only), import,
│                                   create-admin, reset-admin-password, backup, restore, verify-backup,
│                                   purge-enquiries, smoke, parity-snapshot/compare, test-cms
├── src/
│   ├── payload.config.ts           Payload: Postgres (push off), collections, globals, no GraphQL,
│   │                               no telemetry, refusing email adapter, MFA screen
│   ├── proxy.ts                    production gate: /admin, /api, /preview answer 404 until
│   │                               CMS_ADMIN_ENABLED=true
│   ├── app/
│   │   ├── global-not-found.tsx    404 for unmatched URLs (two root layouts)
│   │   ├── global-error.tsx  sitemap.ts  robots.ts  opengraph-image.tsx  twitter-image.tsx
│   │   ├── .well-known/security.txt/route.ts
│   │   ├── actions/enquiry.ts      the only Server Action (saves to the inbox in CMS mode, then emails)
│   │   ├── preview/route.ts  preview/exit/route.ts    draft preview for MFA-verified admins
│   │   ├── (public)/               root layout of the public site (html, fonts, skip link)
│   │   │   ├── layout.tsx  not-found.tsx
│   │   │   ├── design-system/page.tsx              internal specimen; 404 in production
│   │   │   └── (site)/                             Header + main + Footer, every public page
│   │   │       ├── page.tsx  about/  services/  services/[slug]/  credentials/  contact/
│   │   │       ├── insights/page.tsx  insights/[slug]/page.tsx  insights/rss.xml/route.ts
│   │   │       └── legal/{privacy,terms,accessibility}/page.tsx
│   │   └── (payload)/              root layout of the CMS admin (Payload's own <html>)
│   │       ├── admin/[[...segments]]/  admin/importMap.js (generated)
│   │       └── api/[...slug]/route.ts  api/graphql/route.ts (always 404)
│   ├── cms/                        everything Payload-specific
│   │   ├── access/                 isAdmin (user + MFA cookie), approver-only fields
│   │   ├── collections/            services, proof-items, credentials, credential-groups, media,
│   │   │                           articles, article-categories, legal-pages, enquiry-types,
│   │   │                           enquiries, users, audit-log
│   │   ├── globals/                site-settings, home, about, pages, seo
│   │   ├── fields/  hooks/         shared field builders; publish guard, audit, revalidation
│   │   ├── mfa/                    TOTP (RFC 6238), AES-256-GCM, recovery codes, MFA cookie, endpoints
│   │   ├── media/                  upload sanitiser (decode, re-encode, strip metadata)
│   │   ├── views/                  MFA screen, inbox summary, QR code
│   │   ├── migrations/             one committed migration per schema change
│   │   └── payload-types.ts        generated
│   ├── components/                 primitives/, layout/, sections/, content/ (incl. rich-text),
│   │                               forms/, seo/ (unchanged layers, §5)
│   ├── content/                    ★ THE CONTENT SEAM
│   │   ├── index.ts                the adapter: dispatches on CONTENT_SOURCE
│   │   ├── static-source.ts        reads ./source (CONTENT_SOURCE=static, default)
│   │   ├── cms-source.ts           reads Payload's Local API (CONTENT_SOURCE=cms)
│   │   ├── rules.ts                filtering, ordering and integrity rules both sources apply
│   │   ├── mappers/                Payload documents → the Zod shapes
│   │   ├── enquiries.ts            saves enquiries (CMS mode only)
│   │   ├── schema.ts  types.ts  enquiry-schema.ts
│   │   └── source/                 static content, kept as the fallback (D-02)
│   ├── lib/                        env, env-rules, public-env, site-url, placeholder, jsonld,
│   │                               rate-limit, turnstile, analytics, dates, public-metadata, utils
│   └── styles/                     globals.css (single source of truth), fonts.ts, tokens.generated.ts
└── tests/
    ├── a11y/  e2e/                 public suites (run in both content modes)
    └── cms/                        admin security, preview, enquiry types, inbox, insights;
                                    unit/ (MFA, media, rich text, content rules; no database needed)
```

Not built: `ui/` (Radix-backed widgets, §5.1), `lib/seo.ts`, favicon (waits for the logo), a redirect
manager for changed slugs (slugs lock after the first publish instead, D-09).

## 3. Routes and rendering

| Route                                  | Rendering                                           | Content                                             |
| -------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `/`, `/about`, `/services`, `/contact` | Static; regenerated on demand by content tags (CMS) | adapter getters                                     |
| `/services/[slug]`                     | Static, `generateStaticParams` (enabled services)   | `getServices()` → `getService(slug)`                |
| `/credentials`                         | Static, also re-rendered daily (expiry)             | `getCredentials()`, `getPageContent()`              |
| `/insights`, `/insights/[slug]`        | Static; 404 while `insightsEnabled` is false        | `getArticles()`, `getArticle(slug)`                 |
| `/insights/rss.xml`                    | Static route handler; 404 while off                 | `getArticles()`                                     |
| `/contact/thank-you`, `/legal/*`       | Static                                              | `getPageContent()`, `getLegalPage(slug)`            |
| `/sitemap.xml`, `/robots.txt`          | Build time                                          | content, stored `updatedAt`, `NEXT_PUBLIC_SITE_URL` |
| `/admin/**`                            | Dynamic (Payload admin)                             | Payload; strict CSP, noindex, no-store              |
| `/api/**`                              | Dynamic (Payload REST)                              | access-controlled; GraphQL always 404               |
| `/preview`, `/preview/exit`            | Dynamic                                             | turns Next draft mode on (MFA admin) / off          |

Public pages assert `dynamic = "force-static"`. In CMS mode their reads are cached with content tags and
regenerated when a publish invalidates a tag (§4.4). In draft mode (preview) they render dynamically with
the latest drafts. No route group has a `loading.tsx`.

## 4. The content layer — the most important part of this document

### 4.1 Why

Components never know where content comes from. The adapter is the only public content API, so the CMS
was added by giving the adapter a second source, not by rewriting pages (§4.5 lists the exceptions).

### 4.2 The contract

`src/content/index.ts` exports only functions:

```ts
export async function getSite(): Promise<Site>;
export async function getHomeContent(): Promise<HomeContent>;
export async function getAboutContent(): Promise<AboutContent>;
export async function getPageContent(): Promise<PagesContent>;
export async function getFigures(): Promise<Record<string, FigureData>>;
export async function getEnquiryOptions(): Promise<EnquiryOptions>; // cached (pages)
export async function getEnquiryOptionsNow(): Promise<EnquiryOptions>; // uncached (Server Action)
export async function getServices(): Promise<Service[]>; // enabled only, in sortOrder
export async function getService(slug: string): Promise<Service | null>;
export async function getCredentials(): Promise<CredentialGroup[]>;
export async function getArticles(): Promise<ArticleSummary[]>;
export async function getArticle(slug: string): Promise<Article | null>;
export async function getLegalPage(slug: LegalSlug): Promise<LegalPage | null>;
export async function getSeo(route: string): Promise<SeoEntry>;
```

It re-exports `buildEnquirySchema`, `enquirySchema` and `EnquiryData`. Client components import the schema
from `@/content/enquiry-schema` directly, never the adapter (the adapter can load Payload).

Rules (`src/content/rules.ts` applies them to both sources):

- `CONTENT_SOURCE=static` (default) reads `./source`; `CONTENT_SOURCE=cms` reads Payload. The CMS source is
  imported only when selected, so static mode never starts Payload.
- Every return value is parsed with its Zod schema. In CMS mode the same schemas also run when an editor
  publishes (the publish guard), so invalid content is refused at save time, not at render time.
- Public reads see **published** documents only, even though the Local API bypasses access control.
- Approval flags filter only when `NEXT_PUBLIC_ENV=production` (unverified credentials, undisclosed project
  notes); outside production, and in draft mode, they render as marked placeholders.
- Disabled services disappear everywhere, including other services' related lists and the sitemap.
- References are checked: unknown related services, credential ids and figure ids fail the render.
- Navigation routes and their order are fixed in code (`navRoutes`); only labels are content.
- Canonicals are derived from routes and slugs, never stored as absolute URLs.
- Nothing outside `src/content/` imports `src/content/source/`; Payload is importable only from
  `src/content`, `src/cms`, `src/app/(payload)`, `src/payload.config.ts`, `scripts/cms` and `tests`.

### 4.3 Content model (Zod, `schema.ts`)

`src/content/schema.ts` is the authority and `docs/cms/02_CONTENT_MODEL.md` maps it to Payload.

```ts
Site            stored as SiteSource { legalName, displayName, tagline, abn?, address?, phone, email,
                  linkedIn?, responseTime, serviceArea, locationLabel, socialLinks[], mapsUrl?,
                  officeAddress? + showOfficeAddress, businessHours? + showBusinessHours,
                  navLabels, ctaLabels, uiLabels, insightsEnabled, updatedAt? }
                returned with a derived nav[] (fixed routes, stored labels)
Service         { slug, title, shortTitle, summary, outcome, icon (fixed set), challenge, whyItMatters,
                  capability, scopeAndOutputs[], deliveryApproach[4], standards[], evidence?,
                  relatedSlugs[], media: { hero, detail }, seo, enabled, sortOrder, updatedAt? }
Credential      { id, category, title, issuer, identifier?, year?, expiry?, url?, badge?, verified }
ProofItem       { id, sector, challenge, outcome, metric?, disclosureApproved }
Article         { slug, title, summary, publishedAt, updatedAt?, readingMinutes, tags[],
                  status, body (Lexical JSON), seo? }
MediaAsset      { id, src, alt, caption, width, height, source, licence, usageRights,
                  attribution?, approvedForPublic }    ImageSlot { id, subject, caption, promptRef }
HomeContent, AboutContent  as before, plus updatedAt?
PagesContent    page intros and closing copy, plus figure ids for services, credentials, contact
LegalPage       { slug, title, lastUpdated, reference, status (pending-adviser | approved),
                  sections[], updatedAt? }
EnquiryType     { value (fixed once created), label, enabled, sortOrder }
SeoEntry        { title, description, canonical (a site path), ogImage? }
```

### 4.4 Data flow

```
CMS mode
  Editor ──HTTPS + password + TOTP──▶ /admin (Payload)
        │  publish: mapper + Zod guard, approval flags (approver only), audit entry
        ▼
  PostgreSQL 17 (+ .data/media/<database>)
        │  afterChange hook → revalidateTag(tag, { expire: 0 })
        ▼
  src/content/cms-source.ts  (Local API, published only, unstable_cache with content tags)
        │  same mappers → Zod → rules
        ▼
  unchanged pages and components ──▶ static HTML, regenerated on the next visit after a publish

Static mode: src/content/source/*.ts → static-source.ts → the same rules → pages (as before the CMS).
```

```
runtime: the enquiry Server Action
  honeypot → Zod (types enabled now) → rate limit → Turnstile → timing
  → save to the inbox (CMS mode; emailStatus "pending") → email → record emailStatus → thank-you
  A saved enquiry whose email failed still shows thank-you and is flagged in the admin (D-14).
  Neither saved nor emailed: the existing error with the email address.
```

### 4.5 Phase 2 as built, and what still differs from the original plan

- The adapter kept every signature; pages and components only changed where copy or figure ids were
  hard-coded (now content: `uiLabels`, `locationLabel`, page figure ids, legal reference) and where the
  inbox changed the Server Action.
- `src/content/source/` is **kept** as the static fallback (D-02); it is not deleted.
- Revalidation is tag-based from Payload hooks, not a publish webhook.
- The placeholder gate now also scans adapter output (`check-content-output.ts`), and publishing a marked
  document is refused on the live site.
- Details, decisions and their reversal steps: `docs/cms/04_DECISIONS_DEFAULTS.md` (D-01 onwards).

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
