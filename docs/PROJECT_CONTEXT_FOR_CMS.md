# Project context for CMS planning

Prepared 2026-10-01 from the source code at commit `6022a21` (branch `main`), and **updated the same day
after the pre-CMS fixes** (uncommitted working tree). Its purpose is to let someone plan the Phase 2 CMS for
the DeepTsight Consulting website without re-reading the repository. It does not implement anything.
Defects and their status are in `docs/PROJECT_CODE_AUDIT.md`; this document mentions them only where they
affect CMS planning.

**Handling note.** `CLAUDE.md` §6 says project files must stay in this local repository. On 2026-10-01 the
project owner decided to share this document with Claude Web for CMS planning. It describes structure and
decisions only: it contains no secrets, environment values, client site names, plant or network details, and
no founder source material (that now lives outside the repository).

## Evidence labels

Every statement here is one of four kinds:

| Label   | Meaning                                                                                                   |
| ------- | --------------------------------------------------------------------------------------------------------- |
| **[F]** | Verified fact: read in the source, config or a command output in this session. A file reference is given. |
| **[I]** | Inference: a conclusion drawn from facts and not tested at runtime.                                       |
| **[R]** | Recommendation: a suggestion for the CMS plan, which still needs a decision.                              |
| **[?]** | Unknown or open question. Do not plan as if it were settled.                                              |

Checks after the fixes: `pnpm typecheck` and `pnpm lint` pass; `pnpm build` passes with all 22 routes
static; Playwright E2E (24/24) and axe accessibility (28/28) pass against the production build;
`tsx scripts/check-placeholders.ts` finds 40 markers; `tsx scripts/check-contrast.ts` passes 40 of 40 pairs.
Lighthouse and a build with `NEXT_PUBLIC_ENV=production` were **not** run (the latter still fails on
placeholders by design).

---

## 1. Purpose and business context

- **[F]** The client is DeepTsight Consulting, a founder-led industrial engineering and OT cybersecurity
  consultancy in Perth, Western Australia. The founder and only practitioner is Deepak Pazhoor
  (`PROJECT.md` §1–2, `src/content/source/site.ts`).
- **[F]** The four services are control systems and E&I engineering, OT cybersecurity and network
  architecture, IT/OT segregation, and plant reliability and asset lifecycle (`src/content/source/services.ts`).
- **[F]** The website has two jobs: to establish credibility with senior engineers, asset owners and
  risk leaders, and to generate qualified enquiries through one contact form (`PROJECT.md` §3).
- **[F]** The site is itself a work sample for a security consultancy. `CLAUDE.md` §2 treats a leaked
  key, an unnecessary third-party script or a weakened CSP as a lost contract, not a minor bug. This
  constraint applies equally to the CMS.
- **[F]** Phase 2 scope, from `PROJECT.md` §9: a CMS so the founder can edit copy, services, credentials,
  insights and metadata without a developer; an Insights draft → review → publish workflow; and migration
  of the repository content into the CMS.
- **[F]** Out of scope (`PROJECT.md` §9): multilingual content, a client portal or authenticated area,
  e-commerce, CRM integration, site search, live chat, gated downloads, comments and booking.
- **[F]** The content model is meant to be defined in Zod first, with the CMS made to match it
  (`PROJECT.md` §9, `ARCHITECTURE.md` §1.4).
- **[F]** One editor is expected: "The founder is the only editor" (`TECH_STACK.md` §4).

## 2. Tech stack

### 2.1 Installed versions (from `node_modules`, this session)

| Package                                        | Installed                  | Documented in `TECH_STACK.md` | Note                                                       |
| ---------------------------------------------- | -------------------------- | ----------------------------- | ---------------------------------------------------------- |
| next                                           | 16.3.7                     | 16.3.x                        | App Router                                                 |
| react / react-dom                              | 19.3.0                     | 19.2.x                        | Minor mismatch with the doc                                |
| typescript                                     | 5.9.3                      | 5.9.x                         | `strict`, `noUncheckedIndexedAccess`                       |
| tailwindcss                                    | 4.3.3                      | 4.3.x                         | CSS-first `@theme` in `src/styles/globals.css`             |
| zod                                            | 3.25.76                    | **4.x**                       | Code uses the Zod 3 API (`errorMap`, `z.string().email()`) |
| lucide-react                                   | 1.49.0                     | 0.5xx.x                       | Icons                                                      |
| react-hook-form                                | 7.88.0                     | 7.x                           | Client form state                                          |
| @hookform/resolvers                            | ~5.9.1                     | 5.x                           | Zod resolver                                               |
| resend                                         | 4.8.0                      | 4.x                           | Enquiry email                                              |
| @marsidev/react-turnstile                      | 1.6.1                      | 1.x                           | CAPTCHA widget                                             |
| @upstash/ratelimit / redis                     | 2.2.0 / ^1.38              | listed                        | Rate limiting                                              |
| class-variance-authority, clsx, tailwind-merge | 0.7 / 2 / 3                | listed                        | Variants and class merging                                 |
| eslint                                         | 9.39.5                     | 9.x                           | Flat config, `eslint .` (not `next lint`)                  |
| @playwright/test, @axe-core/playwright         | 1.5x / 4.x                 | listed                        | E2E and accessibility tests                                |
| Node                                           | 22 (`.nvmrc`)              | 22 LTS                        |                                                            |
| pnpm                                           | 10.28.2 (`packageManager`) | 10.x                          | A `package-lock.json` is also committed                    |

**[F]** Listed in `TECH_STACK.md` but **not installed**: `@tailwindcss/typography`, the Radix packages
behind shadcn `dialog`/`accordion`/`tabs`, `next-mdx-remote` or `@next/mdx`, `gray-matter`,
`reading-time`, `rehype-slug`, `rehype-autolink-headings`, `husky`, `lint-staged`, `lighthouse-ci`,
`@next/bundle-analyzer`. No CMS or database package is installed.

### 2.2 External services in use

| Service              | Used for                                                          | Where                                                           |
| -------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| Resend               | Delivering enquiry email                                          | `src/app/actions/enquiry.ts`                                    |
| Cloudflare Turnstile | CAPTCHA on the enquiry form                                       | `src/components/forms/enquiry-form.tsx`, `src/lib/turnstile.ts` |
| Upstash Redis        | Rate limiting the enquiry action                                  | `src/lib/rate-limit.ts`                                         |
| Plausible            | Analytics, loaded only when `NEXT_PUBLIC_ANALYTICS_DOMAIN` is set | `src/app/layout.tsx` via `src/lib/public-env.ts`                |
| Hosting              | Proposed Vercel; not confirmed                                    | `TECH_STACK.md` §5, OPEN-07 **[?]**                             |

## 3. Folder architecture (as built)

```
.
├── CLAUDE.md  AGENTS.md  AGENT_ROLES.md  PROJECT.md  PRODUCT.md  REQUIREMENTS.md
├── ARCHITECTURE.md  TECH_STACK.md  TASKS.md  pending_work.md
├── (DESIGN.md is NOT in this repo. A copy exists in ../deeptsight-website/DESIGN.md)
├── next.config.ts            security headers and CSP
├── eslint.config.mjs         design-system and content-seam lint rules
├── playwright.config.ts      defaults to `pnpm dev` on port 3001; set PLAYWRIGHT_TEST_BASE_URL to test a production build
├── scripts/                  build-time checks and generators (run by `pnpm build` via check:content)
│   ├── check-env.ts              fails the build when NEXT_PUBLIC_ENV=production and a required variable is missing
│   ├── check-placeholders.ts     scans src/ for placeholder markers; fails when NEXT_PUBLIC_ENV=production
│   ├── check-contrast.ts         WCAG ratios of colour tokens read from globals.css
│   ├── verify-content.ts         calls adapter getters so Zod parses every source file
│   ├── generate-tokens.ts        globals.css → src/styles/tokens.generated.ts
│   ├── generate-dither.ts, generate-globe-data.ts, download-fonts.mjs, lib/*
├── public/
│   ├── images/   AI-generated representative photographs (+ illu/plant-illu.png)
│   ├── badges/   issuer badge artwork for credentials (8 PNG)
│   ├── dither/   globe-perth.svg
│   ├── fonts/    7 WOFF2 files (5 used)
│   └── main-images/  one untracked-purpose PNG
├── src/
│   ├── app/
│   │   ├── layout.tsx                 root: <html lang="en-AU">, fonts, skip link, default metadata, Plausible
│   │   ├── not-found.tsx, global-error.tsx, robots.ts, sitemap.ts, opengraph-image.tsx, twitter-image.tsx
│   │   ├── .well-known/security.txt/route.ts
│   │   ├── actions/enquiry.ts         the only Server Action
│   │   ├── design-system/page.tsx     internal specimen, noindex; 404 on the live site
│   │   └── (site)/                    layout (Header, main, Footer), error.tsx, and every public page (no loading.tsx)
│   ├── components/
│   │   ├── primitives/  button, link, field, input, textarea, select, checkbox, radio, badge, alert, table,
│   │   │                placeholder (Placeholder, MarkedText, isPlaceholder), figure, spec-block,
│   │   │                section-header, drawing-rule, rail-tag, prose (unused)
│   │   ├── layout/      header (client), mobile-nav (client), footer, breadcrumbs, page-header,
│   │   │                anchor-nav (client), container, section, grid (unused), wordmark
│   │   ├── sections/    the nine Home sections
│   │   ├── content/     service-template, service-body, credential-group, legal-document, part,
│   │   │                index-list, process-sequence, project-note, rail-wiring, dot-globe (client),
│   │   │                dot-numeral, dot-ramp, ascii-hero-power-plant, generated data files
│   │   ├── forms/       enquiry-form (client), error-summary
│   │   └── seo/         json-ld, track-event-on-mount (client)
│   ├── content/         ★ the content seam
│   │   ├── index.ts           the adapter: the only public content API
│   │   ├── schema.ts          Zod schemas (the content model)
│   │   ├── types.ts           z.infer types
│   │   ├── enquiry-schema.ts  form schema and enquiry-type list
│   │   └── source/            Phase 1 storage: site, home, about, services, credentials, pages, seo,
│   │                          media, legal/{privacy,terms,accessibility}.ts
│   ├── lib/             env.ts (server), env-rules.ts, public-env.ts (client-safe), site-url.ts,
│   │                    placeholder.ts (marker strings), rate-limit.ts, turnstile.ts, analytics.ts, jsonld.ts, utils.ts
│   └── styles/          globals.css (all tokens), fonts.ts, tokens.generated.ts
├── tests/               a11y/routes.spec.ts, e2e/enquiry-form.spec.ts, e2e/qa-suite.spec.ts
└── docs/                handover docs, content provenance and gaps, briefs, prompts, this document and the audit
(founder source material lives outside the repository in ../deeptsight-private/, git-ignored)
```

- **[F]** Legal pages are TypeScript objects, not MDX (`src/content/source/legal/*.ts`), although
  `ARCHITECTURE.md` §2 and §3 describe MDX.
- **[F]** There is no `src/lib/seo.ts`, `src/lib/email.ts`, `src/components/ui/`, favicon or `proxy.ts`,
  although `ARCHITECTURE.md` §2 lists the first four. `global-error.tsx` now exists.

## 4. Routes and pages

All pages under `src/app/(site)/` export `dynamic = "force-static"` **[F]**.

| Route                                        | File                                | Adapter calls                                                            | Metadata source                | JSON-LD                                      |
| -------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------ | ------------------------------ | -------------------------------------------- |
| `/`                                          | `(site)/page.tsx`                   | `getHomeContent`, `getSite`, `getServices`, `getFigures`, `getSeo("/")`  | `seo.ts`                       | Organization, ProfessionalService            |
| `/about`                                     | `(site)/about/page.tsx`             | `getAboutContent`, `getSite`, `getFigures`, `getPageContent`, `getSeo`   | `seo.ts`                       | Person                                       |
| `/services`                                  | `(site)/services/page.tsx`          | `getServices`, `getSite`, `getFigures`, `getPageContent`, `getSeo`       | `seo.ts`                       | none                                         |
| `/services/[slug]` (4 pages)                 | `(site)/services/[slug]/page.tsx`   | `getService`, `getServices`, `getSite`, `getFigures`, `getPageContent`   | `service.seo` in `services.ts` | Service, BreadcrumbList                      |
| `/credentials`                               | `(site)/credentials/page.tsx`       | `getCredentials`, `getSite`, `getFigures`, `getPageContent`, `getSeo`    | `seo.ts`                       | none                                         |
| `/insights`                                  | `(site)/insights/page.tsx`          | `getSite`, `getArticles`                                                 | none (root default)            | none                                         |
| `/contact`                                   | `(site)/contact/page.tsx`           | `getSite`, `getFigures`, `getPageContent`, `getEnquiryOptions`, `getSeo` | `seo.ts`                       | none                                         |
| `/contact/thank-you`                         | `(site)/contact/thank-you/page.tsx` | `getPageContent`, `getSeo`                                               | `seo.ts`                       | none                                         |
| `/legal/privacy`, `/terms`, `/accessibility` | `(site)/legal/*/page.tsx`           | `getLegalPage(slug)`, `getSeo`                                           | `seo.ts`                       | none                                         |
| 404                                          | `app/not-found.tsx`                 | none (hardcoded)                                                         | root default                   | none                                         |
| `/design-system`                             | `app/design-system/page.tsx`        | none                                                                     | literal, `noindex`             | none (404 when `NEXT_PUBLIC_ENV=production`) |
| `/sitemap.xml`, `/robots.txt`                | `app/sitemap.ts`, `app/robots.ts`   | `getSite`, `getServices`, `getArticles`                                  | —                              | —                                            |
| `/opengraph-image`, `/twitter-image`         | `app/opengraph-image.tsx`           | none (tagline hardcoded; host from the site URL)                         | —                              | —                                            |
| `/.well-known/security.txt`                  | route handler                       | `getSite` (email); URLs from the site URL                                | —                              | —                                            |

- **[F]** `/insights` always returns 404 today: `site.insightsEnabled` is `false` and `getArticles()`
  returns `[]` (`src/content/index.ts`). `/insights/[slug]` and `/insights/rss.xml` do not exist.
- **[F]** Shared chrome (`(site)/layout.tsx`) fetches `getSite()` and `getServices()` for the header
  and footer, so **any** edit to site settings or the service list affects every page.

### 4.1 Home section order (FR-11)

Hero → Trust strip → Capability rail (four services) → Why DeepTsight → Problems addressed → Delivery
approach (the one dark band) → Selected proof (omitted when nothing is approved) → Perth context (dot
globe) → Final CTA with contact particulars **[F]** (`src/app/(site)/page.tsx`).

### 4.2 Service page template (FR-17)

Page header with a "Service particulars" schedule → wide hero figure → sticky contents rail plus nine
numbered parts: 1.0 Client challenge, 2.0 Why it matters, 3.0 Capability (+ detail figure), 4.0 Scope and
outputs (table), 5.0 Delivery approach (process sequence), 6.0 Standards, 7.0 Representative experience
(evidence or placeholder), 8.0 Related services, 9.0 Enquire (final CTA) **[F]**
(`src/components/content/service-template.tsx`, `service-body.tsx`). Part labels are hardcoded in the
component.

## 5. Components and UI patterns

- **[F]** Layers: primitives → layout → sections / content → pages (`ARCHITECTURE.md` §5). Primitives are
  hand-written; shadcn/Radix are not installed.
- **[F]** Signature devices from `DESIGN.md` §0.1: numbered figure captions (CSS counter on `<main>`),
  primary-blue label plates (`tag-plate`), ruled schedules instead of cards (`SpecBlock`, `Table`,
  `IndexList`), title-block footer and `DrawingRule`. Home adds a "marshalling rail" with numbered
  terminal tags (`RailTag`) and dot-matrix devices (`DotNumeral`, `DotRamp`, `DotGlobe`,
  `AsciiHeroPowerPlant`).
- **[F]** Client components (`"use client"`): `Header`, `MobileNav`, `AnchorNav`, `EnquiryForm`,
  `DotGlobe`, `TrackEventOnMount`, the route `error.tsx` and `global-error.tsx`. Client code reads public
  configuration only through `src/lib/public-env.ts`.
- **[F]** Without JavaScript every page's content renders (a site-wide loading boundary that hid it was
  removed), and small screens get a `<noscript>` navigation row.
- **[F]** Placeholder handling: `isPlaceholder()` detects `[PLACEHOLDER]`, `TODO(CLIENT)` and
  `TBD — CLIENT` in any string (defined once in `src/lib/placeholder.ts`). `MarkedText` draws a dashed outline around such strings and `Placeholder`
  renders a dashed "[PLACEHOLDER]" note (`src/components/primitives/placeholder.tsx`). `Figure` shows
  "[PLACEHOLDER] mock image" for media with `approvedForPublic: false` and a dashed frame for image slots.
- **[I]** Components take content as props and mostly do not know where it came from. That is what lets the
  CMS swap the adapter. Several components still contain their own copy, though (§7.3), and that copy would
  not be editable through the CMS.

## 6. The content layer (the CMS seam)

### 6.1 Adapter functions actually exported (`src/content/index.ts`)

| Function              | Returns                    | Source                                         | Filtering                                                                                                                                                                                                                                      |
| --------------------- | -------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getSite()`           | `Site`                     | `source/site.ts`                               | Drops the `/insights` nav item when `insightsEnabled` is false                                                                                                                                                                                 |
| `getHomeContent()`    | `HomeContent`              | `source/home.ts` + credentials register        | Resolves `trustStripIds` against the credentials register and checks `coreCapabilities` slugs against services (an unknown id fails the build). Trust strip `verified`, proof `disclosureApproved`; **only when `NEXT_PUBLIC_ENV=production`** |
| `getFigures()`        | `Record<id, FigureData>`   | `source/media.ts` (register + slots)           | None. Unapproved images are returned and shown as marked mocks                                                                                                                                                                                 |
| `getAboutContent()`   | `AboutContent`             | `source/about.ts`                              | None                                                                                                                                                                                                                                           |
| `getPageContent()`    | `PagesContent`             | `source/pages.ts`                              | None                                                                                                                                                                                                                                           |
| `getEnquiryOptions()` | `{ placeholder, types[] }` | `enquiry-schema.ts` + literal "Select an area" | None                                                                                                                                                                                                                                           |
| `getServices()`       | `Service[]`                | `source/services.ts`                           | None                                                                                                                                                                                                                                           |
| `getService(slug)`    | `Service \| null`          | `source/services.ts`                           | None                                                                                                                                                                                                                                           |
| `getCredentials()`    | `CredentialGroup[]`        | `source/credentials.ts`                        | `verified` (production only); empty groups dropped. Expiry is filtered in the component                                                                                                                                                        |
| `getArticles()`       | `ArticleSummary[]`         | hardcoded `[]`                                 | —                                                                                                                                                                                                                                              |
| `getArticle(slug)`    | `Article \| null`          | hardcoded `null` (slug ignored)                | —                                                                                                                                                                                                                                              |
| `getLegalPage(slug)`  | `LegalPage \| null`        | `source/legal/*.ts`                            | None                                                                                                                                                                                                                                           |
| `getSeo(route)`       | `SeoEntry`                 | `source/seo.ts`, keyed by route string         | Falls back to a literal title and description with the route as canonical path                                                                                                                                                                 |

- **[F]** Every function is `async` and parses its output with Zod.
- **[F]** `enquirySchema` and `EnquiryData` are re-exported from `@/content`.
- **[F]** An ESLint `no-restricted-imports` rule blocks imports of `content/source/*` from outside
  `src/content/` (`eslint.config.mjs:21-32`).
- **[F]** `getFigures`, `getPageContent` and `getEnquiryOptions` are additions that `ARCHITECTURE.md`
  §4.2 does not list. The documented contract is out of date.

### 6.2 Content model (Zod, `src/content/schema.ts`)

```text
SeoEntry      { title, description, canonical (site path, e.g. "/about"), ogImage? }
Site          { legalName, displayName, tagline, abn?, address?, phone, email, linkedIn?,
                responseTime, serviceArea, nav: {label, href}[],
                ctaLabels: { primary, secondary, credentials, header }, insightsEnabled }
Service       { slug, title, shortTitle, summary, outcome, challenge, whyItMatters, capability,
                scopeAndOutputs: { scope, outputs[] }[],
                deliveryApproach: { step, title, description }[],
                standards[], evidence?, relatedSlugs[], media: { hero, detail }, seo: SeoEntry }
Credential    { id, category, title, issuer, identifier?, year?, expiry?, url?, badge?, verified }
CredentialGroup { category, title, items: Credential[] }
ProofItem     { id, sector, challenge, outcome, metric?, disclosureApproved }
ArticleSummary{ slug, title, summary, publishedAt, readingMinutes, tags[] }
Article       ArticleSummary + { updatedAt?, status: "draft" | "published", body: string }
MediaAsset    { id, src, alt, caption, width, height, source, licence, usageRights,
                attribution?, approvedForPublic }
ImageSlot     { id, subject, caption, promptRef }
FigureData    MediaAsset & {kind:"image"} | ImageSlot & {kind:"slot"}
HomeContent   { hero: { headline, supportingText, facts: { label, value, mono? }[] },
                trustStrip: Credential[],          (resolved by the adapter; see HomeSource)
                media: { problems, why, close },
                coreCapabilitiesTitle, coreCapabilitiesIntro,
                coreCapabilities: { slug, title, outcome }[],   (optional Home wording per service slug)
                whyDeepTsight: { title, convergenceLabel, paragraphs[], pillars: {title, description}[] },
                problemsAddressed: { title, items: { challenge, solution }[] },
                deliveryApproach: { title, intro, steps: { step, title, description }[] },
                selectedProofTitle, selectedProof: ProofItem[],
                perthContext: { title, description, officeArea, sectors[] },
                finalCta: { title, supportingText },   (button label comes from site.ctaLabels)
                trustStripCopy: { title, registerLinkLabel, categoryLabels: Record<string,string> } }
HomeSource    HomeContent without trustStrip + { trustStripIds: string[] }   (what home.ts stores)
FinalCtaData  { title, supportingText, ctaLabel }   (what the FinalCta component renders)
AboutContent  { founder: { name, jobTitle }, narrative: { title, paragraphs[] },
                principles: { title, description }[], media: { portrait, site, desk },
                timeline: { period, role, context }[] }
LegalPage     { slug: "privacy" | "terms" | "accessibility", title, lastUpdated,
                sections: { title, content: string }[] }
PagesContent  { about: { finalCta }, services: { title, lead, finalCta },
                serviceTemplate: { engagement, enquiryTitlePrefix, supportingText },
                credentials: { title, lead, finalCta }, contact: { lead, beforeYouWrite: {title, body} },
                thankYou: { title, lead, nextStepsTitle, nextSteps: {title, description}[] } }
EnquiryOptions{ placeholder, types[] }
Enquiry form  { name, workEmail, organisation?, phone?, enquiryType (enum of 5), message, consent: true }
```

Notes for the CMS model:

- **[F]** All text fields are plain strings. There is no rich text anywhere. Legal sections are one
  paragraph string each. `Article.body` is a string that nothing renders yet.
- **[F]** References between records are string ids or slugs. Two are now checked by the adapter
  (`trustStripIds` against the credentials register, `coreCapabilities[].slug` against services). The rest
  have **no integrity check**: `Service.relatedSlugs`, `Service.media.*`, `HomeContent.media.*`,
  `AboutContent.media.*`. A wrong media id makes `Figure` render nothing, silently.
- **[F]** `Credential.category` and `CredentialGroup.category` are free strings. The code expects
  `qualifications`, `registrations`, `certifications`, `platforms` (`credential-group.tsx:66`,
  `home.ts:67-72`).
- **[F]** `Credential.expiry` and `year` are strings. Expiry is parsed as a year with `parseInt`
  (`credential-group.tsx:22-26`).
- **[F]** Unused fields (`icon`, `media.hero/perth/portrait` on Home, `about.portrait`) were removed in the
  fixes. The media records `img-hero-control-room` and `img-perth-industrial-hub` are now unreferenced.
- **[F]** There are no `createdAt`, `updatedAt`, `status`, `author` or `order` fields on any type except
  `Article`. Order is array order in the source files.

## 7. Content inventory and CMS candidacy

Legend for "CMS?": **Yes** = should be editable in the CMS. **Partial** = some fields only. **No** =
keep in code or configuration.

### 7.1 Major content types

| Content type                                                                   | Where it lives now                                                          | Representation                                          | CMS?             | Notes                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Services (4)                                                                   | `source/services.ts`                                                        | `Service[]`, nine-part structure, own SEO block         | **Yes**          | Core editable content. FR-19 needs adding a service to be a data-only change. **[F]** The Home capability rail now follows the service list, with optional Home wording per slug, so a new service appears on Home without a Home edit. **[F]** The process-sequence lamp animation still covers four steps only (`process-sequence.tsx`).                 |
| Credentials (15 in 4 groups)                                                   | `source/credentials.ts`                                                     | `CredentialGroup[]` with `verified`, badge path, URL    | **Yes**          | The verification gate (`verified`) is a publishing control and should be an editor field with an audit trail **[R]**. Five items carry `identifier: "TBD — CLIENT"` while `verified: true` **[F]**.                                                                                                                                                        |
| Home trust strip (4)                                                           | `source/home.ts` `trustStripIds`                                            | Ids resolved against the credentials register           | **Yes**          | **[F]** Stored by reference since the fixes, so each credential exists once. **[R]** Model as a relationship to credential records (or a "featured" flag on them).                                                                                                                                                                                         |
| Selected proof / case studies (2 slots)                                        | `source/home.ts` `selectedProof`                                            | `ProofItem[]` with `disclosureApproved`                 | **Yes**          | Both are placeholders; no approved project exists (`docs/CONTENT_GAPS.md` 1.4). Must never hold client, site or plant names (`CLAUDE.md` §6, CR-05).                                                                                                                                                                                                       |
| Founder / team                                                                 | `source/about.ts` (founder name and title, narrative, principles, timeline) | `AboutContent`                                          | **Yes**          | Only one person. A "team members" collection is not needed **[I]**. The Person structured data reads `about.founder`. Career entries contain employer names and two unresolved name conflicts (`docs/CONTENT_GAPS.md` 2.1–2.2).                                                                                                                            |
| Testimonials                                                                   | none                                                                        | —                                                       | **No**           | **[F]** None exist. `DESIGN.md` §0.2 #15 forbids testimonial components with no testimonials, and `REQUIREMENTS.md` SEO-04 forbids `Review` markup unless real. Do not build one in the first CMS release **[R]**.                                                                                                                                         |
| FAQs                                                                           | none                                                                        | —                                                       | **No**           | **[F]** None exist. `DESIGN.md` §0.2 #15 forbids filler FAQs; SEO-04 forbids `FAQPage` unless real.                                                                                                                                                                                                                                                        |
| Insights / blog                                                                | Schema only (`articleSchema`); adapter returns empty                        | `Article` with `status`, `body: string`                 | **Yes**          | Not built: no article route, no RSS, no MDX/rich-text renderer **[F]**. `PROJECT.md` §9 makes the draft → review → publish workflow part of Phase 2. Launch scope is open (Q-01, OPEN-05) **[?]**.                                                                                                                                                         |
| Home sections copy                                                             | `source/home.ts`                                                            | `HomeContent`                                           | **Yes**          | Section order is fixed by FR-11 and should stay in code **[R]**. The copy inside each section is editable content.                                                                                                                                                                                                                                         |
| Page copy (about, services, credentials, contact, thank-you, service template) | `source/pages.ts`                                                           | `PagesContent`                                          | **Yes**          | Introduced 2026-09-29 to keep copy out of components (`TASKS.md` decisions log). A singleton "page settings" global per page fits it **[R]**.                                                                                                                                                                                                              |
| Navigation                                                                     | `source/site.ts` `nav`                                                      | `{label, href}[]`                                       | **Partial**      | Labels could be editable. The set of routes is fixed by FR-02 and code. **[R]** Edit labels only; keep hrefs and order in code, or validate hrefs against known routes.                                                                                                                                                                                    |
| Footer                                                                         | `components/layout/footer.tsx` + `site`                                     | Mostly hardcoded; reads `site` and service short titles | **Partial**      | Column titles, link labels and "Location" are hardcoded **[F]**. Entity, ABN, email, phone and LinkedIn come from `site`; the "Document" cell shows the host from the site URL.                                                                                                                                                                            |
| CTAs                                                                           | `site.ctaLabels`                                                            | strings                                                 | **Yes**          | **[F]** One source since the fixes: the hero and every closing CTA read `site.ctaLabels`. CTA destinations (`/contact`, `/services`) are hardcoded in components and should stay that way **[R]**.                                                                                                                                                         |
| Images / media                                                                 | `source/media.ts` + files in `public/images`                                | `MediaAsset` register + `ImageSlot`                     | **Yes**          | Rights fields (`source`, `licence`, `usageRights`, `approvedForPublic`) are a CR-04 requirement and must survive the migration. Captions are rendered as numbered figure captions. All current photographs are AI-generated; the founder portrait is a mock and is not the founder (`media.ts:3-11`).                                                      |
| Credential badges                                                              | `public/badges/*.png`, path in `Credential.badge`                           | Static files                                            | **Partial**      | Not in the media register **[F]**. **[R]** Add rights records, or treat issuer artwork as a separate, non-editable asset class.                                                                                                                                                                                                                            |
| Company / contact info                                                         | `source/site.ts`                                                            | `Site` singleton                                        | **Yes**          | Legal name, ABN, phone, email, LinkedIn, response time, service area. **[F]** The email is now read from here everywhere (legal text, enquiry action messages, security.txt). The legal entity name still differs between `site.ts` ("DeepTsight Consulting Pty Ltd") and the privacy and terms text ("DeepTsight Pty Ltd"), pending the client's adviser. |
| SEO metadata                                                                   | `source/seo.ts` (fixed routes) and `Service.seo` (service pages)            | `SeoEntry`                                              | **Yes**          | **[F]** One entry per route since the fixes. Canonicals are stored as paths; the origin comes from `NEXT_PUBLIC_SITE_URL` (`src/lib/site-url.ts`), so the undecided domain is configuration only. **[R]** Derive the canonical from the slug in the CMS rather than letting editors type it.                                                               |
| Legal pages (3)                                                                | `source/legal/*.ts`                                                         | `LegalPage` with plain-string sections                  | **Yes**          | Wording must come from the client's adviser (`PROJECT.md` §11). The "pending adviser approval" status is hardcoded in `legal-document.tsx:43` **[F]**. **[R]** Make status and `lastUpdated` real fields.                                                                                                                                                  |
| Enquiry areas (form select)                                                    | `src/content/enquiry-schema.ts` `enquiryTypes`                              | `as const` tuple used as a Zod enum                     | **No** (for now) | **[F]** The values are written into the enquiry email and validated server-side as an enum. Making them editable needs the server schema to read the same list at runtime **[I]**. Keep in code until there is a reason **[R]**.                                                                                                                           |
| Delivery approach (Home)                                                       | `home.deliveryApproach`                                                     | 4 steps                                                 | **Yes**          | Each service also has its own four-step `deliveryApproach`.                                                                                                                                                                                                                                                                                                |
| Perth / sector context                                                         | `home.perthContext`                                                         | title, description, office area, sectors[]              | **Yes**          | **[F]** The globe and its "Perth, WA" pin label are code and generated data.                                                                                                                                                                                                                                                                               |
| Hero "practice particulars"                                                    | `home.hero.facts`                                                           | `{label, value, mono?}[]`                               | **Yes**          |                                                                                                                                                                                                                                                                                                                                                            |
| Analytics settings                                                             | env var `NEXT_PUBLIC_ANALYTICS_DOMAIN`                                      | config                                                  | **No**           | Security-sensitive configuration (CSP, third-party scripts) stays out of the CMS **[R]**.                                                                                                                                                                                                                                                                  |
| Social share image                                                             | `app/opengraph-image.tsx`                                                   | Hardcoded tagline; host from the site URL               | **Partial**      | `SeoEntry.ogImage` exists in the schema but is not used **[F]**. **[R]** Generate the card from `site.tagline`.                                                                                                                                                                                                                                            |
| security.txt                                                                   | route handler                                                               | Built from `site.email` and the site URL                | **No**           | Stays code-generated **[R]**.                                                                                                                                                                                                                                                                                                                              |

### 7.2 What should stay in code or configuration

- Route structure, slugs of fixed pages, and the Home section order (FR-11).
- Service page structure: the nine parts and their numbering (FR-17). The part labels could become
  editable later, but they are template structure, not content **[R]**.
- Design tokens (`globals.css`), components, the signature devices, motion. `DESIGN.md` §0.4 makes
  `globals.css` the single source of truth. No colour, spacing or layout options belong in the CMS **[R]**.
- Security configuration: CSP, headers, env vars, rate limits, Turnstile, analytics loading.
- The enquiry form fields (FR-30 fixes them) and the privacy rule that no field collects sensitive or
  operational detail.
- Placeholder markers and the verification-gate logic. The _flags_ (`verified`, `disclosureApproved`,
  `approvedForPublic`, `status`) belong in the CMS; the _rules_ that read them stay in the adapter.
- Generated assets (dither paths, globe data, tokens).
- JSON-LD builders. Their inputs should come from content; the builders stay in code.

### 7.3 Copy that is hardcoded in components today

**[F]** These strings are in components or pages, not in `src/content/`. Under the documented plan
("rewrite the adapter and nothing else", `ARCHITECTURE.md` §4.5) they would not become editable.

| File                                                                            | Hardcoded content                                                                                                                  |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx:7-33`                                                       | Default title template "%s \| DeepTsight Consulting", default title, description, OG and Twitter text                              |
| `src/app/(site)/services/page.tsx:87, 140, 154-162`                             | Figure id `img-services-facility`; "View …" link text; "How the disciplines connect" heading and table headers                     |
| `src/app/(site)/about/page.tsx:70, 95, 99, 129`                                 | "Career record", "Connect on LinkedIn" (and its placeholder text), "How DeepTsight works"                                          |
| `src/app/(site)/credentials/page.tsx:48, 61, 76`                                | Figure id `img-credentials-audit`; "Register"; empty-state text                                                                    |
| `src/app/(site)/contact/page.tsx:46-48, 75, 83, 101`                            | "Enquiry", "Fields marked required…", "Perth, Western Australia", "Deepak Pazhoor on LinkedIn", figure id `img-contact-office`     |
| `src/app/(site)/contact/thank-you/page.tsx:54-57`                               | "Explore capabilities", "Return to the home page"                                                                                  |
| `src/app/(site)/legal/accessibility/page.tsx:33-42`                             | "Report an accessibility barrier" block                                                                                            |
| `src/app/(site)/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx` | Error and 404 copy (the route error page now links to Contact instead of printing the email; the 404 host comes from the site URL) |
| `src/components/sections/hero.tsx:61-62`                                        | "Practice particulars"                                                                                                             |
| `src/components/sections/final-cta.tsx:40, 63, 70, 86`                          | "Enquiry", "Or email", "or call", "Contact particulars"                                                                            |
| `src/components/sections/capability-rail.tsx:45, 89`                            | "All services", "View service"                                                                                                     |
| `src/components/sections/delivery-approach.tsx:18`                              | "Delivery approach" rail label                                                                                                     |
| `src/components/sections/perth-context.tsx:34, 39-41, 58`                       | "Location and sectors", "Office", "Sectors", "Perth, WA"                                                                           |
| `src/components/content/service-template.tsx:34-44, 55-58`                      | Nine part labels; "Service particulars", "Outcome", "Key standard", "Engagement"                                                   |
| `src/components/content/credential-group.tsx`                                   | Table headers, "Current", "Verify", "Not applicable"                                                                               |
| `src/components/content/legal-document.tsx:37-45`                               | "Document details", "Last updated", "Reference", and the status "Wording pending adviser approval: TBD — CLIENT"                   |
| `src/components/layout/footer.tsx`                                              | Column titles, link labels, "Perth, Western Australia"                                                                             |
| `src/components/layout/wordmark.tsx:26, 34`                                     | "DeepTsight", "Consulting" (stands in for the logo)                                                                                |
| `src/components/layout/mobile-nav.tsx:140`                                      | "Perth, Western Australia"                                                                                                         |
| `src/components/forms/enquiry-form.tsx`                                         | Every field label, helper text, consent text, button text, privacy line                                                            |
| `src/app/actions/enquiry.ts`                                                    | User-facing error messages and email labels (the email address and brand name now come from `site`)                                |
| `src/lib/jsonld.ts`                                                             | `areaServed: Australia` (person data and `priceRange` were removed or moved to content)                                            |
| `src/app/opengraph-image.tsx`                                                   | Brand, tagline, service line, location (the host comes from the site URL)                                                          |

**[R]** Decide per row: (a) move to content before the CMS, or (b) accept as code-owned UI copy. Email
addresses and the domain are already derived from `site.email` and the site URL; the remaining brand strings
(`layout.tsx`, `wordmark.tsx`, OG image) can be derived from `site.displayName` the same way.

## 8. Types, data structures and validation

- **[F]** Types are inferred from Zod (`src/content/types.ts`); there are no hand-written interfaces for
  content.
- **[F]** Validation runs when the adapter is called: at build time for static pages, and in
  `scripts/verify-content.ts` during `pnpm build` (`check:content`). An invalid record throws.
- **[F]** `verify-content.ts` does not call `getFigures`, `getPageContent` or `getEnquiryOptions`. The adapter
  now checks the trust-strip and capability references; `relatedSlugs` and media ids are still unchecked.
- **[F]** Canonicals must be site paths (`z.string().startsWith("/")`), so a CMS cannot store an absolute URL.
- **[I]** With a CMS and on-demand revalidation, validation moves from "build fails" to "a publish fails to
  regenerate the page". Next.js normally keeps serving the previous page when regeneration throws, so an
  editor could publish and see no change and no error. The CMS needs to validate on save, using the same
  Zod schemas, so editors get the error **[R]**.

## 9. APIs and backend integrations

- **[F]** There is no API layer and no database. The only server-side mutation is the Server Action
  `submitEnquiry` (`src/app/actions/enquiry.ts`): honeypot → Zod validation → rate limit (valid submissions
  only) → Turnstile verification (required on the live site) → 3-second timing check against Cloudflare's
  challenge time → Resend email → `redirect("/contact/thank-you")`. On the live site a missing email
  configuration is an error, never a silent success.
- **[F]** Route handlers: `/.well-known/security.txt` (static), plus the Next.js metadata routes
  (`sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `twitter-image.tsx`).
- **[F]** Outbound calls: Resend API, Cloudflare `siteverify`, Upstash REST. The browser loads Turnstile
  from `challenges.cloudflare.com` on `/contact` and Plausible from `plausible.io` when enabled.
- **[F]** No enquiry is stored (FR-38). Email is the system of record.

## 10. State management

- **[F]** No global state library and no context providers. State is local to client components:
  `MobileNav` (open state, focus trap), `AnchorNav` (active section via IntersectionObserver),
  `EnquiryForm` (React Hook Form + `useActionState`), `DotGlobe` (canvas animation and drag).
- **[F]** No client-side data fetching anywhere (FR-01).

## 11. Forms and validation

- **[F]** One form: the enquiry form. The fields match FR-30: name, work email, organisation, phone,
  enquiry type, message and consent.
- **[F]** One Zod schema (`enquirySchema`) is used by React Hook Form on the client and by the Server
  Action on the server.
- **[F]** Errors appear inline with `aria-describedby`, plus an error summary that takes focus only after a
  failed submit.
- **[F]** The form posts with JavaScript disabled through the `action` prop, which works in development and
  preview (tested). On the live site the server now requires a Turnstile token, and Turnstile needs
  JavaScript, so a no-JS visitor gets an error with the email address instead. Whether that is acceptable is
  open question Q-11 in `TASKS.md` **[?]**.
- **[I]** A CMS would add a second, very different class of form: authenticated admin editing. That is a new
  attack surface and should be designed as such (§13).

## 12. Authentication and authorisation

- **[F]** None. There are no users, sessions, cookies (the site sets none), roles or protected routes.
  `/design-system` returns 404 when `NEXT_PUBLIC_ENV=production`.
- **[F]** Account-level controls are documented only for third-party services: MFA on every production
  account (SEC-16), least-privilege named roles (SEC-17), and an access register
  (`docs/ACCESS_REGISTER.md`).
- **[F]** `TASKS.md` Phase 10 requires the admin at `/admin` with MFA.
- **[I]** The CMS is the first authenticated surface on the site. It will bring cookies, which affects the
  privacy notice's claim that the site uses no cookies (`src/content/source/legal/privacy.ts:32`), even
  if only editors receive them. It may also change the CSP and the "static by default" principle.

## 13. Assets and media

- **[F]** Images are served from `public/` through `next/image`, with AVIF then WebP output
  (`next.config.ts:49-51`). `Figure` enforces aspect ratios and numbered captions.
- **[F]** Each image has a record in `source/media.ts`: id, src, alt, caption, width, height, source,
  licence, usage rights, optional attribution and `approvedForPublic`. Slots without an image have a
  brief in `docs/image-prompts/`.
- **[F]** Files with no media record: `public/badges/*.png` (8), `public/images/illu/plant-illu.png`,
  `public/main-images/*.png`, `public/dither/globe-perth.svg`. CR-04 says an image without a rights
  record must fail the build; no script enforces that.
- **[F]** Fonts are self-hosted with `next/font/local` (5 of the 7 files in `public/fonts/` are used).
- **[R]** Media in the CMS must keep: the rights fields as required fields, `approvedForPublic` as a
  publishing gate, alt text as required (or an explicit "decorative" choice), width and height, and the
  caption. Store files on infrastructure the client controls. Strip EXIF/GPS metadata on upload: a
  photograph of a site could otherwise reveal its location, which `CLAUDE.md` §6 forbids.

## 14. SEO

- **[F]** Every page except `/insights` and the 404 builds its metadata with `generateMetadata` from
  `getSeo(route)` or `service.seo`. Canonicals are stored as paths and resolved against `metadataBase`.
- **[F]** `NEXT_PUBLIC_SITE_URL` is the single origin for `metadataBase`, JSON-LD, the sitemap, robots, the OG
  image and security.txt (`src/lib/site-url.ts`). The domain does not appear in `src/` outside comments.
- **[F]** JSON-LD is serialised with `<`, `>` and `&` escaped (`src/components/seo/json-ld.tsx`), so
  editor-controlled strings cannot break out of the script tag.
- **[F]** JSON-LD: Organization and ProfessionalService (Home), Person (About), Service and BreadcrumbList
  (service pages). An Article builder exists but is unused.
- **[F]** `sitemap.ts` lists static routes and service routes with `lastModified: new Date()` (build time).
- **[F]** `robots.ts` disallows everything, and the root metadata adds `noindex`, unless
  `NEXT_PUBLIC_ENV === "production"`.
- **[R]** For the CMS: store an `updatedAt` per document and use it for `lastModified`; keep SEO title and
  description per document with length guidance; derive canonicals from the slug and the site URL instead of
  letting editors type them.

## 15. Configuration and environment

| Variable                                                   | Scope  | Outside production                  | On the live site (`NEXT_PUBLIC_ENV=production`) | Read in                                        |
| ---------------------------------------------------------- | ------ | ----------------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_ENV`                                          | client | defaults to `development`           | `production`                                    | `src/lib/public-env.ts`                        |
| `NEXT_PUBLIC_SITE_URL`                                     | client | defaults to `http://localhost:3000` | required, https                                 | `src/lib/public-env.ts`, `src/lib/site-url.ts` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                           | client | Cloudflare test key if empty        | required, test keys refused                     | `src/lib/public-env.ts`                        |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN`                             | client | empty: no analytics script          | optional (tool undecided, OPEN-08)              | `src/lib/public-env.ts`                        |
| `TURNSTILE_SECRET_KEY`                                     | server | Cloudflare test secret if empty     | required, test keys refused                     | `src/lib/env.ts`                               |
| `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL` | server | empty: enquiries simulated          | required                                        | `src/lib/env.ts`                               |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`       | server | empty: in-memory limiter            | required                                        | `src/lib/env.ts`                               |

- **[F]** The production rules live in `src/lib/env-rules.ts`. `scripts/check-env.ts` applies them before every
  build (loading `.env` files as Next.js does) and `src/lib/env.ts` throws at runtime if they are broken.
  Errors name variables, never values.
- **[F]** Client code must import `src/lib/public-env.ts`, never `src/lib/env.ts` (server-only).
- **[R]** CMS secrets (database URL, CMS secret, revalidation secret, media storage credentials, any admin
  email transport) should be added to `REQUIRED_IN_PRODUCTION` and the server schema in the same way.

## 16. Existing documentation

| File                                                                         | Purpose                                                                | CMS relevance | State                                                                                                                                                            | Change needed                                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                                                                  | Agent operating rules: never guess, design, a11y, security, code       | High          | Current                                                                                                                                                          | Add CMS rules: admin security, who may flip verification flags, no client data in CMS fixtures |
| `AGENTS.md`                                                                  | Older copy of `CLAUDE.md` for other agents                             | Low           | **Outdated**: differs from `CLAUDE.md` §4 (icon colour `steel-700`, no token/motion rules) and says `CLAUDE.md` imports it, which it does not                    | Regenerate from `CLAUDE.md` or delete                                                          |
| `AGENT_ROLES.md`                                                             | Which specialist agents to use and the generated-imagery limit         | Low           | Partly outdated: §4 "no generated imagery ships" conflicts with decision Q-05 (generated images approved as representative)                                      | Reconcile with Q-05                                                                            |
| `PROJECT.md`                                                                 | Client, scope, sitemap, content models, open decisions                 | High          | Mostly current. Contact table still shows placeholder office/phone/domain; legal name differs from `site.ts`; OPEN-11 still says "amber"                         | Update §1 and §12; add the CMS decision once made                                              |
| `PRODUCT.md`                                                                 | Product summary derived from `PROJECT.md` (for a design skill)         | Low           | Current                                                                                                                                                          | None                                                                                           |
| `REQUIREMENTS.md`                                                            | Testable requirements (FR, CR, A11Y, SEO, PERF, SEC, PRIV, AN)         | High          | Current for Phase 1; has no CMS requirements                                                                                                                     | Add Phase 2 requirements: admin auth, roles, publishing, preview, revalidation, backups        |
| `ARCHITECTURE.md`                                                            | Structure, adapter contract, Phase 2 migration path                    | **Critical**  | **Outdated** in places: folder tree (MDX, `ui/`, `lib/seo.ts`, `actions/` path), adapter function list, content model (missing `media`, `badge`, pages, figures) | Update §2–§4 to match the code before CMS design starts                                        |
| `TECH_STACK.md`                                                              | Pinned versions; Payload 3 recommended for Phase 2                     | High          | **Outdated**: versions not recorded as installed (Zod 3 vs 4.x, lucide 1.x vs 0.5xx), `lint` script, `check:content` script                                      | Record installed versions; confirm Payload version against the registry before planning        |
| `TASKS.md`                                                                   | Phased checklist, open questions, decisions log                        | High          | Current; decisions log and Q-11 updated 2026-10-01. Some items are still ticked that the code does not support (audit §7)                                        | Re-open those items; add the CMS phase detail                                                  |
| `pending_work.md`                                                            | Plain-language list of what is left                                    | Medium        | Current (2026-09-30)                                                                                                                                             | None                                                                                           |
| `DESIGN.md`                                                                  | Design system                                                          | Medium        | **Missing from this repo** (`TASKS.md` decisions log, 2026-09-30). A copy dated after the 24 Sept redesign is in `../deeptsight-website/`                        | Restore it here and update it for the rail, dot-matrix and globe decisions of 2026-09-30/10-01 |
| `docs/CONTENT_EDITING_GUIDE.md`                                              | How the founder edits content in Phase 1                               | High          | **Outdated**: wrong descriptions (credentials as "client past performance", trust strip "metrics"), missing `pages.ts` and `media.ts`                            | Rewrite for the CMS                                                                            |
| `docs/CONTENT_GAPS.md`                                                       | Facts still missing from the client                                    | High          | Current (2026-09-30)                                                                                                                                             | None; every gap here becomes an empty or draft field in the CMS                                |
| `docs/CONTENT_PROVENANCE.md`                                                 | Source of each founder fact                                            | Medium        | Current                                                                                                                                                          | Decide whether provenance moves into the CMS (a field or an audit log) **[?]**                 |
| `docs/DATA_FLOW_PRIVACY.md`                                                  | Enquiry data flow and processors (PRIV-03)                             | High          | Corrected 2026-10-01 (check order, raw IP in Upstash, Turnstile required on the live site)                                                                       | Add the CMS database, media storage and admin sessions                                         |
| `docs/ACCESS_REGISTER.md`                                                    | Accounts and roles                                                     | High          | Current for Phase 1                                                                                                                                              | Add database, CMS admin and media storage                                                      |
| `docs/LICENCES_SERVICES.md`                                                  | Services, env vars, licences                                           | Medium        | Corrected 2026-10-01 (fonts, required production variables)                                                                                                      | Add CMS services                                                                               |
| `docs/MAINTENANCE_PLAN.md`                                                   | Update cadence and QA commands                                         | High          | Incomplete: no backup or rollback section (OPS-03), no named owner                                                                                               | Add database backup and restore before the CMS ships                                           |
| `docs/DeepTsight_Website_Design_and_Architecture_Brief_Updated-1.md`         | The client's original brief                                            | Medium        | Source document                                                                                                                                                  | None                                                                                           |
| `docs/image-prompts/*`                                                       | Briefs for each image position                                         | Low           | Current                                                                                                                                                          | None                                                                                           |
| `docs/prompts/*`                                                             | Prompts used for past redesigns and a Stitch design                    | None          | Historical                                                                                                                                                       | None                                                                                           |
| `docs/design-options/1-marshalling-rail.html`                                | Static demo of the Home rail                                           | None          | Historical                                                                                                                                                       | None                                                                                           |
| `../deeptsight-private/` (outside the repo)                                  | Founder's raw source material and review PDF                           | Medium        | Moved out of the repository and git-ignored 2026-10-01; still in git history                                                                                     | Never import into the CMS directly; facts go through `docs/CONTENT_PROVENANCE.md`              |
| `docs/CONTEXT_EXTRACRION_PROMPT.md`, `docs/PROJECT_CODE_AUDIT.md`, this file | The prompt for this work, the audit (with fix status) and this context | Medium        | Current                                                                                                                                                          | Keep the audit status up to date as findings close                                             |

### 16.1 Documentation missing for CMS planning

1. **Content model specification for the CMS.** One document mapping every Zod schema to a CMS collection or
   global: field types, required fields, validation, references, ordering, and the approval flag for each.
2. **Roles and permissions.** Who may edit, who may publish, and who may set `verified`,
   `disclosureApproved` and `approvedForPublic`. Even with one editor, flipping a verification flag is a
   different act from editing copy.
3. **Publishing workflow.** States (draft, in review, published), whether review is a separate person,
   scheduled publishing, unpublish, preview, and rollback.
4. **Revalidation and cache contract.** Which content change regenerates which routes. Site settings and
   services touch every page through the shared header and footer.
5. **Media management policy.** Upload rules, rights fields, EXIF stripping, size limits, alt text rules,
   storage location and data residency (Q-03).
6. **Admin security design.** Authentication, MFA, session lifetime, admin route exposure, CSP for `/admin`,
   rate limiting of login, audit log, and how the admin affects the "no cookies" privacy claim.
7. **Data, backup and restore.** Database hosting and jurisdiction, backup frequency, restore test
   (`TECH_STACK.md` §4 requires one), and retention.
8. **Migration plan.** The one-off import from `src/content/source/*`, what happens to placeholders during
   import, and how parity with the static site is checked.
9. **SEO in the CMS.** Field rules for titles, descriptions and slugs, slug-change redirects (SEO-10), and
   sitemap `lastModified`.
10. **Editor guide.** Replaces `docs/CONTENT_EDITING_GUIDE.md`.

## 17. Existing CMS or backend code

- **[F]** None. No CMS package, database client, admin route, auth library or revalidation endpoint
  exists.
- **[F]** The documented plan (`ARCHITECTURE.md` §4.5, `TECH_STACK.md` §4, `TASKS.md` Phase 10):
  1. Payload CMS 3 installed into the same Next.js app, admin at `/admin` with MFA.
  2. Postgres (Neon or Supabase) with automated backups and a tested restore.
  3. Collections generated from the existing Zod schemas.
  4. A one-off import script from `content/source/*`.
  5. Rewrite the bodies of the adapter functions, signatures unchanged.
  6. A publish webhook that triggers on-demand revalidation.
  7. A draft / review / publish workflow.
  8. Delete `content/source/`, verify no component changed, re-run the full QA suite, train the founder.
- **[F]** Sanity is the documented alternative (managed, no database to run). WordPress is explicitly
  rejected (`TECH_STACK.md` §4, §7).
- **[F]** "Do not start until the site is live and stable" (`TASKS.md` Phase 10). The site is not live:
  hosting, domain and the production build are open (`pending_work.md`).
- **[?]** CMS choice, hosting, database provider and data residency are unconfirmed (OPEN-07, Q-03).
- **[?]** The Payload version in `TECH_STACK.md` ("3.8x.x") was written in September 2026 and has not
  been checked against Next.js 16.3 and React 19.3. Check compatibility before committing to it.

## 18. Current architecture and how a CMS would integrate

### 18.1 Today

```
build time
  src/content/source/*.ts ──Zod──▶ src/content/index.ts (adapter, approval filtering)
                                         │
                                         ▼
                            app/(site)/**/page.tsx (force-static)
                                         │ props
                                         ▼
                         sections / content / primitives ──▶ static HTML on a CDN

runtime (the only dynamic path)
  EnquiryForm ──Server Action──▶ honeypot, Zod, rate limit (Upstash), Turnstile + timing
                                  ──▶ Resend email ──▶ redirect /contact/thank-you
```

### 18.2 Target shape

`CMS/Admin → API/Backend → Database → Public Website`, mapped onto the documented choice (Payload in the same
app) **[R]**:

```
Founder ──HTTPS + MFA──▶ /admin (Payload admin UI, same Next.js app)
                              │ Payload collections and globals, validated on save
                              ▼
                        Postgres (+ media storage)
                              │
            publish hook ─────┼──▶ revalidatePath / revalidateTag for affected routes
                              ▼
src/content/index.ts  ── Payload Local API (in-process, no public HTTP API) ──▶ same Zod parse,
                                                                                same approval filtering
                              │
                              ▼
            Unchanged page, section and primitive components ──▶ cached static HTML
```

- **[I]** With Payload in the same app, "API/Backend" is the Local API called from the adapter on the
  server. No public content API is needed, which keeps the attack surface small. A headless REST/GraphQL API
  only becomes necessary with a separately hosted CMS such as Sanity.
- **[R]** Keep the adapter's signatures, Zod parsing and approval filtering. The filtering semantics must
  change, though: today non-production shows unapproved content and production hides it. With a CMS this
  should become "draft mode shows drafts; the public site shows only approved and published records".
- **[R]** Keep pages static and use tag-based on-demand revalidation. Tag by content type
  (`site`, `services`, `service:<slug>`, `credentials`, `home`, `about`, `pages`, `legal:<slug>`, `seo`,
  `media`). Remember that `site` and `services` feed the shared layout, so changing either invalidates every
  page.

### 18.3 Frontend areas that must change beyond the adapter

**[F]** unless marked otherwise. `ARCHITECTURE.md` §4.5 says only the adapter changes. In practice these
areas also need work:

1. **Hardcoded copy, ids and URLs in components** (§7.3). Figure ids such as `img-services-facility` are
   chosen in page files, so an editor cannot change which image appears there.
2. **The placeholder gate.** `scripts/check-placeholders.ts` scans source files in `src/` for markers. Once
   content lives in a database the scan cannot see it, and it already flags marker strings inside component
   code (40 findings today; the marker definitions now sit in `src/lib/placeholder.ts`). It needs
   replacing with a check on adapter output or on publish **[I]**.
3. **Build-time dates.** The footer "Revision" date (`footer.tsx:17`), credential expiry
   (`credential-group.tsx:22-26`) and sitemap `lastModified` are computed when the page is built. On-demand
   revalidation makes "build time" unpredictable. Expiry in particular needs either a scheduled
   revalidation or a stored status **[I]**.
4. **Domain and canonical handling.** Done in the fixes: content stores paths and every absolute URL comes
   from `NEXT_PUBLIC_SITE_URL`. The CMS should keep storing paths.
5. **Insights rendering.** No article route, article list, rich-text renderer or RSS exists. The CMS's
   rich-text output (Lexical, for Payload) needs a renderer mapped to the design-system typography.
   `SEC-07` allows `dangerouslySetInnerHTML` only for build-time-compiled MDX, so CMS rich text must be
   rendered as React nodes, not as HTML strings **[R]**.
6. **JSON-LD output.** Done in the fixes: escaped serialisation.
7. **Duplicate sources of truth.** Done in the fixes for the trust strip, CTA labels, service SEO and the Home
   capability list. The legal entity name mismatch remains (it waits on the client's adviser).
8. **CSP and the admin.** The public CSP allows `'unsafe-inline'` scripts so pages can stay static (owner
   decision, 2026-10-01); `'unsafe-eval'` is development-only. The admin UI will need its own policy; check
   what Payload's admin requires and keep the public policy no weaker **[R]**.
9. **Environment validation.** Done in the fixes. Add CMS secrets to the same rules **[R]**.

## 19. Verified facts, inferences, recommendations and unknowns

### 19.1 Key verified facts

- Statically rendered Next.js 16.3 App Router site; content typed in Zod; one adapter module; no database;
  one Server Action; no authentication. Typecheck, lint, build, E2E and axe tests pass.
- The production build cannot currently pass: the placeholder check finds 40 markers in `src/`.
- Production configuration is enforced: the build fails without the required environment variables.
- `/insights` is switched off and has no implementation behind it.
- `DESIGN.md` is not in this repository.
- The site is not live; hosting, domain and the CMS choice are undecided.

### 19.2 Inferences (not tested)

- A Payload-in-app CMS fits the existing adapter with the least change, provided the §18.3 work is done first.
- The first CMS release introduces the site's first cookies, sessions and database, and so changes the
  privacy notice, the CSP and the maintenance and backup obligations.
- Validation failures will surface as silent non-updates after publishing unless the CMS validates on save.

### 19.3 Recommendations

- Decide which remaining hardcoded copy (§7.3) becomes content **before** modelling CMS collections; the
  duplicated sources of truth are already resolved.
- Model collections and globals directly from `src/content/schema.ts` (it is the agreed contract), adding
  `status`, `updatedAt` and reference fields.
- Keep verification flags as explicit, separately permissioned fields with an audit trail.
- Use the Local API from the adapter; no public content API.
- Keep design, layout, motion, routes and security config out of the CMS.

### 19.4 Unknowns and open questions

| #    | Question                                                                                                       | Source                       |
| ---- | -------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| U-1  | Which CMS: Payload (recommended) or Sanity? Who supports it after handover?                                    | OPEN-07, `TASKS.md` Phase 10 |
| U-2  | Hosting provider and data residency for the site, the database and media storage                               | OPEN-07, Q-03                |
| U-3  | Final domain: `deeptsight.com` or `deeptsight.com.au`                                                          | `docs/CONTENT_GAPS.md` 1.1   |
| U-4  | Does Insights launch with content, launch empty or wait? Is the article body rich text or MDX?                 | Q-01, OPEN-05, FR-26         |
| U-5  | Is review a separate person, or does the founder review their own drafts?                                      | `PROJECT.md` §11 (Q-02 open) |
| U-6  | Who may set `verified` / `disclosureApproved` / `approvedForPublic`, and is a record of who and when required? | not documented               |
| U-7  | Are the enquiry types editable content or fixed configuration?                                                 | not documented               |
| U-8  | Should the CMS hold the legal pages, given the wording must come from the client's adviser?                    | `PROJECT.md` §11             |
| U-9  | Does the admin need to be reachable from anywhere, or only from known networks?                                | not documented               |
| U-10 | Is the Payload version in `TECH_STACK.md` compatible with Next 16.3.7 and React 19.3.0?                        | to verify                    |
| U-11 | Should the CMS be started before launch, against `TASKS.md` Phase 10's "not until live and stable"?            | `TASKS.md` Phase 10          |
| U-12 | What is `crm-lead-import-template.xlsx` at the repository root for? CRM integration is out of scope (FR-40).   | not documented               |
| U-13 | Should no-JS enquiries be possible on the live site? The CAPTCHA now requires JavaScript (Q-11)                | `TASKS.md` Q-11              |

## 20. Preliminary CMS scope

### 20.1 Essential (first CMS release)

- Admin at `/admin`, one editor account with MFA, session security, login rate limiting.
- Globals: Site settings (company, contact, CTA labels, nav labels, response time, service area,
  `insightsEnabled`), Home, About, Page copy (`pages.ts`), SEO defaults.
- Collections: Services, Credentials (with groups or a category field), Proof items, Media (with rights
  fields and `approvedForPublic`), Legal pages, SEO entries for fixed routes (or SEO fields on each global).
- Draft and published states for every editable record; preview of drafts before publishing.
- Validation on save with the existing Zod schemas; references instead of copied values.
- On-demand revalidation by content tag; the sitemap uses stored `updatedAt`.
- Database backups with one tested restore before go-live.
- One-off import from `src/content/source/*`, with placeholder markers carried over as visibly unpublished
  drafts.

### 20.2 Future

- Insights: article collection, rich-text editor mapped to the design system, article and index routes, RSS
  (FR-25 to FR-29), `Article` JSON-LD.
- Review step with a second role, if a reviewer is named (U-5).
- Version history and restore for each document.
- Scheduled publishing, and scheduled revalidation for credential expiry.
- Redirect management when a slug changes (SEO-10).

### 20.3 Possible later enhancements

- Capability statement PDF managed as a media asset (FR-24, "could have").
- Tag or category filtering for Insights (FR-28).
- Audit log export, SEO field length warnings, alt-text checks.

Not proposed: testimonials, FAQs, team collection, page builder, layout or colour controls, enquiry storage,
CRM sync. None is required by the documents, and several are forbidden by them.

---

## Context for CMS Planning

**Existing architecture.** A statically rendered Next.js 16.3 App Router site (React 19.3, TypeScript strict,
Tailwind 4, Zod 3.25) with no database and no authentication. All page content passes through one adapter,
`src/content/index.ts`, which reads typed TypeScript objects in `src/content/source/`, parses them with the Zod
schemas in `src/content/schema.ts`, filters unapproved records in production, and returns them through async
functions. Pages are `force-static` and render fully without JavaScript. The only runtime path is the enquiry
Server Action (honeypot, Zod, rate limit with Upstash, Turnstile and timing, Resend email, redirect). All absolute
URLs come from `NEXT_PUBLIC_SITE_URL`; production environment variables are enforced at build time. Typecheck,
lint, build, E2E and axe tests pass; a production build is still blocked by 40 placeholder markers.

**Website.** Fourteen public page routes: Home (nine fixed sections), About, Services plus four service pages on one
nine-part template, Credentials, Insights (switched off, not implemented), Contact and thank-you, three legal
pages; plus the 404 and an internal `/design-system`. The design is a strict token system in `globals.css`, with an
"engineering record" visual language. `DESIGN.md`, its specification, is missing from this repository.

**Content structure.** Globals: site settings, home, about, page copy, SEO by route. Collections: services (4),
credentials (15 in four groups), proof items (2 placeholders), media register (17 images and 1 slot), legal pages
(3). Articles exist only as a schema. All text is plain strings. Each fact is stored once (the trust strip
references credential ids; CTA labels live in site settings), and canonicals are paths. References are string ids,
only partly checked, and a fair amount of UI copy and figure choices are still hardcoded in components.

**CMS candidates.** Services, credentials (with the verification flag), proof items, about and founder record,
Home section copy, page copy, site and contact settings, CTA and nav labels, media with rights records, SEO
metadata, legal pages, and later Insights. Not candidates: testimonials, FAQs and a team collection (none exist,
and the design rules forbid empty ones), routes, section order, the service template structure, design tokens,
motion, security settings and the enquiry form fields.

**Required CMS capabilities.** MFA-protected admin for one editor; draft and published states with preview;
validation on save using the existing schemas; references between records; media with mandatory rights,
approval and alt text, plus EXIF stripping; separately controlled approval flags (`verified`,
`disclosureApproved`, `approvedForPublic`); on-demand revalidation by tag; `updatedAt` for the sitemap; backups
with a tested restore. Later: Insights with rich text, review step, versions, scheduled publishing, redirects.

**Integration requirements.** Keep the adapter's function signatures and Zod parsing; replace only how data is
fetched (Payload Local API in the same app is the documented choice, so no public content API). Already done:
one site URL setting, single sources of truth, escaped JSON-LD, enforced environment variables. Still needed:
decide and move the remaining hardcoded copy and figure ids; replace the source-scanning placeholder gate with a
check on content; render rich text as React nodes, not HTML strings; move build-time dates to stored fields; add
CMS secrets to the environment rules; design the admin's CSP.

**Constraints.** Never invent client facts; unverified content must be visibly marked and must never publish
(`CLAUDE.md` §3). No client, site, plant, network or vulnerability detail anywhere, including CMS fixtures and
uploaded image metadata (`CLAUDE.md` §6, CR-05). Strict CSP, no unapproved third parties, self-hosted fonts.
WCAG 2.2 AA on the public site, and the admin should meet it too. Performance budgets (≤100 kB JS per route).
WordPress is rejected. Restraint: no feature the documents do not call for.

**Documentation gaps.** `DESIGN.md` missing; `ARCHITECTURE.md` and `TECH_STACK.md` out of date; the content
editing guide is inaccurate; no CMS content-model specification, roles and
permissions, publishing workflow, revalidation contract, media policy, admin security design, backup and restore
procedure, migration plan or editor guide.

**Open questions.** CMS choice and support owner; hosting and data residency; the domain; Insights launch scope
and article format; whether review is a second person; who may set approval flags and whether that is audited;
whether enquiry types and legal pages are editable; admin network exposure; Payload compatibility with Next 16.3
and React 19.3; whether CMS work may start before the site is live; the purpose of
`crm-lead-import-template.xlsx`; and whether no-JS enquiries must work on the live site (Q-11).
