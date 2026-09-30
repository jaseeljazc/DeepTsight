# TECH_STACK.md

Pinned choices for the DeepTsight Consulting website. Versions current as of **September 2026** —
verify against the registry at install and record what was actually installed.

Nothing outside this document may be added without approval. See `CLAUDE.md` §7.

---

## 1. Core

| Package               | Version               | Why                                                                                                                                                                                                        |
| --------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next`                | `16.3.x` (Active LTS) | App Router, Server Components, Server Actions, first-class static export, built-in image and font optimisation. 16.3 is the Active LTS line as of the August 2026 security release; take the latest patch. |
| `react` / `react-dom` | `19.2.x`              | Required by Next 16.                                                                                                                                                                                       |
| `typescript`          | `5.9.x`               | `strict: true`, `noUncheckedIndexedAccess: true`. Next 16.3 can optionally use TypeScript 7 for faster `next build` type checking — evaluate, do not adopt blind.                                          |
| `node`                | `22 LTS`              | Pinned in `.nvmrc` and in the CI and hosting runtime.                                                                                                                                                      |
| `pnpm`                | `10.x`                | Strict, fast, good lockfile hygiene. Pinned via `packageManager`.                                                                                                                                          |

**Why Next.js and not a lighter static generator (Astro, Eleventy):** the client has a Phase 2 CMS and
a server-side form. Next covers both without a second runtime, and Payload (§4) installs into the same
app. If the site were permanently static with no CMS, Astro would ship less JavaScript and would be the
better answer — that is not this project.

**Next.js configuration notes**

- `output` stays default (not `export`) so Server Actions work.
- Middleware is `proxy.ts` in Next 16, not `middleware.ts`.
- Security headers set in `next.config.ts`; CSP uses a nonce, not `unsafe-inline`.
- Cache Components / PPR: **not used in Phase 1.** Everything is static. Revisit in Phase 2.

---

## 2. Styling and UI

| Package                    | Version | Why                                                                                                                                                                                                                     |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tailwindcss`              | `4.3.x` | CSS-first `@theme` configuration keeps the design tokens in one file, which is what makes `DESIGN.md` enforceable. Note: Tailwind Labs joined Shopify in September 2026; the project remains MIT and actively released. |
| `@tailwindcss/postcss`     | `4.3.x` | Next integration.                                                                                                                                                                                                       |
| `class-variance-authority` | `0.7.x` | Typed component variants.                                                                                                                                                                                               |
| `tailwind-merge`           | `3.x`   | Safe class composition in primitives.                                                                                                                                                                                   |
| `clsx`                     | `2.x`   | Conditional classes.                                                                                                                                                                                                    |
| `@tailwindcss/typography`  | `0.5.x` | Base for MDX prose, heavily overridden to the type scale.                                                                                                                                                               |

### 2.1 shadcn/ui — selective use only

Installed via CLI as source, **not** as a dependency. Take only: `dialog`, `accordion`, `tabs`, and
`select` if native proves insufficient. Everything else is hand-written (`ARCHITECTURE.md` §5.1).

Underlying Radix packages (`@radix-ui/react-dialog`, `-accordion`, `-tabs`) are pinned directly.

Rationale for the split: shadcn's value is Radix's keyboard and ARIA behaviour, which is genuinely hard
to get right. Its visual defaults — `rounded-md`, `shadow-sm`, low-contrast `border-input` — are the
exact three things this design system forbids, and re-running the CLI reintroduces them. Hand-writing
the visual primitives costs about a day and removes the whole category of regression.

### 2.2 Fonts and icons

| Package           | Version   | Why                                                                                       |
| ----------------- | --------- | ----------------------------------------------------------------------------------------- |
| `next/font/local` | built-in  | Self-hosted WOFF2 subsets. No Google Fonts CDN request — required by the CSP and PERF-11. |
| `lucide-react`    | `0.5xx.x` | 1.5px stroke line icons. Import individually; never `import * as Icons`.                  |

Fonts: Archivo (500, 600), IBM Plex Sans (400, 500), IBM Plex Mono (400). SIL Open Font License,
downloaded once, subset to latin + latin-ext, committed to `public/fonts/`.

---

## 3. Content, forms and validation

| Package                                   | Version | Why                                                                                                                                                                      |
| ----------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `zod`                                     | `4.x`   | One schema serving content validation, form validation and env validation.                                                                                               |
| `react-hook-form`                         | `7.x`   | Client-side form state and error focus management.                                                                                                                       |
| `@hookform/resolvers`                     | `5.x`   | Bridges Zod to RHF.                                                                                                                                                      |
| `next-mdx-remote` or `@next/mdx`          | latest  | MDX for insights and legal pages. Choose `@next/mdx` if articles stay in the repo; `next-mdx-remote` only if Phase 2 needs runtime compilation. Decide at Phase 3 start. |
| `gray-matter`                             | `4.x`   | Front-matter parsing for MDX.                                                                                                                                            |
| `reading-time`                            | `1.5.x` | Article reading estimate.                                                                                                                                                |
| `rehype-slug`, `rehype-autolink-headings` | latest  | Anchorable headings for long service and article pages.                                                                                                                  |

---

## 4. CMS — Phase 2 only

**Recommendation: Payload CMS 3.**

| Package                        | Version  | Notes                                                                                      |
| ------------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| `payload`                      | `3.8x.x` | Installs into the existing Next.js `/app` folder. No second service, no second deployment. |
| `@payloadcms/db-postgres`      | matching | Postgres via Neon or Supabase.                                                             |
| `@payloadcms/richtext-lexical` | matching |                                                                                            |

Why Payload over Sanity here:

- It runs inside the app we already have. One repository, one deploy, one domain — the admin panel is at
  `/admin` on the client's own domain, which matters for a client selling security.
- The content model is already TypeScript and Zod (`ARCHITECTURE.md` §4.3). Payload collections are
  defined in TypeScript, so the migration is a translation rather than a redesign in a new query language.
- MIT licensed, self-hosted, no per-seat pricing. The founder is the only editor; paying per seat for a
  hosted service is poor value at this scale.
- No vendor-hosted copy of the client's content.

Things to know before committing:

- Figma acquired Payload in June 2025. The repository remains MIT and open source, but **Payload Cloud
  stopped taking new signups**, so hosting is our responsibility — that is fine here, since it deploys to
  Vercel alongside the site, but it must be a conscious decision.
- It requires a database. Phase 1 has none. Phase 2 adds Postgres, backups and a restore test.

**Alternative: Sanity.** Choose it if the client wants a fully managed editing service with no database
to operate, or if a non-technical third party will maintain content long term. Costs: a second hosted
service, GROQ to learn, content living in a vendor's cloud, per-seat pricing above the free tier.

**Do not** propose WordPress. It contradicts the security positioning and the performance budgets.

**Phase 1 decision: no CMS.** Content is typed TypeScript and MDX behind the adapter.

---

## 5. Infrastructure and services

| Concern             | Choice                                                 | Notes                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting             | Vercel                                                 | Native Next.js target, automatic HTTPS, per-PR previews, edge CDN. Alternative if the client prefers Australian data residency for the build platform: Cloudflare Pages with `@opennextjs/cloudflare`. Raise with the client (OPEN-07). |
| Transactional email | Resend (`resend` 4.x)                                  | Enquiry delivery. Requires SPF/DKIM/DMARC on the sending domain (SEC-05).                                                                                                                                                               |
| Spam protection     | Cloudflare Turnstile (`@marsidev/react-turnstile` 1.x) | Privacy-preserving, no cookies, no puzzle for most users — unlike reCAPTCHA, which sets cookies and would force a consent banner.                                                                                                       |
| Rate limiting       | `@upstash/ratelimit` + `@upstash/redis`                | Serverless-compatible sliding window. In-memory fallback in development.                                                                                                                                                                |
| Analytics           | Plausible (self-hosted or cloud)                       | Cookieless, no personal data, no consent banner required (PRIV-05). Alternative: Vercel Analytics. **Avoid GA4** — it would force a consent mechanism and adds weight for data the client does not need. Confirm with client (OPEN-08). |
| Monitoring          | Better Stack or UptimeRobot                            | Homepage uptime + synthetic form check (OPS-01).                                                                                                                                                                                        |
| Error tracking      | Sentry — optional, Phase 2                             | Only with `sendDefaultPii: false` and form data scrubbed (PRIV-08). Not required for a static site.                                                                                                                                     |
| DNS and registrar   | TBD — CLIENT (OPEN-12)                                 | Must support DNSSEC and MFA.                                                                                                                                                                                                            |
| Database            | None in Phase 1                                        | Neon Postgres in Phase 2 with Payload.                                                                                                                                                                                                  |

---

## 6. Tooling

| Package                                    | Version          | Purpose                                                               |
| ------------------------------------------ | ---------------- | --------------------------------------------------------------------- |
| `eslint` + `eslint-config-next`            | `9.x` / matching | Linting, plus the custom design-system rules in `ARCHITECTURE.md` §7. |
| `eslint-plugin-jsx-a11y`                   | `6.x`            | Static accessibility linting.                                         |
| `prettier` + `prettier-plugin-tailwindcss` | `3.x` / `0.6.x`  | Formatting and class ordering.                                        |
| `@playwright/test`                         | `1.5x.x`         | E2E and accessibility runs.                                           |
| `@axe-core/playwright`                     | `4.x`            | Automated WCAG checks on every route.                                 |
| `lighthouse-ci`                            | `0.15.x`         | Performance budget gate.                                              |
| `husky` + `lint-staged`                    | latest           | Pre-commit typecheck and lint.                                        |
| `@next/bundle-analyzer`                    | matching Next    | JS budget investigation.                                              |

### Scripts

```jsonc
{
  "dev": "next dev",
  "build": "pnpm check:content && next build",
  "start": "next start",
  "typecheck": "tsc --noEmit",
  "lint": "next lint",
  "format": "prettier --write .",
  "test:e2e": "playwright test tests/e2e",
  "test:a11y": "playwright test tests/a11y",
  "test:perf": "lhci autorun",
  "check:content": "tsx scripts/check-placeholders.ts && tsx scripts/check-contrast.ts",
  "analyze": "ANALYZE=true next build",
}
```

---

## 7. Rejected alternatives, recorded

| Considered              | Rejected because                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Astro                   | Better for a purely static site, but Phase 2 CMS and the Server Action are simpler in one Next app.                      |
| WordPress               | Contradicts the security positioning; plugin attack surface; cannot meet the performance budgets without extensive work. |
| Full shadcn/ui adoption | Visual defaults conflict with the design system in three specific ways; regression risk on every CLI update.             |
| Google Analytics 4      | Requires consent management, adds weight, collects more than the client needs.                                           |
| Google reCAPTCHA        | Sets cookies, forcing a consent banner; Turnstile solves the same problem without one.                                   |
| Google Fonts CDN        | Third-party request, CSP complication, and a privacy-notice entry for no benefit. Self-host.                             |
| A database in Phase 1   | Nothing needs persisting. Adds backup, restore and security obligations for zero gain.                                   |
| Framer Motion           | The motion budget in `DESIGN.md` §7 is CSS-sized. Adding an animation library invites the motion this brief forbids.     |
| Contentful / Strapi     | Considered for Phase 2; Payload's in-app model and TypeScript-native schema fit this codebase better.                    |

---

## 8. Version verification

Before the first install, run `pnpm outdated` against this list and record actual installed versions in
`TASKS.md` Phase 1. Do not code against an API remembered from an older major version — check the
installed package or the version-matched documentation. Next.js 16.3 serves version-matched docs to
coding agents; point `AGENTS.md` at them if the agent tooling supports it.
