# ARCHITECTURE.md

How the codebase is organised and why. The central idea: **the site is a statically rendered document
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
deeptsight-website/
├── AGENTS.md  CLAUDE.md  PROJECT.md  REQUIREMENTS.md  DESIGN.md
├── ARCHITECTURE.md  TECH_STACK.md  TASKS.md  AGENT_ROLES.md
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── public/
│   ├── brand/                      logo lockups, favicon source
│   ├── fonts/                      self-hosted WOFF2 subsets
│   ├── images/                     optimised source images
│   └── .well-known/security.txt
├── scripts/
│   ├── check-placeholders.ts       fails production build on unapproved content
│   ├── check-contrast.ts           recomputes DESIGN.md §3.5 from tokens
│   └── check-budgets.ts            performance budget gate
├── src/
│   ├── app/
│   │   ├── layout.tsx              html lang="en-AU", fonts, skip link, metadata base
│   │   ├── globals.css             → imported from styles/
│   │   ├── not-found.tsx
│   │   ├── global-error.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── opengraph-image.tsx
│   │   ├── icon.svg  apple-icon.png
│   │   └── (site)/
│   │       ├── layout.tsx          Header + main + Footer
│   │       ├── page.tsx                            /
│   │       ├── about/page.tsx                      /about
│   │       ├── services/
│   │       │   ├── page.tsx                        /services
│   │       │   └── [slug]/page.tsx                 /services/:slug
│   │       ├── credentials/page.tsx                /credentials
│   │       ├── insights/
│   │       │   ├── page.tsx                        /insights
│   │       │   ├── [slug]/page.tsx                 /insights/:slug
│   │       │   └── rss.xml/route.ts
│   │       ├── contact/
│   │       │   ├── page.tsx                        /contact
│   │       │   └── thank-you/page.tsx
│   │       └── legal/
│   │           ├── privacy/page.tsx
│   │           ├── terms/page.tsx
│   │           └── accessibility/page.tsx
│   ├── actions/
│   │   └── enquiry.ts              the only Server Action in the app
│   ├── components/
│   │   ├── primitives/             hand-written, design-system-locked
│   │   │   ├── button.tsx  link.tsx  card.tsx  badge.tsx  table.tsx
│   │   │   ├── field.tsx  input.tsx  textarea.tsx  select.tsx
│   │   │   ├── checkbox.tsx  radio.tsx  alert.tsx  prose.tsx
│   │   │   └── placeholder.tsx     visible marker for unapproved content
│   │   ├── ui/                     Radix-backed, tokens overridden at install
│   │   │   ├── dialog.tsx  accordion.tsx  tabs.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx  mobile-nav.tsx (client)  footer.tsx
│   │   │   ├── breadcrumbs.tsx  skip-link.tsx
│   │   │   ├── container.tsx  section.tsx  grid.tsx
│   │   │   └── anchor-nav.tsx (client)
│   │   ├── sections/               homepage composition, one file per section
│   │   │   ├── hero.tsx  trust-strip.tsx  capability-grid.tsx
│   │   │   ├── why-deeptsight.tsx  problems-addressed.tsx
│   │   │   ├── delivery-approach.tsx  selected-proof.tsx
│   │   │   ├── perth-context.tsx  final-cta.tsx
│   │   ├── content/
│   │   │   ├── service-template.tsx    the nine-part service page
│   │   │   ├── credential-group.tsx
│   │   │   ├── article-card.tsx  article-body.tsx
│   │   │   └── mdx-components.tsx      maps MDX elements to primitives
│   │   └── forms/
│   │       └── enquiry-form.tsx (client)
│   ├── content/
│   │   ├── index.ts                ★ THE ADAPTER — the only public surface
│   │   ├── schema.ts               Zod schemas = the content model
│   │   ├── types.ts                inferred types, exported for components
│   │   └── source/                 Phase 1 storage. Deleted or migrated in Phase 2.
│   │       ├── site.ts             name, contact, nav, CTA labels, social
│   │       ├── home.ts
│   │       ├── about.ts
│   │       ├── services.ts
│   │       ├── credentials.ts
│   │       ├── media.ts            image rights register
│   │       ├── seo.ts              per-route titles, descriptions, OG
│   │       ├── legal/*.mdx
│   │       └── insights/*.mdx
│   ├── lib/
│   │   ├── env.ts                  Zod-validated environment
│   │   ├── seo.ts                  metadata builder
│   │   ├── jsonld.ts               structured data builders
│   │   ├── analytics.ts            typed event helper
│   │   ├── rate-limit.ts
│   │   ├── email.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css             @theme tokens, base layer, font faces
└── tests/
    ├── a11y/routes.spec.ts         axe-core across every route
    ├── e2e/enquiry.spec.ts         happy path, validation, no-JS, rate limit
    └── e2e/navigation.spec.ts      keyboard, focus order, mobile menu
```

---

## 3. Routes and rendering

| Route                                              | Rendering                      | Generated from                       |
| -------------------------------------------------- | ------------------------------ | ------------------------------------ |
| `/`                                                | Static                         | `getHomeContent()`                   |
| `/about`                                           | Static                         | `getAboutContent()`                  |
| `/services`                                        | Static                         | `getServices()`                      |
| `/services/[slug]`                                 | Static, `generateStaticParams` | `getServices()` → `getService(slug)` |
| `/credentials`                                     | Static                         | `getCredentials()`                   |
| `/insights`                                        | Static                         | `getArticles()`                      |
| `/insights/[slug]`                                 | Static, `generateStaticParams` | `getArticle(slug)`                   |
| `/contact`                                         | Static shell + Server Action   | `getSite()`                          |
| `/contact/thank-you`                               | Static                         | —                                    |
| `/legal/*`                                         | Static, MDX                    | `getLegalPage(slug)`                 |
| `/sitemap.xml`, `/robots.txt`, `/insights/rss.xml` | Build-time                     | content manifest                     |

`dynamic = "force-static"` is asserted on every page so an accidental dynamic API call fails the build
rather than silently switching a route to SSR.

---

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
export async function getServices(): Promise<Service[]>;
export async function getService(slug: string): Promise<Service | null>;
export async function getCredentials(): Promise<CredentialGroup[]>;
export async function getArticles(): Promise<ArticleSummary[]>;
export async function getArticle(slug: string): Promise<Article | null>;
export async function getLegalPage(slug: LegalSlug): Promise<LegalPage | null>;
export async function getSeo(route: string): Promise<SeoEntry>;
```

Rules:

- Every function is `async` even though Phase 1 is synchronous, so Phase 2 needs no call-site changes.
- Every return value is parsed through its Zod schema before being returned. Invalid content throws at
  build time (CR-01).
- Nothing outside `src/content/` imports from `src/content/source/`. Enforced by an ESLint
  `no-restricted-imports` rule.
- The adapter filters on approval flags: unverified credentials, unapproved proof entries and draft
  articles never reach a component.

### 4.3 Content model (Zod, `schema.ts`)

```ts
Site            { legalName, displayName, tagline, abn?, address, phone, email,
                  linkedIn?, nav[], ctaLabels, insightsEnabled: boolean }
Service         { slug, title, shortTitle, summary, outcome, icon,
                  challenge, whyItMatters, capability, scopeAndOutputs[],
                  deliveryApproach[], standards[], evidence?, relatedSlugs[],
                  seo: SeoEntry }
Credential      { id, category, title, issuer, identifier?, year?, expiry?,
                  url?, verified: boolean }
ProofItem       { id, sector, challenge, outcome, metric?, disclosureApproved: boolean }
Article         { slug, title, summary, publishedAt, updatedAt?, readingMinutes,
                  tags[], status: "draft" | "published", body }
MediaAsset      { id, src, alt, width, height, source, licence,
                  usageRights, attribution?, approvedForPublic: boolean }
SeoEntry        { title, description, canonical, ogImage? }
```

Every user-facing string field also accepts the `[PLACEHOLDER] ` prefix, which the
`check-placeholders` script rejects in production builds.

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
  actions/enquiry.ts
        ├─ Zod parse (same schema as the client)
        ├─ honeypot + elapsed-time check
        ├─ Turnstile verification
        ├─ rate limit by IP and globally
        ├─ send transactional email
        └─ redirect → /contact/thank-you
```

No database. No enquiry persistence. Email is the system of record (FR-38).

### 4.5 Phase 2 migration path

1. Install the CMS into the same Next.js app (`TECH_STACK.md` §4).
2. Generate collections from the existing Zod schemas — the model already exists.
3. Run a one-off import script: `content/source/*` → CMS collections.
4. Rewrite the bodies of the functions in `content/index.ts` to query the CMS. Signatures unchanged.
5. Switch the affected routes from fully static to on-demand revalidation triggered by a publish webhook.
6. Delete `content/source/`.

No page component, section component or primitive is touched in steps 1–6. That is the whole point.

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

Imports flow downward only. A primitive never imports a section.

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

`actions/enquiry.ts` is the only Server Action in the codebase.

- Shares `enquirySchema` with the client component; client validation is a convenience only.
- Returns a discriminated union `{ status: "success" } | { status: "error"; fieldErrors; formError }`
  consumed by `useActionState`, so the form works before hydration.
- Rate limiting: sliding window, 5/hour per IP and 30/hour global (FR-36). Backed by Upstash Redis in
  production; an in-memory limiter in development.
- Spam: honeypot input hidden with CSS (never `display:none` on a focusable field — it is
  `aria-hidden`, `tabindex="-1"`, off-screen), a minimum 3-second elapsed-time check, and Turnstile.
- Email via Resend with a plain-text part. Recipient from `ENQUIRY_TO_EMAIL`.
- Never logs field contents (PRIV-08). Errors log an event ID only.

---

## 7. Styling architecture

- Tailwind v4, configured entirely in `src/styles/globals.css` with `@theme`. No `tailwind.config.js`
  colour or spacing block.
- Default Tailwind colour palette and all shadow utilities are disabled in the theme so that
  `bg-slate-800` and `shadow-md` do not compile. This is the enforcement mechanism for `DESIGN.md`.
- ESLint `no-restricted-syntax` rules ban: raw hex in `className`, arbitrary spacing values outside the
  scale, `rounded-` utilities other than `rounded-control` and `rounded-panel`, and the string
  `outline-none` without an adjacent `focus-visible:` rule.
- Component variants via `class-variance-authority`. No runtime CSS-in-JS.
- `prose.tsx` maps MDX output onto the type scale. MDX never styles itself.

---

## 8. Metadata, SEO and structured data

- `generateMetadata` on every route pulls from `getSeo(route)`. No title or description literal appears
  in a component.
- `metadataBase` set from `NEXT_PUBLIC_SITE_URL`; canonical derived per route.
- `lib/jsonld.ts` exports typed builders: `organizationLd`, `localBusinessLd`, `personLd`, `serviceLd`,
  `articleLd`, `breadcrumbLd`. Each is injected as a `<script type="application/ld+json">` with the CSP
  nonce. A builder returns `null` if required approved data is missing, and nothing is emitted —
  structured data is never populated with placeholder values.
- `sitemap.ts` enumerates static routes plus content-derived routes, with `lastModified` from content
  metadata.
- `robots.ts` returns a full `Disallow: /` when `NEXT_PUBLIC_ENV !== "production"`.

---

## 9. Environment and configuration

`src/lib/env.ts` parses `process.env` with Zod at module load. A missing required variable fails the
build. Server and client schemas are separate; nothing secret is exposed to the client.

| Variable                         | Scope  | Purpose                                    |
| -------------------------------- | ------ | ------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`           | client | canonical base URL                         |
| `NEXT_PUBLIC_ENV`                | client | `development` \| `preview` \| `production` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client | CAPTCHA widget                             |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN`   | client | analytics host                             |
| `TURNSTILE_SECRET_KEY`           | server | CAPTCHA verification                       |
| `RESEND_API_KEY`                 | server | email delivery                             |
| `ENQUIRY_TO_EMAIL`               | server | recipient                                  |
| `ENQUIRY_FROM_EMAIL`             | server | verified sender                            |
| `UPSTASH_REDIS_REST_URL`         | server | rate limiting                              |
| `UPSTASH_REDIS_REST_TOKEN`       | server | rate limiting                              |

---

## 10. Testing architecture

| Layer         | Tool                                   | Scope                                                                                                            |
| ------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Types         | `tsc --noEmit`                         | whole repo, strict                                                                                               |
| Lint          | ESLint + the custom design rules in §7 | whole repo                                                                                                       |
| Content       | Zod at build                           | every content file                                                                                               |
| Accessibility | Playwright + `@axe-core/playwright`    | every route, light and dark sections, mobile and desktop viewports                                               |
| E2E           | Playwright                             | enquiry happy path, validation errors, no-JS submission, rate limit, keyboard navigation, mobile menu focus trap |
| Performance   | Lighthouse CI                          | four representative pages against `REQUIREMENTS.md` §5 budgets                                                   |
| Placeholders  | `scripts/check-placeholders.ts`        | production builds only                                                                                           |
| Contrast      | `scripts/check-contrast.ts`            | recomputes every token pair, fails on a regression below its documented ratio                                    |

CI runs all of the above on every pull request. Nothing merges red.

---

## 11. Deployment

- Git is the source of truth. `main` is protected; production deploys only from CI (SEC-18).
- Preview deployment per pull request, fully `noindex` and `Disallow: /` (SEO-07).
- Build is reproducible from a clean clone with only the documented environment variables.
- Rollback is a redeploy of the previous build; the procedure is tested once before launch (OPS-03).
