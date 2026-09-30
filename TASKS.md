# TASKS.md

Implementation checklist. Work top to bottom, one item at a time. Tick an item only when it meets the
definition of done in `AGENTS.md` §8. Requirement IDs in brackets refer to `REQUIREMENTS.md`.
Agent gates marked **[GATE]** are blocking — see `AGENT_ROLES.md`.
`pending_work.md` is the developer's plain-language summary of what is left. When your work completes
something listed there, tick it there too. The agent-level detail for each item is in the
"Pending against the client brief" section below.

**Current phase:** Phase 0 client inputs, Phase 7 manual QA and Phase 8 launch prep. Start with
"Pending against the client brief".

---

## Phase 0 — Discovery and unblocking

Client-dependent. Chase these in parallel with Phase 1; several block later phases.

- [ ] Confirm name capitalisation: DeepTsight vs DeepTSight (OPEN-01)
- [ ] Confirm whether "Consulting" appears in nav and page titles (OPEN-02)
- [ ] **Sample the navy from the supplied logo file; replace `--ink-800`; regenerate the ink ramp** (OPEN-10) — _blocks final palette sign-off_
- [ ] Present the design system as a proposal; get palette and typeface approval (OPEN-11). _The accent is resolved: the client primary is `#0E50ED` (Q-04)_
- [ ] Confirm real business address, phone, email, ABN, LinkedIn — replace the placeholders in `site.ts`
- [ ] Confirm domain, DNS control, registrar, launch date (OPEN-12)
- [ ] Confirm enquiry destination: inbox, shared mailbox or CRM (OPEN-13)
- [ ] Confirm whether an existing site exists and needs a redirect map (OPEN-14)
- [ ] Confirm priority sectors and geographic service area (OPEN-03)
- [ ] Confirm primary CTA label and preferred enquiry method (OPEN-04)
- [ ] Confirm Insights launch scope — ship with content, ship empty, or defer (OPEN-05)
- [ ] Confirm hosting, CMS timing and ongoing support owner (OPEN-07)
- [ ] Confirm analytics tool, retention and reporting ownership (OPEN-08)
- [ ] Confirm languages, integrations and future functionality to allow for (OPEN-09)
- [ ] Receive founder biography and professional portrait
- [ ] Receive verified credentials with exact wording, status and expiry (OPEN-06) — _blocks `/credentials`_
- [ ] Receive approved publication citations and links
- [ ] Receive approved service descriptions and technology references
- [ ] Receive permitted client, project and outcome evidence — or written confirmation there is none for launch
- [ ] Receive image assets with documented usage rights — **no generated imagery ships** (`AGENT_ROLES.md` §4)
- [ ] Receive privacy, terms and cookie text approved by the client's adviser
- [ ] Agree who writes final page copy, and the review and approval route
- [ ] Sign off the sitemap and service slugs before any route is built
- [ ] _Advisor:_ `agency-brand-guardian` on OPEN-10 and OPEN-11 — decision recorded in `DESIGN.md` §1 and §3.4
- [ ] _Advisor:_ `agency-ux-researcher` pressure-tests the sitemap and credentials hierarchy — **before** routes exist; sitemap frozen after this

**Deliverable:** confirmed requirements, audience summary, content inventory, sitemap, page-level content model.

---

## Phase 1 — Foundation

- [x] `create-next-app`: TypeScript, App Router, `src/`, pnpm; Node 22 in `.nvmrc`
- [x] `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, path alias `@/*`
- [x] Record actual installed versions of everything in `TECH_STACK.md` §1–6
- [x] Tailwind v4 installed; `globals.css` with the full `@theme` token block from `DESIGN.md` §9
- [x] Disable Tailwind's default colour palette and all shadow utilities in the theme
- [x] ESLint: `eslint-config-next`, `jsx-a11y`, plus custom rules — no raw hex, no off-scale spacing, no non-token radii, no `outline-none` without a `focus-visible` replacement, no import of `content/source/*` outside `content/`
- [x] Prettier + `prettier-plugin-tailwindcss`; Husky + lint-staged pre-commit
- [x] Download, subset and self-host Archivo, IBM Plex Sans, IBM Plex Mono; wire `next/font/local` with metric-matched fallbacks [PERF-09, PERF-13]
- [x] Root layout: `lang="en-AU"`, font variables, `metadataBase`, skip link [A11Y-17, FR-06]
- [x] `src/lib/env.ts` with Zod validation; `.env.example` covering every variable in `ARCHITECTURE.md` §9
- [x] Security headers and nonce-based CSP in `next.config.ts` [SEC-06]
- [x] `scripts/check-contrast.ts` — recompute every token pair, fail on regression
- [x] `scripts/check-placeholders.ts` — fail production builds on `[PLACEHOLDER]` [CR-02]
- [x] CI: typecheck, lint, build, a11y, on every PR; `main` branch protected [SEC-18]
- [ ] Repository created, ownership recorded, MFA enforced on all accounts [SEC-16]

---

## Phase 2 — Design system in code

Build in isolation and review against `DESIGN.md` §11 before composing any page.

- [x] `primitives/button.tsx` — primary, secondary, tertiary × default, hover, focus-visible, active, disabled, loading [DESIGN §6.1]
- [x] Focus ring utility: `signal-700` on light, `signal-500` on dark, 2px offset [A11Y-07, DESIGN §6.2]
- [x] `primitives/field.tsx` — label, helper text, required marker, error slot, `aria-describedby` wiring
- [x] `input`, `textarea`, `select`, `checkbox`, `radio` — all states, 44px targets [A11Y-09, A11Y-12]
- [x] `primitives/card.tsx` — service, credential, project-summary variants [DESIGN §6.4]
- [x] `primitives/table.tsx` — caption, `th scope`, hairline rules, mono tabular right-aligned figures, mobile scroll container [DESIGN §6.6]
- [x] `primitives/badge.tsx` — standards references only
- [x] `primitives/alert.tsx` — success, warning, danger, info, each with icon plus text [A11Y-14]
- [x] `primitives/link.tsx` — internal, external (with accessible name extension), tertiary-button style
- [x] `primitives/prose.tsx` — MDX type scale mapping, 68ch measure
- [x] `primitives/placeholder.tsx` — visible marker for unapproved content
- [x] `layout/container.tsx`, `section.tsx`, `grid.tsx` — 12 columns, 1200px cap, responsive gutters
- [x] `layout/header.tsx` — sticky, active state, enquiry button [FR-02, FR-03]
- [x] `layout/mobile-nav.tsx` — focus trap, Escape, close on route change, restore focus [FR-04]
- [x] `layout/footer.tsx` — four columns, dark ground, verified link contrast [FR-05]
- [x] `layout/breadcrumbs.tsx` [FR-07]
- [x] `layout/anchor-nav.tsx` — sticky at ≥1024px, `scroll-margin-top` on all targets
- [ ] shadcn install of `dialog`, `accordion`, `tabs`; rewrite classes to tokens in the same commit [ARCH §5.1]
- [x] Internal `/design-system` route rendering every component in every state — **not linked in nav, `noindex`, deleted or gated before launch**
- [x] _Advisor:_ `agency-ui-designer` specifies states for each primitive before it is built, within `DESIGN.md` §6
- [x] _Advisor:_ `agency-ux-architect` on the grid, mobile-nav focus trap and sticky-header/anchor-nav coordination — no dark-mode toggle, no semantic surface tokens
- [x] Axe pass on `/design-system` with zero violations
- [x] Manual keyboard pass over every interactive primitive
- [ ] **[GATE]** `agency-ui-finish-gate-reviewer` on every primitive against `DESIGN.md` §0.2, §3.5, §6
- [ ] **[GATE]** `agency-code-reviewer` on the primitives layer

---

## Phase 3 — Content layer

- [x] `content/schema.ts` — all Zod schemas from `ARCHITECTURE.md` §4.3
- [x] `content/types.ts` — inferred types exported for components
- [x] `content/index.ts` — the adapter, all functions async, all output parsed and approval-filtered [ARCH §4.2]
- [x] `content/source/site.ts` — placeholder contact details clearly marked
- [x] `content/source/services.ts` — four services, full nine-part structure, placeholders where unapproved
- [x] `content/source/credentials.ts` — `verified` flag on every item, expiry handling [FR-21, FR-22]
- [x] `content/source/media.ts` — image rights register; build fails on an image without a record [CR-04]
- [x] `content/source/seo.ts` — title, description, canonical per route [SEO-01]
- [x] Content and legal pipeline wired through typed adapter
- [x] Build-time validation wired into `pnpm build` [CR-01]
- [x] ESLint rule confirmed: nothing outside `content/` imports `content/source/`

---

## Phase 4 — Pages

- [x] `/` — nine sections in order [FR-11]; hero with one primary CTA [FR-12]; trust strip filtered to verified [FR-13]; capability grid linking to children [FR-14]; proof section omitted entirely when no approved entries exist [FR-15]
- [x] `/about` — founder narrative, portrait, delivery principles separated from biography; every claim placeholder-marked until verified
- [x] `/services` — overview of all four [FR-16]
- [x] `/services/[slug]` — one template, nine sections, `generateStaticParams`, related services, CTA [FR-17, FR-18]; adding a fifth service needs data only [FR-19]
- [x] `/credentials` — grouped by category, verified only [FR-20, FR-21]
- [x] `/insights` + `/insights/[slug]` — index newest first, MDX articles [FR-25, FR-26]; single flag removes the route and nav entry if empty at launch [FR-27]
- [x] `/contact` — form plus email alternative, Perth area, LinkedIn, privacy notice [FR-39]
- [x] `/contact/thank-you` — states what happens next [FR-34]
- [x] `/legal/privacy`, `/legal/terms`, `/legal/accessibility` [PRIV-02, A11Y-21]
- [x] `not-found.tsx` — orientation and routes back [FR-08]
- [x] Confirm no modals, pop-ups or interstitials anywhere [FR-09]
- [x] `dynamic = "force-static"` asserted on every page
- [x] **[GATE]** `agency-ui-finish-gate-reviewer` on each page as it is completed, not in a batch at the end
- [x] **[GATE]** `agency-persona-walkthrough-specialist` on Home, one service page and Contact — five-second test and CTA reachability for each of the five audiences in `PROJECT.md` §4

---

## Phase 5 — Enquiry form

- [x] `enquirySchema` in Zod, shared client and server [FR-32]
- [x] `forms/enquiry-form.tsx` — RHF + `useActionState`, works before hydration and with JS disabled [FR-31]
- [x] `actions/enquiry.ts` — validate, honeypot, elapsed-time check, Turnstile, rate limit, send, redirect [FR-35, FR-36, FR-37]
- [x] Error summary at the top of the form receives focus on failed submit; inline errors wired by `aria-describedby` [FR-33, A11Y-13]
- [x] Autocomplete attributes on personal-data fields [A11Y-12]
- [x] Resend configured; SPF, DKIM, DMARC on the sending domain [SEC-05]
- [x] Plain-text email part included
- [x] Delivery failure surfaces a recoverable error showing the direct email address
- [x] Confirm no field contents reach logs or error payloads [PRIV-08]
- [x] Confirm nothing is persisted to a database [FR-38]
- [x] E2E: happy path, each validation failure, no-JS submission, rate-limit response
- [x] **[GATE]** `agency-code-reviewer` on the Server Action — validation, rate limiting, spam controls, no field contents in logs

---

## Phase 6 — SEO, structured data, analytics

- [x] `generateMetadata` on every route from `getSeo()`; unique title and description [SEO-01]
- [x] Canonicals [SEO-03]
- [x] JSON-LD builders: Organization, LocalBusiness, Person, Service, Article, BreadcrumbList — emitting nothing when approved data is absent [SEO-04]
- [x] OG and Twitter metadata; 1200×630 preview image generated in-system [SEO-05]
- [x] `sitemap.ts` with accurate `lastModified` [SEO-06]
- [x] `robots.ts`, full disallow outside production [SEO-07]
- [x] Redirect map implemented, if applicable [SEO-10]
- [x] Analytics installed; events AN-01 to AN-07 firing; confirm no field contents captured [AN-02]
- [x] Confirm the analytics tool sets no cookies, so no banner is required [PRIV-05]
- [x] `/.well-known/security.txt` [SEC-12]

---

## Phase 7 — Quality assurance

- [x] Axe: zero violations on every route, mobile and desktop viewports [A11Y-01]
- [ ] Manual keyboard walkthrough of every page; focus never lost, trapped or hidden behind the sticky header [A11Y-06, A11Y-07]
- [ ] Screen-reader pass: NVDA + Firefox, VoiceOver + Safari (macOS and iOS) [A11Y-20]
- [x] 200% and 400% zoom; 320px width; no horizontal scroll [A11Y-04]
- [x] Text-spacing override test [A11Y-05]
- [ ] Windows High Contrast mode
- [x] Contrast audit against `DESIGN.md` §3.5; confirm the two documented fixes are implemented [A11Y-02, A11Y-03]
- [x] Reduced-motion check [A11Y-16]
- [x] Browser matrix per `REQUIREMENTS.md` §8
- [ ] Real mid-range Android device test
- [ ] Lighthouse CI against all budgets on the four representative pages [PERF-01 to PERF-08]. _Reopened 2026-09-30: `test:perf` exists but there is no `lighthouserc` config and CI does not run it_
- [x] Bundle analysis; confirm ≤100 kB JS per route [PERF-07]
- [x] Link check, including every external link
- [x] Form testing across browsers, including with JavaScript disabled
- [x] Security review: headers (A+ on securityheaders.com and Mozilla Observatory), no mixed content, no source maps, no version disclosure, `pnpm audit` clean of high and critical [SEC-03, SEC-11, SEC-13, SEC-15]
- [x] Confirm no secret, client detail or operational information anywhere in the repository or bundle [SEC-10, CR-05]
- [ ] `check-placeholders` passes on a production build — no unapproved content ships [CR-02]. _Reopened 2026-09-30: fails on client placeholders, and on the helper in `src/lib/jsonld.ts:6`_
- [x] **Template audit:** every page checked against `DESIGN.md` §0.2 — all twenty-one tells absent; no page could have its logo swapped for another company's without something feeling wrong
- [x] Copy audit: every sentence survives "would a principal engineer say this out loud?" [DESIGN §0.2 items 14–18]
- [x] **[GATE]** `agency-ui-finish-gate-reviewer` full-site pass
- [x] **[GATE]** `agency-persona-walkthrough-specialist` full-site pass across all five audiences
- [x] **[GATE]** `agency-code-reviewer` full-repo pass against `AGENTS.md` §6 and §7
- [ ] Client content review and written sign-off against `PROJECT.md` §13

---

## Phase 8 — Launch

- [ ] DNS configured; apex and `www` resolve, one canonical [SEC-04]
- [ ] HTTPS, HSTS with preload, certificate auto-renewal and expiry monitoring [SEC-01, SEC-02]
- [ ] DNSSEC enabled if supported [SEC-05]
- [ ] Production environment variables set; build verified from a clean clone
- [ ] Redirects live and tested
- [ ] `robots.txt` and sitemap verified in production; sitemap submitted to Search Console and Bing
- [ ] Analytics verified in production
- [ ] Uptime and synthetic form monitoring live, alerting a named contact [OPS-01, OPS-02]
- [ ] Backup and rollback procedure tested once [OPS-03]
- [ ] Post-launch smoke test: every page, every form, every external link
- [ ] Post-launch axe and Lighthouse run against production

---

## Phase 9 — Handover

- [x] Access and ownership register: every account, owner, role, renewal date [SEC-19]
- [ ] Credentials transferred securely; developer access reduced to the agreed level; unused accounts removed [SEC-17]
- [x] Maintenance plan: dependency updates, security patches, content updates, cadence, named owners [OPS-04]
- [x] Incident contact and escalation path [OPS-05]
- [x] Content editing guide for the founder (Phase 1: how to request changes; Phase 2: how to use the CMS)
- [x] Licences and third-party service list, with renewal dates
- [ ] Source files, repository ownership, design files transferred
- [ ] Walkthrough session with the client
- [x] Data-flow and privacy documentation delivered [PRIV-03]

---

## Phase 10 — CMS (post-launch)

Do not start until the site is live and stable.

- [ ] Confirm CMS choice with the client — Payload vs Sanity [TECH_STACK §4]
- [ ] Provision Postgres; configure automated backups and test a restore
- [ ] Install Payload into the existing app; admin at `/admin` with MFA
- [ ] Generate collections from the existing Zod schemas
- [ ] One-off import script: `content/source/*` → CMS
- [ ] Rewrite the bodies of the `content/index.ts` functions; **signatures unchanged**
- [ ] Publish webhook → on-demand revalidation of affected routes
- [ ] Draft / review / publish workflow configured
- [ ] Delete `content/source/`
- [ ] Verify no page, section or primitive component was modified during the migration
- [ ] Re-run the full Phase 7 QA suite
- [ ] Founder training on the admin panel

---

## Redesign — "engineering record" (September 2026)

Visual redesign per `docs/prompts/REDESIGN_PROMPT.md`, in the switchroom palette chosen by the
client-side reviewer (see decisions log). Content, routes, form behaviour and security unchanged.

- [x] Tokens, type scale and motion layer in `globals.css`; contrast script updated, all pairs pass
- [x] Fonts reduced to five files (Archivo 500/600, Plex Sans 400/500, Plex Mono 400)
- [x] New primitives: Figure, SectionHeader, SpecBlock, DrawingRule, IndexList, ProcessSequence, ProjectNote, MarkedText
- [x] Header, full-screen mobile menu, title-block footer
- [x] Home (nine sections, FR-11), services overview, service template (nine numbered parts)
- [x] About, credentials register, contact, thank-you, legal template, 404, error, loading
- [x] Card primitive and PageHero removed; design-system specimen rebuilt
- [x] Unverified claims gated as placeholders (trust strip, proof, credentials, career, contact)
- [x] AI mock images marked in `media.ts` and captions; duplicate files removed
- [x] Image briefs for every placeholder frame in `docs/image-prompts/`
- [x] `DESIGN.md` rewritten; `CLAUDE.md` §4 updated
- [x] typecheck, lint, build, `test:a11y` (28/28 routes, desktop and mobile) pass
- [ ] Manual keyboard walkthrough, screen-reader pass, 200%/400% zoom, Windows High Contrast
- [ ] Lighthouse mobile run on Home, a service page, Credentials, Contact
- [ ] Replace every AI mock image with approved photography — **the founder portrait is not the founder**
- [ ] Client review of lightly edited copy (below) and of new structural copy

**Copy touched during the redesign, pending client review:** home `whyDeepTsight`, `problemsAddressed`
solutions, `deliveryApproach` step titles and intro, `perthContext`, `finalCta` title; about narrative
paragraphs 3–4 and principles; new structural lines on services, about, credentials, contact and thank-you
pages. Changes removed unverified claims ("deterministic", "guarantee", "within one business day",
"20+ years", "Q4 2026", NER/CPEng/MIEAust badges) and moved headings to sentence case.

---

## Deslop and founder content (September 2026)

- [x] `deslop` skill (`.claude/skills/deslop/`); copy, UI and convention audit applied site-wide
- [x] Voice changed to "DeepTsight" (no "we"); Australian spelling; sentence case throughout
- [x] Primitives extended: Button `size`, Link `inline`/`nav`, Alert `tone`, `FieldError`, Badge `pending`; `Part` component
- [x] Page copy moved into `src/content/source/pages.ts`; enquiry form split into three files
- [x] `fill-from-sources` skill; founder facts applied from `docs/sources/`, logged in `docs/CONTENT_PROVENANCE.md`
- [x] Badge verification URLs added to credentials (not visited)
- [x] Founder review PDF at `docs/review/`, generated from live content
- [x] `docs/image-prompts/ALL_PROMPTS.md` covers all 17 image positions
- [x] typecheck, lint, build and `test:a11y` (28/28 against a production server) pass

---

## Pending against the client brief

Gaps found by comparing the site with `docs/DeepTsight_Website_Design_and_Architecture_Brief_Updated-1.md`.
Each item mirrors a line in `pending_work.md`. Tick both when done.

**Client inputs (blocked; don't invent values, CLAUDE.md §3)**

- [ ] Logo: add it to `public/`, sample its darkest colour for `ink-900`, re-run `pnpm check:content` (OPEN-10)
- [ ] Founder portrait: replace `public/images/founder-portrait.jpg` with a real photograph, update `img-portrait-founder` in `media.ts` and the caption in `about.ts`. Never generate it
- [ ] Photography: for each image in `docs/image-prompts/ALL_PROMPTS.md`, replace the file in `public/images/` or fill an `imageSlotSource` slot; set source, licence and rights in `media.ts`. Generated images stay disclosed ("Representative image")
- [ ] Selected proof: fill the two `home.ts` proof items; set `disclosureApproved: true` only with written permission (FR-15)
- [ ] Publication `pub-rams` in `credentials.ts`: fill it in, or remove the entry if there is none
- [ ] `site.ts`: `phone`, `abn`, `linkedIn`; `home.ts` service-area sector; response time in `pages.ts` and `legal/accessibility.ts`
- [ ] Credentials: add identifiers and the missing CRAS, CDS and CMS years; flip `verified: true` per item only after founder confirmation; update `docs/CONTENT_PROVENANCE.md` and `docs/CONTENT_GAPS.md`
- [ ] Apply the founder's answers from the `docs/review/` PDF, then regenerate the PDF

**Features**

- [ ] Insights: add MDX articles, then set `insightsEnabled: true` in `site.ts` (FR-25 to FR-27, Q-01)
- [ ] Capability statement download on `/credentials`, only if approved. Serve a static PDF from `public/`, with no third-party host
- [ ] CMS: see Phase 10. Replace only the adapter bodies in `src/content/index.ts`
- [ ] Analytics: once OPEN-08 is decided, set `NEXT_PUBLIC_ANALYTICS_DOMAIN` and verify the tool against TECH_STACK.md and the CSP (a remote script needs an allowlist entry, not a weakened policy)

**Launch and QA**

- [ ] Hosting and deployment documented (OPEN-07, Q-03 data residency)
- [ ] Backup and rollback section in `docs/MAINTENANCE_PLAN.md` [OPS-03]
- [ ] `lighthouserc` config for `pnpm test:perf`; run it on Home, a service page, Credentials and Contact; record the results
- [ ] `scripts/check-placeholders.ts`: exclude the marker strings in `src/lib/jsonld.ts:6` without weakening the gate
- [ ] Manual keyboard, screen-reader, 200%/400% zoom and Windows High Contrast passes (Phase 7)
- [ ] Pre-launch security review recorded (brief §12)
- [ ] Wireframes and high-fidelity designs, only if the client still requires them (brief §16)

---

## Open questions

Add here whenever a requirement is ambiguous. Do not guess and proceed.

| #    | Question                                                                                                   | Raised          | Status                              |
| ---- | ---------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------- |
| Q-01 | Is Insights launching with content, launching empty, or deferred?                                          | Phase 0         | Open                                |
| Q-02 | Who writes final page copy?                                                                                | Phase 0         | Open                                |
| Q-03 | Does the client want Australian data residency for hosting?                                                | Phase 0         | Open                                |
| Q-04 | Is signal yellow acceptable as the accent, or should it follow the logo?                                   | Redesign        | Closed: client primary is `#0E50ED` |
| Q-05 | Approved photography: shoot, supply, or generated and disclosed as illustrative?                           | Redesign        | Open                                |
| Q-06 | Response-time statement for the contact page and thank-you page                                            | Redesign        | Open                                |
| Q-07 | Is NER current? The record shows it expired in July 2025                                                   | Founder content | Open                                |
| Q-08 | Does the founder have power generation experience? The brief says ATCO Power; LinkedIn says ATCO Australia | Founder content | Open                                |
| Q-09 | Does a RAMS publication exist?                                                                             | Founder content | Open                                |
| Q-10 | Should the footer link to the founder's personal LinkedIn profile or a company page?                       | Founder content | Open                                |

---

## Home rail redesign, "marshalling rail" (September 2026)

Home only, chosen from a local static demo (`docs/design-options/1-marshalling-rail.html`). Content, routes,
form behaviour and security unchanged. Motion is CSS scroll timelines only, with a finished static state.

- [x] Rail tokens, `pl-rail-gutter`, `aspect-banner`, `RailTag`, core line, service wiring and rise motion in `globals.css`
- [x] `CapabilityRail` (four dense terminals from `getServices()`, wired onto a common terminal) replaces `CapabilityIndex`
- [x] Trust register with "Pending verification" status, denser Why, Problems, Delivery, Proof, Perth and closing sections
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:a11y` (28/28 routes, desktop and mobile) pass
- [ ] Manual keyboard walkthrough, screen-reader pass, 200%/400% zoom, Windows High Contrast on Home
- [ ] Lighthouse mobile run on Home
- [ ] Client review of the section labels shown on the terminal tags
- [ ] Roll the rail system out to services, About, Credentials, Contact once Home is approved

---

## Decisions log

Record every judgement call the documents did not cover: what was chosen and why.

| Date       | Decision                                                                                                                                                                                                                          | Reason                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-20 | Primary button is `signal-500` fill with `ink-900` text, not white text                                                                                                                                                           | White on `#C8873D` is 3.00:1 and fails WCAG AA. `ink-900` gives 6.16:1                                                                                                        |
| 2026-09-20 | Focus ring is `signal-700` on light surfaces, `signal-500` on dark                                                                                                                                                                | `signal-500` is 2.77:1 on `steel-050`, below the 3:1 non-text floor                                                                                                           |
| 2026-09-20 | Added `signal-700 #8F5A1F` and `warning-700 #8A6612` to the palette                                                                                                                                                               | Original ramp had no accessible accent or warning colour for body-size text on light surfaces                                                                                 |
| 2026-09-20 | Interactive control borders are `steel-500`, not `steel-200`                                                                                                                                                                      | `steel-200` is 1.58:1 and fails the 3:1 UI-component requirement                                                                                                              |
| 2026-09-20 | Hand-write visual primitives; take only Radix-backed widgets from shadcn                                                                                                                                                          | shadcn defaults conflict with the no-shadow, 2px-radius, high-contrast-border rules                                                                                           |
| 2026-09-20 | No database, no enquiry persistence in Phase 1                                                                                                                                                                                    | Nothing needs persisting; avoids backup, restore and privacy obligations                                                                                                      |
| 2026-09-24 | Visual world changed to "switchroom": enclosure grey ground, anthracite ink, signal yellow accent, Archivo display                                                                                                                | REDESIGN_PROMPT specified Newsreader serif on warm paper with amber; that combination is a recognised AI-generated look. Reviewer chose the switchroom option                 |
| 2026-09-24 | Section numbers only where the sequence is real (service parts, register, index, principles), never on home section headings                                                                                                      | Numbers as decoration are an AI tell; numbered parts aid wayfinding on long documents                                                                                         |
| 2026-09-24 | Unverified entries render as marked placeholders outside production, omitted in production                                                                                                                                        | Lets the design be reviewed with content shape visible while keeping FR-13/15/21/22                                                                                           |
| 2026-09-24 | Existing AI images kept as marked mocks; new positions are placeholder frames with briefs                                                                                                                                         | Reviewer instruction; images are not presented as real photography                                                                                                            |
| 2026-09-24 | Scroll-driven motion via CSS scroll timelines, no JS scroll listeners                                                                                                                                                             | CSP-friendly, zero bundle cost, progressive enhancement, honours reduced motion                                                                                               |
| 2026-09-24 | Header nav keeps "Home"                                                                                                                                                                                                           | FR-02 lists Home in primary navigation                                                                                                                                        |
| 2026-09-24 | next/image formats set to AVIF then WebP                                                                                                                                                                                          | PERF-10                                                                                                                                                                       |
| 2026-09-24 | Client primary `#0E50ED` replaces signal yellow in every role; tint `#7AA2FF` used on the dark band                                                                                                                               | Supplied by the client. `#0E50ED` is 2.6:1 on `ink-900`, so the tint carries focus, lamps and links there                                                                     |
| 2026-09-24 | All design values moved into `globals.css` tokens; arbitrary values, raw hex and icon `strokeWidth` props now fail lint; email and share image use `colorTokens` generated from `globals.css`                                     | Client requirement: editing `globals.css` must change the whole app with nothing hardcoded elsewhere                                                                          |
| 2026-09-29 | Page and template copy (about, services, credentials, contact, thank-you, service template CTA) lives in `src/content/source/pages.ts`, read through `getPageContent()`; trust strip labels live in `home.ts` as `trustStripCopy` | Keeps components presentational (CLAUDE.md §7) and the Phase 2 CMS migration a one-file change                                                                                |
| 2026-09-29 | Closing CTA button labels are not duplicated in `pages.ts`; pages spread the copy and add `site.ctaLabels.primary`                                                                                                                | One source for the primary CTA label. The service template previously hard-coded the same string                                                                              |
| 2026-09-29 | Enquiry areas are exported once as `enquiryTypes` from `enquiry-schema.ts`; the form receives them as an `options` prop from `getEnquiryOptions()`                                                                                | Select options and the zod enum cannot drift. Enum values unchanged, so the enquiry email is unaffected                                                                       |
| 2026-09-29 | Enquiry form error summary and success alert split into `forms/error-summary.tsx` and `forms/enquiry-sent.tsx`; form state and validation stay in `enquiry-form.tsx`                                                              | Presentational parts separated from the client-side logic. Behaviour and markup unchanged                                                                                     |
| 2026-09-29 | `getSeo` fallback title is sentence case without the brand suffix; fallback description drops "Specialist" and the Oxford comma                                                                                                   | The root layout title template appends the brand once. Matches the phase 1 copy decisions                                                                                     |
| 2026-09-29 | Removed `--text-xs`, `--text-sm` and `--text-base` and added `--container-*: initial;` to `globals.css`                                                                                                                           | No component uses the default Tailwind size scale or default container widths any more, so the tokens are the only sizes that exist. `pnpm build` passes                      |
| 2026-09-29 | Founder facts filled from `docs/sources` via the `fill-from-sources` skill; all credentials keep `verified: false`                                                                                                                | Sources are self-reported. Production hides credentials until the founder confirms each one. Provenance in `docs/CONTENT_PROVENANCE.md`, open items in `docs/CONTENT_GAPS.md` |
| 2026-09-29 | Home trust strip's fourth slot changed from the RAMS paper to CAP®                                                                                                                                                                | Neither source mentions a publication. The README lists CPEng, CAP® and ISA/IEC 62443 Expert as the key credentials                                                           |
| 2026-09-29 | NER left off the register                                                                                                                                                                                                         | The LinkedIn headline shows it, but the README says it expired in July 2025                                                                                                   |
| 2026-09-29 | Career timeline omits project, facility and client names (e.g. "an LNG regasification facility")                                                                                                                                  | CLAUDE.md §6. Employer names and role titles are kept, as the user approved                                                                                                   |
| 2026-09-29 | Phone marked `[PLACEHOLDER]`; `localBusinessLd` now omits a placeholder phone, as `organizationLd` already did                                                                                                                    | The README says the number is a development placeholder. Structured data must not publish it                                                                                  |
| 2026-09-30 | Home rebuilt as a "marshalling rail": fixed core line, numbered terminal tags tapped off it, four dense service terminals wired onto one common terminal                                                                          | Chosen by the owner from a local demo. Motion stays CSS scroll timelines with a finished static state; core and taps show from lg only                                        |
| 2026-09-30 | Portrait removed from the Home "Why DeepTsight" section; it still renders on About                                                                                                                                                | The image is a mock that is not the founder. Removing it avoids showing a fake person on the first page                                                                       |
| 2026-09-30 | Terminal numbers (T01, T02 ...) are a CSS counter, not hardcoded                                                                                                                                                                  | An omitted section (selected proof when nothing is approved) must not leave a gap in the numbering                                                                            |
| 2026-09-30 | `--text-display` maximum lowered from 5.25rem to 4.75rem                                                                                                                                                                          | The hero headline wrapped to six lines and pushed the intro below the fold                                                                                                    |
| 2026-09-30 | `DESIGN.md` is referenced by `CLAUDE.md` and this file but does not exist at the project root                                                                                                                                     | Not created in this task. Needs a decision: regenerate it from `globals.css` or restore the earlier copy                                                                      |
| 2026-09-30 | `PRODUCT.md` added at the root, derived from `PROJECT.md`                                                                                                                                                                         | Impeccable's design skill requires it before redesign work. `PROJECT.md` stays the source of truth                                                                            |
| 2026-09-30 | Rail changed from one fixed screen-edge line to a per-section hairline (`.rail-seg`) that runs down every section and fills as it scrolls in                                                                                      | The fixed line filled over the whole page height, so it barely seemed to move. The new fill's leading edge stays about 70% down the screen                                    |
| 2026-09-30 | Rail, tap, wiring and entry animations use scroll distances in length units (`entry-crossing 0px ... 20rem`, `entry 0px ... 15rem`) instead of percentages                                                                        | Percent ranges stretched with block height, so the service wiring drew in about 100px of scroll. Now it draws over about 320px and every entry is the same length             |
| 2026-09-30 | Each Home section (not the hero) fades up 14px once as it enters, via `.rail-enter` on its container                                                                                                                              | Transform and opacity only, compositor-driven, no JS. The hero is left alone so LCP is unaffected                                                                             |
| 2026-09-30 | Rail anchored to the content edge (`--rail-x = --rail-gutter - --rail-offset`) and shown at every width; terminal squares sit on the rail                                                                                         | It was hidden below 1024px and pinned to the viewport edge, 340px from the content at 1920px. Railed containers now have a wider left margin (44px on phones)                 |
| 2026-09-30 | Footer columns go 2-up between md and lg                                                                                                                                                                                          | The 12-column split overflowed the viewport at 768px on every page                                                                                                            |
