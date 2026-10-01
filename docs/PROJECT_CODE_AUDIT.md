# Pre-CMS code audit

Audit of the DeepTsight Consulting website at commit `6022a21` (branch `main`), 2026-10-01. It lists errors,
bugs, technical debt and departures from the project's own rules, so they can be fixed before or alongside the
Phase 2 CMS. Planning context for the CMS itself is in `docs/PROJECT_CONTEXT_FOR_CMS.md`.

**Updated 2026-10-01 after the first round of fixes.** The original audit changed no code. The fixes that
followed are summarised in "Status after the pre-CMS fixes" below, and each finding's heading now carries its
status. Line numbers in the findings refer to the code as audited; files touched by the fixes have moved on.

## How this audit was done

**Rule sources, read before the code:** `CLAUDE.md`, `PROJECT.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`,
`TECH_STACK.md` and `DESIGN.md`. `DESIGN.md` is **not in this repository**. On the owner's instruction, the copy
at `../deeptsight-website/DESIGN.md` (the "engineering record" system, replaced 24 September 2026) was used as the
design source of truth. `TASKS.md` was read for context and its decisions log is cited where the owner approved
a departure, but it is not treated as a rule source.

**Every rule violation below names its source document and section.** Findings that are plain bugs with no
documented rule behind them say so.

**Commands run:**

| Command                             | Result                                                     |
| ----------------------------------- | ---------------------------------------------------------- |
| `pnpm typecheck`                    | Pass (exit 0)                                              |
| `pnpm lint`                         | Pass (exit 0)                                              |
| `tsx scripts/check-contrast.ts`     | Pass, 40 of 40 token pairs                                 |
| `tsx scripts/check-placeholders.ts` | 44 markers found (fails when `NEXT_PUBLIC_ENV=production`) |

**Not run:** `pnpm build`, `pnpm test:a11y`, `pnpm test:e2e`, `pnpm audit`, Lighthouse, any browser or
screen-reader check. Findings about runtime behaviour come from reading the code and are labelled
**(code reading)** where they were not observed running.

**Severity**

| Level        | Meaning                                                                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | Loses enquiries, weakens security, or puts confidential or third-party information in the repository. For this client `CLAUDE.md` §2 treats these as contract-losing. |
| **High**     | Breaks a "must have" requirement, an accessibility criterion, or something the CMS will build on.                                                                     |
| **Medium**   | Real defect or rule breach with limited impact, or debt that will cost more after the CMS lands.                                                                      |
| **Low**      | Tidy-up, dead code, minor inconsistency.                                                                                                                              |

Finding IDs carry their severity: `C-` critical, `H-` high, `M-` medium, `L-` low.

---

## Status after the pre-CMS fixes (2026-10-01)

The owner asked for the findings that should be fixed before CMS planning ("fix now"), and decided three
questions: keep every page static and accept `'unsafe-inline'` scripts for now (C-01); move the founder source
material out of the repository (C-04); leave CI until hosting is chosen (H-05). Changes are uncommitted in the
working tree. Each decision is recorded in the `TASKS.md` decisions log.

| ID   | Status       | What changed, or why it is still open                                                                                                                                                                                                    |
| ---- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01 | Partly fixed | `'unsafe-eval'` now only in development; `object-src 'none'` added (`next.config.ts`). `'unsafe-inline'` kept by owner decision so pages stay static. Revisit with the CMS admin's CSP                                                   |
| C-02 | Fixed        | Production requires the Resend key and both addresses (`src/lib/env-rules.ts`, `scripts/check-env.ts` in `check:content`, runtime throw in `src/lib/env.ts`); the simulated path is development-only; no address fallbacks               |
| C-03 | Fixed        | Missing token fails on the live site; timing uses Cloudflare's `challenge_ts` (3 s); test keys only outside production and refused by the env check. Consequence: no-JS submissions fail on the live site, raised as Q-11 in `TASKS.md`  |
| C-04 | Partly fixed | Moved to `../deeptsight-private/` and git-ignored; references updated. The files remain in git history; rewriting it is the owner's decision                                                                                             |
| C-05 | Fixed (new)  | Found while testing: `(site)/loading.tsx` hid every page's content behind a loading skeleton without JavaScript. Removed                                                                                                                 |
| H-01 | Fixed        | `robots.ts` and a root `noindex` depend on `NEXT_PUBLIC_ENV` only                                                                                                                                                                        |
| H-02 | Open         | Deferred to the CMS work (the gate must check content, not source). Marker strings now defined once in `src/lib/placeholder.ts`; 40 markers found (was 44)                                                                               |
| H-03 | Fixed        | Summary focused only after a failed submit; React Hook Form's own field focus turned off; E2E test added                                                                                                                                 |
| H-04 | Open         | Needs an owner decision on the globe versus `DESIGN.md`                                                                                                                                                                                  |
| H-05 | Open         | CI waits for the hosting decision                                                                                                                                                                                                        |
| H-06 | Fixed        | `json-ld.tsx` escapes `<`, `>`, `&`, U+2028 and U+2029                                                                                                                                                                                   |
| H-07 | Open         | Needs a decision on FR-22 and the five credential identifiers                                                                                                                                                                            |
| H-08 | Open         | Needs the client's adviser. Email addresses in the legal text now come from `site.email`                                                                                                                                                 |
| H-09 | Fixed        | Canonicals stored as paths; all absolute URLs from `NEXT_PUBLIC_SITE_URL` (`src/lib/site-url.ts`); the domain no longer appears in `src/` outside comments; email read from `site.email` (the route error page links to Contact instead) |
| M-01 | Fixed        | Validation before the rate limit; Upstash required in production; Redis fallback logged. The client-IP header is trusted, which is correct on Vercel; recheck if another host is chosen                                                  |
| M-02 | Fixed        | See C-02. Public variables read once in `src/lib/public-env.ts` with dot notation, so Next.js inlines them in the browser                                                                                                                |
| M-03 | Partly fixed | Hero and closing CTA labels, domain, email and person data now come from content. Remaining hardcoded copy needs the owner's code-versus-content split                                                                                   |
| M-04 | Fixed        | Trust strip resolved by credential id; CTA labels from `site.ctaLabels`; capability rail driven by services; unused service SEO entries and `about.portrait` removed. Entity-name mismatch stays with H-08                               |
| M-12 | Fixed        | `<noscript>` navigation row on small screens                                                                                                                                                                                             |
| M-13 | Fixed        | `Figure` uses `preload`                                                                                                                                                                                                                  |
| M-14 | Mostly fixed | Tests added for no-JS submission, rate limit, blur focus, mobile menu focus trap, keyboard order. Run against a production build via `PLAYWRIGHT_TEST_BASE_URL`; the config still defaults to the dev server; no CI                      |
| M-16 | Partly fixed | `DATA_FLOW_PRIVACY.md` and `LICENCES_SERVICES.md` corrected. `CONTENT_EDITING_GUIDE.md`, `AGENTS.md` and `ARCHITECTURE.md` still open                                                                                                    |
| L-01 | Partly fixed | Removed `ascii-hero-plate.tsx`, `power-plant-ascii.ts`, `enquiry-sent.tsx`, unused `icon` and media fields, the ignored hero `figure` prop. Remaining items listed under L-01                                                            |
| L-03 | Partly fixed | `global-error.tsx` added. A favicon waits for the logo                                                                                                                                                                                   |
| L-04 | Fixed        | `/design-system` returns 404 when `NEXT_PUBLIC_ENV=production`                                                                                                                                                                           |
| L-06 | Fixed        | External `UrlObject` uses its `href`                                                                                                                                                                                                     |
| L-07 | Partly fixed | Capability rail follows the service list; the four-stage lamp animation remains                                                                                                                                                          |
| L-09 | Partly fixed | Root canonical removed; the 404 still has the default title                                                                                                                                                                              |
| L-12 | Fixed        | `priceRange` removed; person name and title from `about.ts`; Person JSON-LD guarded against placeholders                                                                                                                                 |
| L-18 | Fixed (new)  | The E2E happy path selected an enquiry type that does not exist and used realistic organisation names; fixtures are now fictional                                                                                                        |

Every other finding is unchanged and open.

**Verification after the fixes** (development environment values, so placeholders are allowed):

| Command                                                                       | Result                                               |
| ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| `pnpm typecheck`, `pnpm lint`                                                 | Pass                                                 |
| `pnpm build`                                                                  | Pass; all 22 routes static                           |
| `tsx scripts/check-env.ts` with `NEXT_PUBLIC_ENV=production` and no variables | Fails and lists the 8 missing variables, as intended |
| Playwright E2E against `next start` (production build)                        | 24 of 24 pass, desktop and mobile                    |
| Playwright a11y (axe) against `next start`                                    | 28 of 28 pass                                        |

**Later change (same day):** service icons were added beside every service title (FR-45). Verified after the
change: `pnpm build` passes, Playwright E2E 24 of 24 and axe 28 of 28 pass against the production build.

**Not verified:** a build with `NEXT_PUBLIC_ENV=production`. It still fails on placeholders (H-02), so the
live-site paths (Turnstile required, `/design-system` 404, robots allow) were checked by reading the code
only. Lighthouse, `pnpm audit` and manual screen-reader checks were not run.

---

## 1. Code errors and bugs

### C-05 Every page hid its content without JavaScript — Critical — **Fixed** (found during the fixes)

- **Where:** `src/app/(site)/loading.tsx` (now removed)
- **What happened (observed in the built HTML):** the route-group `loading.tsx` wrapped every page in a loading
  boundary. The prerendered HTML showed the loading skeleton and kept the real content in a hidden element that
  only JavaScript reveals. With JavaScript off, every page showed a grey skeleton, and the enquiry form could
  not be filled in. The new no-JS E2E test exposed it.
- **Rules:** `REQUIREMENTS.md` §8 ("No JavaScript: all content readable, all navigation usable, enquiry form
  functional"); FR-31.
- **Fix applied:** removed the file. Pages are prerendered, so they never need a loading state.

### C-02 Enquiries are silently discarded when `RESEND_API_KEY` is missing — Critical — **Fixed**

- **Where:** `src/app/actions/enquiry.ts:115-119, 207-214`; `src/lib/env.ts:12`
- **What happens (code reading):** `RESEND_API_KEY` is optional in `env.ts`. When it is absent the action logs
  "Simulated email dispatch" and still redirects to `/contact/thank-you`. In production, a missing or
  mistyped variable means every visitor is told their enquiry was sent while nothing is delivered.
- **Rules:** FR-37 (delivery failure must be logged and shown as a recoverable error), SEC-10 ("the build fails
  on a missing required var") in `REQUIREMENTS.md`; `ARCHITECTURE.md` §9.
- **Also:** `ENQUIRY_TO_EMAIL` and `ENQUIRY_FROM_EMAIL` fall back to hardcoded addresses
  (`enquiry.ts:116-117`, `env.ts:13-14`). The sender default is on `deeptsight.com.au` while the domain is
  undecided (`docs/CONTENT_GAPS.md` 1.1–1.2), so a production send may fail domain verification.
  `.env.example` sets `RESEND_API_KEY=re_placeholder_dev_key`, so a copied example file produces a real API
  call that fails.
- **Fix:** make the Resend key and both addresses required when `NEXT_PUBLIC_ENV=production`, failing the build;
  in production, never take the simulated path; remove address fallbacks from the action.

### C-03 Spam controls can be bypassed — Critical — **Fixed**

- **Where:** `src/app/actions/enquiry.ts:55-67, 79-88`; `src/lib/turnstile.ts:17-24`; `src/lib/env.ts:6, 11`;
  `src/components/forms/enquiry-form.tsx:54-55`
- **What happens (code reading):**
  1. Turnstile is verified **only if** a `cf-turnstile-response` field is present. A request without the
     field skips verification.
  2. The elapsed-time check runs **only if** `rendered_at` is present, and the client sets that value itself.
  3. `TURNSTILE_SECRET_KEY` defaults to Cloudflare's always-pass test secret, and `verifyTurnstileToken`
     returns `true` for any secret starting `1x00000000000000000000`. The client site key falls back to the
     always-pass test key too. If the variables are missing in production, the CAPTCHA is silently off.
- **Result:** in practice only the honeypot and the rate limiter protect the form.
- **Rules:** FR-35 and SEC-08 (`REQUIREMENTS.md`: honeypot **and** timing check **and** Turnstile **and** rate
  limiting); SEC-10; `ARCHITECTURE.md` §6.
- **Note:** without JavaScript there is no Turnstile token and no `rendered_at`, so a no-JS path (FR-31) needs a
  deliberate design: for example, a server-issued signed timestamp in a hidden field for the timing check, and
  a documented decision on how no-JS submissions are treated by the CAPTCHA.
- **Fix:** treat a missing token as a failure in production; issue the timestamp server-side and sign it;
  remove test-key defaults outside development; fail the build when production keys are absent.

### H-02 The placeholder gate can never pass, and will not see CMS content — High — **Open**

- **Where:** `scripts/check-placeholders.ts:10-11, 32-47`
- **What happens:** the script scans every `.ts`/`.tsx`/`.mdx`/`.json` file in `src/` for the marker strings.
  It finds 44 today. Some are real unapproved content, but many are **code**, which can never be "approved":
  the marker list itself (`src/components/primitives/placeholder.tsx:4`, `src/lib/jsonld.ts:6`), UI strings in
  `figure.tsx:92, 97, 121`, `credential-group.tsx:30`, `service-body.tsx:96`, the hardcoded legal status in
  `legal-document.tsx:43`, and fallbacks in `footer.tsx:29, 91`, `about/page.tsx:95`, `contact/page.tsx:80`,
  and the design-system page. A production build therefore fails even when every content item is approved.
  `TASKS.md` already notes the `jsonld.ts` case.
- **CMS impact:** once content lives in a database, a source scan cannot see it, so the gate stops protecting
  production (CR-02) at exactly the moment non-developers start editing.
- **Rules:** CR-02 (`REQUIREMENTS.md`); `CLAUDE.md` §3 (the build must fail on `[PLACEHOLDER]` in production).
- **Fix:** check rendered content instead: walk the adapter output (all getters) in production builds and fail
  on markers; keep marker constants in one module excluded from the scan; move the legal status into content.

### H-03 The error summary steals focus while the user is still filling in the form — High — **Fixed**

- **Where:** `src/components/forms/enquiry-form.tsx:72-73, 103-110`
- **What happens (code reading):** React Hook Form validates `onBlur`. The effect focuses the error summary
  whenever `hasErrors` changes. Tabbing out of an empty required field (for example Name) creates the first
  error, `hasErrors` flips to `true`, and focus jumps to the summary at the top of the form instead of moving to
  the next field.
- **Rules:** FR-33 (summary receives focus "on failed submit"), A11Y-08 (focus order follows reading order) in
  `REQUIREMENTS.md`; `CLAUDE.md` §5.
- **Fix:** focus the summary only in response to a submit attempt (client submit count or a new server
  `state`), not on any change in the error set.

### H-06 JSON-LD is injected without escaping — High — **Fixed**

- **Where:** `src/components/seo/json-ld.tsx:11`
- **What happens:** `JSON.stringify` output goes straight into `dangerouslySetInnerHTML`. `JSON.stringify` does
  not escape `<`, so a string containing `</script>` would close the tag. Today all values come from repository
  files; after the CMS they come from an editor, which makes this an injection path.
- **Rules:** SEC-07 (`REQUIREMENTS.md`: no `dangerouslySetInnerHTML` on anything but build-time-compiled MDX);
  `ARCHITECTURE.md` §8 (JSON-LD injected with the CSP nonce, which it is not).
- **Fix:** escape `<`, `>` and `&` (as `<` etc.) in the serialised JSON, and record the JSON-LD exception
  to SEC-07 as a documented decision, or render via a helper that does both.

### M-01 Rate limiting is weaker than it looks — Medium — **Fixed**

- **Where:** `src/lib/rate-limit.ts:5-18, 78-99`; `src/app/actions/enquiry.ts:40-42, 70-76`
- **What happens (code reading):**
  - The in-memory fallback lives in one server instance. On serverless hosting each instance has its own map,
    so limits are not shared.
  - Any Redis error silently falls back to the in-memory limiter, with no log.
  - The IP is the first `x-forwarded-for` value. On hosts that do not overwrite that header, a client can set
    it and get a fresh limit per request.
  - The limit is consumed before validation. A no-JS visitor who gets five validation errors is locked out for
    an hour.
- **Rules:** FR-36 (5 per IP and 30 global per hour) in `REQUIREMENTS.md`; `ARCHITECTURE.md` §6 (Upstash in
  production, in-memory in development only).
- **Fix:** require Upstash in production; log fallback events without personal data; take the client IP from
  the hosting platform's trusted header; count only submissions that pass validation, or count failures
  separately.

### M-11 Credential status and expiry handling is incomplete — Medium — **Open**

- **Where:** `src/content/schema.ts:73-85`; `src/components/content/credential-group.tsx:22-26, 28-37`
- **What happens:** there is no `status` field; every verified item renders "Current". `expiry` is a free
  string parsed with `parseInt`, so "2028-06" and "June 2028" behave differently. The check runs at build time
  only, so an item that expires after a build stays on the site until the next build. Expiry filtering lives in
  the component, not the adapter.
- **Rules:** FR-21 (issuer, identifier, status and expiry; expired items do not render) in `REQUIREMENTS.md`;
  `ARCHITECTURE.md` §4.2 (the adapter filters on approval flags).
- **Fix:** add `status` and a typed date for `expiry` to the schema; filter in the adapter; schedule a rebuild
  or revalidation around expiry dates.

### M-13 Deprecated `priority` prop on `next/image` — Medium — **Fixed**

- **Where:** `src/components/primitives/figure.tsx:71`, passed from `about/page.tsx:55`,
  `services/page.tsx:90`, `content/service-template.tsx:68`
- **What:** the installed Next 16.3.7 types mark `priority` as `@deprecated Use preload prop instead`
  (`node_modules/next/dist/shared/lib/get-img-props.d.ts:25-28`).
- **Rule:** `TECH_STACK.md` §8 and `CLAUDE.md` §3 (do not code against an API remembered from an older version).
- **Fix:** switch `Figure` to `preload`.

### M-15 Unapproved media reaches production pages — Medium — **Open**

- **Where:** `src/content/index.ts:83-92`; `src/app/(site)/about/page.tsx:52-58`
- **What happens:** `getFigures()` returns every media record whatever its `approvedForPublic` value. The About
  page shows the founder portrait (a mock, "not the founder") as its first, prioritised figure. Today the
  placeholder gate blocks the production build, but only by accident of the source scan (H-02). If that gate is
  fixed, the mock would ship.
- **Rules:** `ARCHITECTURE.md` §4.2 (the adapter filters on approval flags); CR-04 and the `MediaAsset.approvedForPublic`
  field (`ARCHITECTURE.md` §4.3); `CLAUDE.md` §3.
- **Fix:** in production, have the adapter drop unapproved images (or turn them into slots), and make About
  render without a portrait when none is approved.

### L-01 Dead code and unused data — Low — **Partly fixed**

After the fixes: removed `ascii-hero-plate.tsx` and `power-plant-ascii.ts`, the `EnquirySent` branch and file,
the `icon` fields, `home.media.portrait`, `home.media.perth`, `home.media.hero` with the ignored hero `figure`
prop, and `about.portrait`. Still present: `convergence-schematic.tsx` (listed in `DESIGN.md` §8),
`dither-meta.generated.ts` (written by `pnpm dither`), `grid.tsx` (listed in `ARCHITECTURE.md` §2), `prose.tsx`
(kept for future rich text), the two unused font files (fetched by `download-fonts.mjs`), the unreferenced
`img-perth-industrial-hub` and `img-hero-control-room` media records, and `getArticle` ignoring its slug.

| Item                                                                                                                                 | Evidence                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `src/components/content/ascii-hero-plate.tsx` (+ `power-plant-ascii.ts`, only imported by it)                                        | No importer                                                                  |
| `src/components/content/convergence-schematic.tsx`                                                                                   | No importer (still listed in `DESIGN.md` §8)                                 |
| `src/components/content/dither-meta.generated.ts`                                                                                    | No importer                                                                  |
| `src/components/layout/grid.tsx`, `src/components/primitives/prose.tsx`                                                              | No importer                                                                  |
| `EnquirySent` branch in `enquiry-form.tsx:143-145`                                                                                   | The action redirects on success, so `state.success` is never `true`          |
| Schema fields never rendered: `Service.icon`, `coreCapabilities[].icon`, `home.media.portrait`, `home.media.perth`, `about.portrait` | No reader in components                                                      |
| `HeroSection` `figure` prop                                                                                                          | Accepted and ignored (`hero.tsx:20`); `img-hero-control-room` is never shown |
| `img-perth-industrial-hub` media record                                                                                              | No page references it                                                        |
| `public/fonts/ibm-plex-mono-500.woff2`, `ibm-plex-sans-600.woff2`                                                                    | Not loaded by `src/styles/fonts.ts`                                          |
| `getArticle(slug)`                                                                                                                   | Ignores `slug`, returns `null` (`src/content/index.ts:135-137`)              |

### L-06 `Link` breaks on an external `UrlObject` — Low — **Fixed**

- **Where:** `src/components/primitives/link.tsx:90`. `href.toString()` on a `UrlObject` gives
  `"[object Object]"`. Not triggered today (all external links are strings). Bug, no rule.

### L-18 E2E fixtures used an invalid enquiry type and realistic organisation names — Low — **Fixed** (found during the fixes)

- **Where:** `tests/e2e/enquiry-form.spec.ts` before the fixes selected "OT Cybersecurity & Architecture", which
  is not one of the five enquiry types, so the happy-path test could not pass. Fixtures used a government email
  domain and a plausible water-utility name.
- **Rules:** `CLAUDE.md` §6 (nothing identifying a third party's infrastructure, "not in test fixtures").
- **Fix applied:** valid enquiry type; `example.com` address, "Example Organisation", an ACMA fictional-use
  phone number.

### L-11 Repeated live-region announcements — Low — **Open**

- **Where:** `FieldError` has `role="alert"` (`field.tsx:17`) and the error summary is also an alert, so a
  failed submit announces each error twice. `Alert` always sets `role="alert"`, including for static
  information. `CLAUDE.md` §5 asks for errors to be announced; it does not require duplicates. Low.

---

## 2. Rule and architecture violations

### C-01 Content Security Policy allows inline and eval scripts — Critical — **Partly fixed**

- **File:** `next.config.ts:28-42` (line 32)
- **Code:** `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://plausible.io`;
  no nonce; no `proxy.ts`.
- **Rules:** SEC-06 (`REQUIREMENTS.md`: "no `unsafe-inline` for scripts; nonce-based"); `TECH_STACK.md` §1 ("CSP
  uses a nonce, not `unsafe-inline`"); `CLAUDE.md` §6 ("Do not weaken the Content Security Policy to make
  something work"). `TASKS.md` Phase 1 marks "nonce-based CSP" done.
- **Why it matters:** the CSP is the main defence against injected script, on a site sold as evidence of
  security practice.
- **Correction:** remove `'unsafe-eval'` in production. Note a real tension in the rules: a per-request nonce
  in Next.js requires dynamic rendering, while `ARCHITECTURE.md` §1 requires every route to be static. The
  options are (a) hash-based script allow-listing for the static inline scripts Next emits, or (b) nonces via
  `proxy.ts` with dynamic rendering. This needs an owner decision, recorded in the `TASKS.md` decisions log.
  `style-src 'unsafe-inline'` is not covered by SEC-06 but should be reviewed at the same time.

### C-04 Third-party facility name and personal data are committed to the repository — Critical — **Partly fixed**

- **Files:** `docs/sources/DeepTsight_Content_Reference_README.md` (lines 225 and 562 name a specific LNG
  facility; it also carries schooling and language details); `docs/sources/DeepTsight_founder_details.md`
  (project names tied to a location, around line 151; academic grades and rank, lines 306 and 315);
  `docs/sources/Linkedin_profile_data.md` (schooling, languages);
  `docs/review/DeepTsight_founder_details_review.pdf` (not opened in this audit).
- **Rules:** `CLAUDE.md` §6 ("Nothing in this repo may contain client site names, plant details …"); CR-05
  (`REQUIREMENTS.md`: no client, site or plant detail in any content file or commit). `docs/CONTENT_GAPS.md` §3
  confirms the sources contain "power station, project and facility names". `TASKS.md` Phase 7 marks "no client
  detail … anywhere in the repository" done.
- **Correction:** move founder source material out of the repository to storage the founder controls; if it
  must stay, redact facility, project and client names and personal details. Because the files are in git
  history, removal from the working tree is not enough; whether to rewrite history is an owner decision. This
  audit deliberately does not repeat the facility name.

### H-01 Preview deployments can be indexed — High — **Fixed**

- **File:** `src/app/robots.ts:4-6`; `src/app/layout.tsx:7-33`
- **Code:** `isProduction = NEXT_PUBLIC_ENV === "production" || NODE_ENV === "production"`. `next build` sets
  `NODE_ENV=production` for every build, including previews, so a preview without `NEXT_PUBLIC_ENV` serves
  `Allow: /`. No page sets `robots: noindex` outside production.
- **Rules:** SEO-07 (`REQUIREMENTS.md`: preview and staging fully disallowed **and** `noindex`); `ARCHITECTURE.md`
  §8 (`Disallow: /` when `NEXT_PUBLIC_ENV !== "production"`) and §11.
- **Correction:** decide on `NEXT_PUBLIC_ENV` only; add `robots: { index: false }` to root metadata outside
  production.

### H-05 No CI pipeline, pre-commit hooks, dependency automation or performance gate in the repository — High — **Open**

- **Evidence:** no `.github/` directory or other CI config; `husky` and `lint-staged` not installed (the
  `lint-staged` block in `package.json` has nothing to run it); no `lighthouserc`; no Dependabot or Renovate
  config; `@next/bundle-analyzer` not installed, so `pnpm analyze` does nothing.
- **Rules:** `ARCHITECTURE.md` §10 ("CI runs all of the above on every pull request"); SEC-11 (Dependabot or
  Renovate), SEC-18 (deploys only via CI), PERF-14 (budgets enforced in CI) in `REQUIREMENTS.md`;
  `TECH_STACK.md` §6 (husky, lint-staged, lighthouse-ci, bundle analyzer). `TASKS.md` Phase 1 marks CI and
  Husky done.
- **Correction:** add a CI workflow (typecheck, lint, `check:content`, build, a11y, e2e against a production
  build), a Lighthouse config, and dependency automation; install and wire Husky and lint-staged or remove the
  claim. Branch protection cannot be checked from the repository.

### H-07 Credentials gate does not match FR-22, and verified items show unfinished identifiers — High — **Open**

- **Files:** `src/content/index.ts:118-128`; `src/content/source/credentials.ts:78, 89, 100, 111, 122`
- **What:** FR-22 requires the **build to fail** if any credential lacks `verified: true` in production. The
  adapter instead filters such items out silently. Separately, five credentials marked `verified: true` carry
  `identifier: "TBD — CLIENT"`, which renders on the register.
- **Rules:** FR-22 (`REQUIREMENTS.md`); `CLAUDE.md` §3 (unverified values must be placeholders; the code form
  is `TODO(CLIENT): …`, the `TBD — CLIENT` form is for docs).
- **Correction:** fail the production build on any unverified credential (or change FR-22 if silent omission
  is now preferred, and record that); keep `identifier` empty until supplied, or use the documented
  "Not applicable" (`docs/CONTENT_GAPS.md` 1.3) once the founder confirms.

### H-08 Legal text states unconfirmed facts as settled — High — **Open**

- **Files:** `src/content/source/legal/privacy.ts:11, 27, 32`; `terms.ts:21, 26`; `site.ts:4`
- **What:**
  - Retention "a maximum of 24 months" is stated as fact; PRIV-04 says it is TBD — CLIENT, and the file's own
    comment says "TODO(CLIENT): confirm retention period and analytics".
  - "It uses privacy-preserving, cookieless analytics" — no analytics tool has been agreed (OPEN-08).
  - Processors: only Resend is named. Cloudflare (Turnstile), Upstash and the host are not.
  - The entity is "DeepTsight Pty Ltd" in privacy and terms but "DeepTsight Consulting Pty Ltd" in `site.ts`
    (the footer copyright and title block use the latter).
  - None of this text is adviser-approved; the "pending adviser approval" marker is in a component
    (`legal-document.tsx:43`), not in the content.
- **Rules:** `CLAUDE.md` §3 (never invent client facts; placeholder copy must be visibly marked); PRIV-02,
  PRIV-04, PRIV-07 (`REQUIREMENTS.md`); `PROJECT.md` §11 (legal pages drafted by the client's adviser).
- **Correction:** mark the retention and analytics sentences as placeholders until decided; list every
  processor; use one entity name from `site.legalName`; move the approval status into the legal content.

### H-09 The domain is hardcoded instead of coming from configuration — High — **Fixed**

- **Files:** 41 occurrences of `deeptsight.com.au` in `src/`, including `src/content/source/seo.ts` (every
  canonical), `src/content/source/services.ts` (every `seo.canonical`), `src/content/index.ts:156`,
  `src/lib/jsonld.ts:24, 54, 85, 109, 111, 133, 135`, `src/app/sitemap.ts:8`, `src/app/robots.ts:6`,
  `src/app/(site)/services/[slug]/page.tsx:65-67`, `src/app/opengraph-image.tsx:66`,
  `src/app/.well-known/security.txt/route.ts:12-13`, `src/components/layout/footer.tsx:31`,
  `src/app/not-found.tsx:49`. The email `enquiries@deeptsight.com` appears in 9 places in `src/`.
- **Rules:** `ARCHITECTURE.md` §8 (`metadataBase` from `NEXT_PUBLIC_SITE_URL`; canonical derived per route) and §9.
- **Why high:** the domain is undecided (`docs/CONTENT_GAPS.md` 1.1). If it becomes `.com`, every canonical,
  sitemap entry and JSON-LD URL points at the wrong host. A CMS import would copy these absolute URLs into every
  record.
- **Correction:** one `siteUrl` from `env.ts`; store paths in content; build absolute URLs in one helper; read
  the email from `site.email`.

### M-02 Environment validation never fails, and is bypassed — Medium — **Fixed**

- **Files:** `src/lib/env.ts:3-17, 19-57`; `src/app/layout.tsx:5, 40`; `src/components/forms/enquiry-form.tsx:54-55`;
  `src/content/index.ts:68`; `src/app/robots.ts:4-5`
- **What:** every variable is optional or defaulted, so nothing ever fails; the `throw` branches are
  unreachable in practice. Several modules read `process.env` directly instead of `env`.
  `NEXT_PUBLIC_ANALYTICS_DOMAIN` defaults to `deeptsight.com.au` in `env.ts` (though `layout.tsx` reads the raw
  variable, so the default is not what loads Plausible).
- **Rules:** SEC-10 (`REQUIREMENTS.md`); `ARCHITECTURE.md` §9 ("A missing required variable fails the build");
  `CLAUDE.md` §6 (secrets validated in `src/lib/env.ts`).
- **Correction:** define which variables are required in production and fail on them; import `env` everywhere.

### M-03 Copy, ids and brand strings are hardcoded in components — Medium — **Partly fixed**

- **Files:** listed in full in `docs/PROJECT_CONTEXT_FOR_CMS.md` §7.3. Examples: root layout title template and
  default description (`src/app/layout.tsx:7-33`); figure ids chosen in pages (`services/page.tsx:87`,
  `credentials/page.tsx:48`, `contact/page.tsx:101`); "Practice particulars", "Contact particulars", "Location
  and sectors"; the nine service part labels; footer labels and location; `Wordmark` brand text; person name
  and job title in `jsonld.ts:80-81`; OG image tagline.
- **Rules:** `CLAUDE.md` §7 and `ARCHITECTURE.md` §4.1–4.2 (all content through `@/content`; Phase 2 changes one
  file); SEO-01 (`REQUIREMENTS.md`: title and description defined in content data, not hardcoded in
  components); `ARCHITECTURE.md` §8 ("No title or description literal appears in a component").
- **Correction:** move editable copy into `pages.ts` or `site.ts`; derive brand, email and URL from `site`;
  choose figures in content. Decide which UI strings stay code-owned and record it.

### M-04 Duplicate sources of truth — Medium — **Fixed**

| Duplicate                                                                                   | Files                                                   |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Trust strip entries copy credential records under different ids (`cred-peng` vs `reg-peng`) | `home.ts:31-63`, `credentials.ts`                       |
| Home `coreCapabilities` repeat service slug, title and outcome                              | `home.ts:77-106`, `services.ts`                         |
| Service SEO in two places with different titles; the `seo.ts` service entries are unused    | `seo.ts:38-61`, `services.ts` `seo`                     |
| Primary CTA label stored three times                                                        | `site.ts:23`, `home.ts:14, 225`                         |
| `about.portrait` duplicates the `img-portrait-founder` media record                         | `about.ts:40-44`, `media.ts:21-32`                      |
| Entity name differs between site settings and legal text                                    | `site.ts:4`, `legal/privacy.ts:11`, `legal/terms.ts:21` |

- **Rules:** `ARCHITECTURE.md` §4 (one content model; schema first); `TASKS.md` decisions log 2026-09-29 already
  chose "one source for the primary CTA label", which the hero and Home final CTA do not follow.
- **Correction:** reference rather than copy; delete the unused entries.

### M-05 Sitemap `lastModified` is always the build time — Medium — **Open**

- **File:** `src/app/sitemap.ts:13-66` (`new Date()` on every entry)
- **Rule:** SEO-06 (`REQUIREMENTS.md`: "accurate `lastModified`"); `ARCHITECTURE.md` §8 ("`lastModified` from
  content metadata"). `TASKS.md` Phase 6 marks it done.
- **Correction:** add `updatedAt` to content and use it.

### M-07 Import-layer and client-boundary departures — Medium — **Open**

- **Files:** `src/components/sections/capability-rail.tsx:9-10`, `delivery-approach.tsx:6-7`,
  `selected-proof.tsx:6`, `perth-context.tsx:8` and `hero.tsx:6` import from `components/content/`; `src/components/layout/header.tsx:1` is `"use client"` as a whole.
- **Rules:** `ARCHITECTURE.md` §5 (sections may import primitives and layout; "Imports flow downward only");
  `ARCHITECTURE.md` §1.3 and `CLAUDE.md` §7 (`"use client"` as low in the tree as possible).
- **Correction:** move the shared visual pieces (`RailWiring`, `DotNumeral`, `DotRamp`, `ProcessSequence`,
  `ProjectNote`, `DotGlobe`, `AsciiHeroPowerPlant`) to a layer sections may import, or update the layer table;
  keep `Header` a server component and make only the active-link part client-side.

### M-09 `DESIGN.md` is missing from the repository — Medium — **Open**

- **Evidence:** not in the working tree or git history; `TASKS.md` decisions log 2026-09-30 records it.
  `CLAUDE.md` §1, §4, §5, §8 and `PROJECT.md` §9 depend on it.
- **Rule:** `CLAUDE.md` §1 (read order) and §4 (design rules "come from `DESIGN.md`").
- **Correction:** restore it (the sibling copy is the latest known version) and bring it up to date with the
  decisions of 2026-09-30 and 2026-10-01 (see M-08).

### M-10 Media rights rule (CR-04) is not enforced — Medium — **Open**

- **Evidence:** no script compares files in `public/` with `source/media.ts`. Files with no rights record:
  `public/badges/*.png` (8 issuer badges), `public/images/illu/plant-illu.png`,
  `public/main-images/ChatGPT Image Oct 1, 2026, 02_44_23 PM.png`, `public/dither/globe-perth.svg`. A mistyped
  figure id renders nothing and does not fail (`figure.tsx:49`).
- **Rule:** CR-04 (`REQUIREMENTS.md`: "Images without a rights record fail the build"). `TASKS.md` Phase 3 marks
  it done.
- **Correction:** add a check to `check:content` that every image under `public/` (except fonts) has a record,
  and that every referenced figure id exists.

### M-16 Handover documents describe behaviour the code does not have — Medium — **Partly fixed**

| Document                           | Statement                                                                               | Code                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `docs/DATA_FLOW_PRIVACY.md` §2, §4 | "The server verifies the Turnstile token"; Upstash stores "IP address hashes"           | Verification is skipped without a token (C-03); the raw IP is the key (`rate-limit.ts:58`)              |
| `docs/LICENCES_SERVICES.md` §3     | Fonts "self-hosted via `@fontsource`"                                                   | Downloaded WOFF2 with `next/font/local`                                                                 |
| `docs/CONTENT_EDITING_GUIDE.md` §1 | `credentials.ts` holds "client past performance"; Home has "trust strip metrics"        | Credentials register; credentials in the trust strip                                                    |
| `AGENTS.md`                        | Says `CLAUDE.md` imports it; icons `steel-700`                                          | `CLAUDE.md` does not import it; `CLAUDE.md` §4 says `ink-700`/`ink-900` and adds token and motion rules |
| `ARCHITECTURE.md` §2–§4            | MDX legal pages, `ui/`, `lib/seo.ts`, `lib/email.ts`, `actions/` path, adapter contract | TS legal objects, none of those files, `app/actions/`, three extra getters                              |

- **Rules:** PRIV-03 (`REQUIREMENTS.md`: data flow mapped and documented); `ARCHITECTURE.md` itself is a rule
  source, so code and document must agree. `CLAUDE.md` §1 makes these documents the agents' working memory.
- **Correction:** update the documents to match the code (or the code to match them) before CMS design starts.

### L-12 Structured data includes an unverified claim and hardcoded person data — Low — **Fixed**

- **File:** `src/lib/jsonld.ts:69` (`priceRange: "$$$$"`), `:80-81` (name, job title), `:76-90` (no
  placeholder guard on `personLd`).
- **Rules:** `CLAUDE.md` §3 (never invent client facts); `ARCHITECTURE.md` §8 (builders return `null` when
  approved data is missing); SEO-04 (only accurate structured data).
- **Correction:** remove `priceRange` unless the client supplies it; read the person's name and title from
  content.

### L-13 Unexplained files at the repository root and in `public/` — Low — **Open**

- `crm-lead-import-template.xlsx` (not opened). CRM integration is out of scope (FR-40 "Won't"), and nothing
  documents the file. `public/main-images/ChatGPT Image Oct 1, 2026, 02_44_23 PM.png` is publicly served, not
  in the media register and not referenced.
- **Rules:** CR-04 for the image; `CLAUDE.md` §6 for anything that could hold third-party data (unverified).
- **Correction:** confirm purpose; remove or document.

---

## 3. Design and UX violations

Design source: `../deeptsight-website/DESIGN.md` (see "How this audit was done").

### H-04 The Perth globe: auto-rotation without a pause, JS motion, a forbidden motif — High — **Open**

- **File:** `src/components/content/dot-globe.tsx` (client component; constants `:27-30`; animation loop
  `:84, 216-219`; label `:271`); data in `globe-data.generated.ts` (10,450 lines, 225 KB of source).
- **Findings:**
  1. **Accessibility:** for visitors without reduced-motion set, the globe rotates continuously with no pause
     control. WCAG 2.2.2 Pause, Stop, Hide (Level A) requires one for automatic movement lasting more than five
     seconds. The label tells users to "Drag horizontally to rotate"; there is no keyboard equivalent.
     Rules: `CLAUDE.md` §5 and A11Y-01 (`REQUIREMENTS.md`, WCAG 2.2 AA, which includes Level A).
  2. **Motion rule:** `CLAUDE.md` §4 limits motion to the effects in `DESIGN.md` §7 ("CSS scroll timelines, no
     library"); `DESIGN.md` §7 says "no JavaScript scroll listeners" and lists no rotating or draggable effect.
     A `requestAnimationFrame` canvas loop is outside the list.
  3. **Motif:** `DESIGN.md` §0.2 #6 lists "globes" among forbidden cyber clichés; #5 forbids decorative dot
     patterns.
  4. **Raw hex:** `#0E50ED`, `#4F7EFF`, `#A4BEFF`, `#C9CECB` in the component. `CLAUDE.md` §4: "Never a raw hex in
     a component." ESLint does not catch it because the values are not in `className` or `style`.
  5. **Performance:** the point data ships in the Home client bundle. PERF-07 (≤100 kB compressed JS per
     route) was not measured in this audit, but this is the likeliest component to break it **(not measured)**.
- **Context:** `TASKS.md` decisions log 2026-10-01 records that the owner asked for the globe. That is an owner
  decision, but it conflicts with three binding documents, so either the documents or the component must change.
- **Correction:** at minimum add a visible pause control and a keyboard alternative, read colours from
  `colorTokens`, and measure the bundle. Then either update `DESIGN.md` §0.2/§7 to allow it (owner decision) or
  replace it with the static `public/dither/globe-perth.svg` that already exists.

### M-08 Departures from `DESIGN.md` elsewhere — Medium — **Open**

| #   | File                                                                                          | Departure                                                                                                             | Rule                                                                                                          |
| --- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| a   | `src/styles/globals.css:22`                                                                   | `--color-ground: #f2f2f2`; `DESIGN.md` §3.1 specifies `#ECEEEC`                                                       | `DESIGN.md` intro ("If an implementation disagrees … the implementation is wrong"), §3.1, §3.5 contrast table |
| b   | `src/components/sections/capability-rail.tsx:56`; `src/components/primitives/rail-tag.tsx:27` | Strings joined with " · "                                                                                             | `DESIGN.md` §0.2 #11                                                                                          |
| c   | `src/components/content/ascii-hero-power-plant.tsx:41-46, 54-63`                              | SVG `linearGradient` fade mask; raw hex fills                                                                         | `DESIGN.md` §0.2 #3; `CLAUDE.md` §4 (no gradients, no raw hex)                                                |
| d   | `hero.tsx:61`, `final-cta.tsx:86`, `perth-context.tsx:34`, `rail-tag.tsx:26`                  | Mono used for section labels ("Practice particulars", "Contact particulars", rail tags), which are not data           | `DESIGN.md` §0.2 #13; `CLAUDE.md` §4 ("Mono is used sparingly, for data")                                     |
| e   | Hero dot-matrix plant, `DotRamp`, `DotNumeral`, dot globe                                     | Decorative dot patterns as a recurring device                                                                         | `DESIGN.md` §0.2 #5; §0.1 ("use them consistently and do not invent new ones")                                |
| f   | `DESIGN.md` §8 component table                                                                | Lists `ConvergenceSchematic` (unused) and omits `RailTag`, `DotGlobe`, `DotNumeral`, `DotRamp`, `AsciiHeroPowerPlant` | `DESIGN.md` §8                                                                                                |
| g   | `src/components/content/ascii-hero-plate.tsx:59-62` (dead code)                               | `animate-pulse`, `rounded-full`, uppercase tracked mono                                                               | `DESIGN.md` §0.2 #2, #8, #18; would apply if revived                                                          |

- **Context:** items (d) and (e) come from the Home redesign of 2026-09-30 and 2026-10-01 recorded in the
  `TASKS.md` decisions log (owner-chosen). They still conflict with `DESIGN.md` as written.
- **Correction:** for each, either change the code or have the owner amend `DESIGN.md`; do not leave them
  disagreeing.

### M-12 Mobile navigation needs JavaScript — Medium — **Fixed**

- **Files:** `src/components/layout/header.tsx:41` (desktop nav `hidden lg:block`);
  `src/components/layout/mobile-nav.tsx:81-143` (menu rendered only after a client click)
- **What:** below 1024px with JavaScript disabled, the primary nav is unreachable; only the header CTA and the
  footer links remain.
- **Rule:** `REQUIREMENTS.md` §8 ("No JavaScript: … all navigation usable").
- **Correction:** render the menu as a `<details>`-based or `:target`-based disclosure that works without JS,
  then enhance it.

### L-08 Footer has three link columns, not four — Low — **Open**

- **File:** `src/components/layout/footer.tsx:45-113` (Services, Company, "Contact and legal")
- **Rule:** FR-05 (four columns: services, company, contact, legal/LinkedIn).
- **Correction:** split contact and legal, or amend FR-05.

### L-09 Fallback canonical and title on pages without metadata — Low — **Partly fixed**

- **Files:** `src/app/layout.tsx:15-17` sets `alternates.canonical` to the site root; `/insights` and the 404
  have no metadata of their own, so they inherit the home canonical and the default title.
- **Rules:** SEO-03 (canonical on every page, which implies the correct one); A11Y-10 (unique `<title>`).
- **Correction:** remove the root canonical; give the 404 its own title.

### L-17 Mobile menu does not make the page behind it inert — Low — **Open**

- **File:** `src/components/layout/mobile-nav.tsx:96-102`. `aria-modal="true"` without `inert` on the rest of
  the page; some screen readers can still reach background content. The focus trap covers keyboard users.
- **Rule:** FR-04 (traps focus); `CLAUDE.md` §5. Low.

---

## 4. Technology violations

### M-18 Installed stack departs from `TECH_STACK.md` — Medium — **Open**

| Item                                                             | `TECH_STACK.md`                                     | Repository                                                                                | Impact                                                                                |
| ---------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `zod`                                                            | 4.x (§3)                                            | 3.25.76; code uses Zod 3 API (`errorMap` in `enquiry-schema.ts:22`, `z.string().email()`) | A CMS built against Zod 4 docs will not match. Decide which version before modelling. |
| `lucide-react`                                                   | 0.5xx.x (§2.2)                                      | 1.49.0                                                                                    | Major-version difference; fine in use, record it                                      |
| `react`, `react-dom`                                             | 19.2.x (§1)                                         | 19.3.0                                                                                    | Record it                                                                             |
| `@tailwindcss/typography`                                        | 0.5.x (§2)                                          | not installed                                                                             | No prose styling for future rich text                                                 |
| Radix (`dialog`, `accordion`, `tabs`)                            | pinned (§2.1)                                       | not installed                                                                             | `TASKS.md` Phase 2 item open; consistent                                              |
| MDX, `gray-matter`, `reading-time`, `rehype-*`                   | §3                                                  | not installed                                                                             | Insights and MDX legal pages not built                                                |
| `husky`, `lint-staged`, `lighthouse-ci`, `@next/bundle-analyzer` | §6                                                  | not installed                                                                             | See H-05                                                                              |
| `proxy.ts`                                                       | §1 ("Middleware is `proxy.ts`")                     | absent                                                                                    | Needed for a nonce CSP (C-01)                                                         |
| Lockfile                                                         | pnpm (§1)                                           | `pnpm-lock.yaml` **and** `package-lock.json`                                              | Two lockfiles can diverge (SEC-11 "pinned via lockfile")                              |
| `lint` script                                                    | `next lint` (§6)                                    | `eslint .`                                                                                | The code is right (`next lint` was removed in Next 16); the document is stale         |
| `check:content` script                                           | two scripts (§6)                                    | four scripts incl. token generation                                                       | Document stale                                                                        |
| `analyze` script                                                 | `ANALYZE=true next build`                           | same                                                                                      | POSIX env syntax fails on Windows shells; analyzer not installed                      |
| Version record                                                   | §8: record installed versions in `TASKS.md` Phase 1 | Phase 1 item ticked; `TECH_STACK.md` still shows planned versions                         | Record actual versions                                                                |

- **Rules:** `TECH_STACK.md` header ("Nothing outside this document may be added without approval") and §8;
  `CLAUDE.md` §7 (no new dependency without checking §6).
- **Correction:** update `TECH_STACK.md` to the installed versions with a decisions-log entry, or align the
  packages; delete `package-lock.json`.

### L-05 ESLint design rules are narrower than documented — Low — **Open**

- **File:** `eslint.config.mjs:35-81`
- **What:** the radius rule bans only `rounded-sm|md|lg|xl|2xl|3xl`, not `rounded`, `rounded-full` or
  `rounded-none`; there is no rule for `outline-none` without a `focus-visible` replacement; all rules match only
  string literals, so a template literal in `className` bypasses them; `eslint-plugin-jsx-a11y` is installed but
  its recommended set is not enabled beyond what `eslint-config-next` includes.
- **Rule:** `ARCHITECTURE.md` §7 (bans "`rounded-` utilities other than `rounded-control` and `rounded-panel`,
  and the string `outline-none` without an adjacent `focus-visible:` rule"); `TECH_STACK.md` §6.
- **Note:** `rounded-full` is used legitimately on radio controls (`radio.tsx:34, 43`), which `DESIGN.md` §0.2 #2
  allows; the rule needs an exception, not silence.
- **Correction:** widen the selectors and enable `jsx-a11y` recommended.

### L-10 Formatting is not enforced — Low — **Open**

- `prettier --write` exists as `pnpm format` but no check runs in lint or CI. Lines in
  `process-sequence.tsx:38` and `delivery-approach.tsx:30` exceed the configured width.
- **Rule:** `TECH_STACK.md` §6 (Prettier). Add `prettier --check` to CI.

---

## 5. Requirements compliance

Status: **Met**, **Partial**, **Not met**, **Not verified** (needs a running site, infrastructure or a manual
check that was not done here), **Deferred** (priority W or C, or explicitly out of launch scope).

### 5.1 Functional

| ID                         | Status   | Evidence                                                                                               |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| FR-01                      | Met      | `force-static` on every page; no client fetching                                                       |
| FR-02                      | Met      | `header.tsx`                                                                                           |
| FR-03                      | Met      | `aria-current="page"` plus underline (`link.tsx:21`)                                                   |
| FR-04                      | Partial  | Trap, Escape, route-change close and focus return present and now tested; no `inert` (L-17)            |
| FR-05                      | Partial  | Three columns (L-08); ABN and copyright present                                                        |
| FR-06                      | Met      | `layout.tsx:58-63`                                                                                     |
| FR-07                      | Met      | Service and legal pages                                                                                |
| FR-08                      | Met      | `not-found.tsx`                                                                                        |
| FR-09                      | Met      | None found                                                                                             |
| FR-11                      | Met      | `(site)/page.tsx`                                                                                      |
| FR-12                      | Met      | `hero.tsx:50-55`                                                                                       |
| FR-13                      | Met      | Production filter in adapter                                                                           |
| FR-14                      | Met      | `capability-rail.tsx`                                                                                  |
| FR-15                      | Met      | `selected-proof.tsx:16`                                                                                |
| FR-16                      | Met      | `services/page.tsx`                                                                                    |
| FR-17                      | Met      | `service-template.tsx`                                                                                 |
| FR-18                      | Met      | Related services + CTA                                                                                 |
| FR-19                      | Partial  | The Home rail now follows the service list; the lamp animation still caps at four stages (L-07)        |
| FR-20                      | Met      | Publications removed on founder instruction (`TASKS.md` 2026-09-30)                                    |
| FR-21                      | Partial  | No status field; year-only expiry; build-time only (M-11)                                              |
| FR-22                      | Not met  | Silent filter instead of build failure (H-07)                                                          |
| FR-23                      | Deferred | No publications                                                                                        |
| FR-25                      | Not met  | No article list (M-06); gated off                                                                      |
| FR-26                      | Not met  | No article route or MDX (M-06)                                                                         |
| FR-27                      | Met      | Flag removes nav item; route 404s                                                                      |
| FR-29                      | Not met  | No RSS (S priority)                                                                                    |
| FR-30                      | Met      | Fields match                                                                                           |
| FR-31                      | Partial  | Works without JS in development and preview. On the live site the CAPTCHA now requires JS (C-03, Q-11) |
| FR-32                      | Met      | Shared schema                                                                                          |
| FR-33                      | Met      | Fixed (H-03); tested                                                                                   |
| FR-34                      | Met      | Redirect                                                                                               |
| FR-35                      | Met      | Fixed (C-03)                                                                                           |
| FR-36                      | Met      | Fixed (M-01); tested. Relies on the host setting the client-IP header                                  |
| FR-37                      | Met      | Fixed (C-02)                                                                                           |
| FR-38                      | Met      | No persistence                                                                                         |
| FR-39                      | Met      | `enquiry-form.tsx:345-351`                                                                             |
| FR-10, FR-24, FR-28, FR-40 | Deferred | W/C priority                                                                                           |

### 5.2 Content

| ID    | Status  | Evidence                                                                                         |
| ----- | ------- | ------------------------------------------------------------------------------------------------ |
| CR-01 | Partial | Zod at build via adapter and `verify-content.ts`; cross-references unchecked (§8 of context doc) |
| CR-02 | Partial | Gate exists but scans source, not content (H-02)                                                 |
| CR-03 | Met     | Optional sections omitted only where allowed                                                     |
| CR-04 | Not met | No enforcement; unregistered files (M-10)                                                        |
| CR-05 | Partial | Sources moved out of the working tree; still in git history (C-04)                               |

### 5.3 Accessibility

| ID           | Status       | Evidence                                                                                                          |
| ------------ | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| A11Y-01      | Not verified | `test:a11y` not run here; `TASKS.md` reports 28/28 passing on 2026-09-30, before the globe and later Home changes |
| A11Y-02, -03 | Met (tokens) | `check-contrast.ts` 40/40; per-component colour use not audited                                                   |
| A11Y-04, -05 | Not verified | Requires browser                                                                                                  |
| A11Y-06      | Partial      | Globe drag has no keyboard path (H-04)                                                                            |
| A11Y-07      | Not verified | Focus ring tokens exist; not observed                                                                             |
| A11Y-08      | Met          | Fixed (H-03); tested                                                                                              |
| A11Y-09      | Met (code)   | `min-h-target` on links, buttons, nav                                                                             |
| A11Y-10      | Partial      | 404 and `/insights` lack unique titles (L-09)                                                                     |
| A11Y-11      | Met (code)   | "View service" links named by their heading; "Verify" has sr-only extension                                       |
| A11Y-12      | Met          | Labels, required text, autocomplete                                                                               |
| A11Y-13      | Met          | Error text explains the fix                                                                                       |
| A11Y-14      | Met (code)   | Icons plus words                                                                                                  |
| A11Y-15      | Met (code)   | Alt text in media register; badges decorative                                                                     |
| A11Y-16      | Partial      | CSS motion honours reduced motion; globe honours it but has no pause for others (H-04)                            |
| A11Y-17      | Met          | `lang="en-AU"`                                                                                                    |
| A11Y-18      | Met (code)   | One banner, main, contentinfo; navs labelled                                                                      |
| A11Y-19      | Met          | Header CTA on every page                                                                                          |
| A11Y-20      | Not met      | Manual passes open in `TASKS.md` Phase 7                                                                          |
| A11Y-21      | Partial      | Statement published; contains placeholders                                                                        |

### 5.4 SEO

| ID             | Status       | Evidence                                                                            |
| -------------- | ------------ | ----------------------------------------------------------------------------------- |
| SEO-01         | Partial      | Pages use content; root layout hardcodes defaults (M-03)                            |
| SEO-02         | Met          |                                                                                     |
| SEO-03         | Partial      | Canonicals from `NEXT_PUBLIC_SITE_URL` (H-09 fixed); 404 has no own metadata (L-09) |
| SEO-04         | Partial      | Builders present and guarded; no Article (Insights not built)                       |
| SEO-05         | Met          | 1200×630 generated card                                                             |
| SEO-06         | Not met      | Build-time `lastModified` (M-05)                                                    |
| SEO-07         | Met          | Fixed (H-01)                                                                        |
| SEO-08, SEO-09 | Not verified | Copy review, not code                                                               |
| SEO-10         | Not verified | Depends on OPEN-14                                                                  |
| SEO-11         | Met (code)   | Tables have captions and `th scope`                                                 |

### 5.5 Performance

| ID             | Status       | Evidence                                                                                                    |
| -------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| PERF-01 to -08 | Not verified | Lighthouse not run; no config (H-05); globe bundle risk (H-04)                                              |
| PERF-09        | Met          | 5 files loaded, self-hosted, `swap`                                                                         |
| PERF-10        | Met          | AVIF/WebP, aspect ratios, `preload` (M-13 fixed)                                                            |
| PERF-11        | Partial      | Contact page loads Turnstile and, when enabled, Plausible: two third parties against a budget of one (L-15) |
| PERF-13        | Met          | `adjustFontFallback`                                                                                        |
| PERF-14        | Not met      | No CI (H-05)                                                                                                |

### 5.6 Security, privacy, operations, analytics

| ID                  | Status               | Evidence                                                                                            |
| ------------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| SEC-01 to -05       | Not verified         | Hosting and DNS not set up                                                                          |
| SEC-06              | Partial              | Headers present; `unsafe-eval` removed in production; `unsafe-inline` kept by owner decision (C-01) |
| SEC-07              | Met                  | JSON-LD escaped (H-06 fixed)                                                                        |
| SEC-08              | Met                  | Fixed (C-03)                                                                                        |
| SEC-09              | Met (default)        | Next.js Server Action origin check; no arbitrary object input                                       |
| SEC-10              | Met                  | Fixed (C-02, M-02)                                                                                  |
| SEC-11              | Partial              | Lockfiles present (two); no Dependabot/Renovate; `pnpm audit` not run                               |
| SEC-12              | Met                  | `security.txt` route; its `Policy` points at the privacy notice rather than a disclosure policy     |
| SEC-13              | Met (config)         | `poweredByHeader: false`, no browser source maps                                                    |
| SEC-14              | Met                  | `error.tsx` shows no details                                                                        |
| SEC-15 to -20       | Not verified         | Process and accounts                                                                                |
| PRIV-01             | Met                  |                                                                                                     |
| PRIV-02             | Partial              | Notice incomplete (H-08)                                                                            |
| PRIV-03             | Partial              | `DATA_FLOW_PRIVACY.md` corrected; does not yet cover hosting (undecided)                            |
| PRIV-04             | Not met              | Retention stated as fact while undecided (H-08)                                                     |
| PRIV-05             | Not verified         | Analytics not chosen                                                                                |
| PRIV-07             | Partial              | Processors missing from notice (H-08)                                                               |
| PRIV-08             | Met (code)           | Logs carry error names only                                                                         |
| OPS-01 to -05       | Partial/Not verified | No backup or rollback section; no named owner (`docs/MAINTENANCE_PLAN.md`)                          |
| AN-01               | Partial              | `enquiry_failed` never fired; `enquiry_succeeded` fires on any visit to the thank-you URL (M-17)    |
| AN-02               | Met                  | Field names only                                                                                    |
| AN-03, AN-04, AN-05 | Not met              | Events defined (`analytics.ts:10-19`) but never sent (M-17)                                         |
| AN-06, AN-07, AN-08 | Not verified / open  | OPEN-08                                                                                             |

### M-06 Insights not implemented — Medium — **Open**

- **Evidence:** `getArticles()` returns `[]`; `getArticle()` returns `null`; no `/insights/[slug]` route, no
  `/insights/rss.xml`, no article list UI, no MDX pipeline, no metadata on `/insights`.
- **Rules:** FR-25, FR-26 (M), FR-29 (S) in `REQUIREMENTS.md`; `ARCHITECTURE.md` §3. `TASKS.md` Phase 4 marks
  them done. The feature is switched off (FR-27) and its launch scope is open (Q-01), so this is Medium, not
  High. It becomes part of the CMS work.

### M-14 Test coverage is smaller than `TASKS.md` reports — Medium — **Mostly fixed**

- **Evidence:** `tests/e2e/enquiry-form.spec.ts` has three tests (attributes, empty submit, happy path);
  `qa-suite.spec.ts` has four. There is no no-JS submission test, no rate-limit test, no mobile-menu focus-trap
  test and no keyboard-navigation test. Playwright runs against `pnpm dev` (`playwright.config.ts:24-31`), not a
  production build, so production-only filtering and the CSP are never exercised.
- **Rules:** `ARCHITECTURE.md` §10 (E2E: "happy path, validation errors, no-JS submission, rate limit, keyboard
  navigation, mobile menu focus trap"). `TASKS.md` Phase 5 marks these done.
- **Correction:** add the missing tests; run the suites against `next start` with `NEXT_PUBLIC_ENV=production`
  in CI.

### M-17 Analytics events are defined but not sent — Medium — **Open**

- **Files:** `src/lib/analytics.ts:10-19`; only `enquiry_started`, `enquiry_submitted`,
  `form_validation_error` (`enquiry-form.tsx`) and `enquiry_succeeded` (`thank-you/page.tsx:28`) are sent.
  The Plausible script is a raw `<script>` with no SRI (`layout.tsx:48-54`).
- **Rules:** AN-01, AN-03, AN-04, AN-05 (`REQUIREMENTS.md`). `TASKS.md` Phase 6 marks "events AN-01 to AN-07
  firing" done.
- **Note:** the analytics tool is still undecided (OPEN-08), so implementation can wait for that decision, but
  the task should be re-opened.

### L-07 A fifth service is not quite data-only — Low — **Partly fixed**

- `process-sequence.tsx:71-76` caps lamp keyframes at four stages; the Home capability rail uses a separate
  list and a four-column grid. FR-19 (`REQUIREMENTS.md`).

### L-15 Third-party request budget on Contact — Low — **Open**

- `/contact` loads Turnstile and, when analytics is enabled, Plausible. PERF-11 allows one third-party request
  (analytics). Turnstile is an approved service in `TECH_STACK.md` §5, so this is a conflict between two
  documents more than a code fault; record a decision.

---

## 6. Other low-priority items

- **L-02** Nine pages repeat the same `generateMetadata` body; `ARCHITECTURE.md` §2 lists a `lib/seo.ts`
  metadata builder that does not exist. Duplication only.
- **L-03** No favicon or app icon (`ARCHITECTURE.md` §2 lists `icon.svg`, `apple-icon.png`) and no
  `global-error.tsx` (also listed). Root-level errors fall back to the framework default page.
- **L-04** `/design-system` is reachable in production, protected only by `noindex` and `robots.txt`.
  `TASKS.md` Phase 2: "deleted or gated before launch".
- **L-14** Known content inconsistencies, recorded in `docs/CONTENT_GAPS.md` 2.1–2.4: the About narrative and
  the career timeline name the mining and power employers differently, and "Cochin" with a facility type points
  to one facility (`CLAUDE.md` §6). Awaiting the founder.
- **L-16** `security.txt` `Expires` is computed at build time (one year ahead), which is fine for regular builds
  but will lapse if the site is not rebuilt within a year.

---

## 7. `TASKS.md` items ticked that the code does not support

After the fixes, the Phase 5 E2E item and the Phase 7 "no client detail in the repository" item are supported
by the working tree (git history excepted); the Phase 1 CSP item is supported only with the recorded
`'unsafe-inline'` exception. The rest of the table still applies.

These are not new defects; they are places where the checklist says "done" and the code says otherwise. They
should be re-opened so that planning does not rely on them (`CLAUDE.md` §9: "Do not mark a checklist item
complete because the code exists").

| `TASKS.md` item                                                                                   | Finding    |
| ------------------------------------------------------------------------------------------------- | ---------- |
| Phase 1: "Security headers and nonce-based CSP"                                                   | C-01       |
| Phase 1: "CI: typecheck, lint, build, a11y, on every PR; `main` branch protected"                 | H-05       |
| Phase 1: "Prettier + `prettier-plugin-tailwindcss`; Husky + lint-staged pre-commit"               | H-05       |
| Phase 1: ESLint rule for `outline-none` and non-token radii                                       | L-05       |
| Phase 1: "Record actual installed versions of everything in `TECH_STACK.md`"                      | M-18       |
| Phase 3: "`media.ts` — build fails on an image without a record [CR-04]"                          | M-10       |
| Phase 3: "`credentials.ts` — `verified` flag … [FR-21, FR-22]"                                    | H-07, M-11 |
| Phase 4: "`/insights` + `/insights/[slug]` … MDX articles [FR-25, FR-26]"                         | M-06       |
| Phase 5: "E2E: happy path, each validation failure, no-JS submission, rate-limit response"        | M-14       |
| Phase 6: "`sitemap.ts` with accurate `lastModified`"                                              | M-05       |
| Phase 6: "Analytics installed; events AN-01 to AN-07 firing"                                      | M-17       |
| Phase 7: "Security review: headers (A+ …)"                                                        | C-01       |
| Phase 7: "Confirm no secret, client detail or operational information anywhere in the repository" | C-04       |
| Phase 9: "Data-flow and privacy documentation delivered"                                          | M-16       |
| Redesign: "`DESIGN.md` rewritten"                                                                 | M-09       |

---

## 8. Audit summary

### Critical issues

| ID   | Issue                                                                                   | Status       |
| ---- | --------------------------------------------------------------------------------------- | ------------ |
| C-05 | Every page hid its content without JavaScript (found during the fixes)                  | Fixed        |
| C-01 | CSP allows `'unsafe-inline'` and `'unsafe-eval'` scripts; no nonce                      | Partly fixed |
| C-02 | Missing `RESEND_API_KEY` silently discards every enquiry                                | Fixed        |
| C-03 | Turnstile and timing checks skipped when their fields are absent; test keys as defaults | Fixed        |
| C-04 | A third-party facility name and founder personal data committed in `docs/sources/`      | Partly fixed |

### High priority issues

| ID   | Issue                                                                                     | Status |
| ---- | ----------------------------------------------------------------------------------------- | ------ |
| H-01 | Preview deployments indexable (`robots.ts` trusts `NODE_ENV`; no `noindex`)               | Fixed  |
| H-02 | Placeholder gate scans source code: production build can never pass; blind to CMS content | Open   |
| H-03 | Error summary steals focus on field blur                                                  | Fixed  |
| H-04 | Globe: no pause (WCAG 2.2.2), JS motion, forbidden motif, raw hex, bundle risk            | Open   |
| H-05 | No CI, hooks, dependency automation or performance gate                                   | Open   |
| H-06 | JSON-LD injected via `dangerouslySetInnerHTML` without escaping                           | Fixed  |
| H-07 | FR-22 not implemented; verified credentials show "TBD — CLIENT" identifiers               | Open   |
| H-08 | Legal text states undecided facts; processors missing; entity name mismatch               | Open   |
| H-09 | Domain and email hardcoded in 41 and 9 places instead of configuration                    | Fixed  |

### Medium priority issues

Fixed: M-01 rate limiting; M-02 environment validation; M-04 duplicate sources of truth; M-12 mobile nav
without JS; M-13 deprecated `priority`. Mostly or partly fixed: M-03 hardcoded copy; M-14 test coverage; M-16
inaccurate documents. Open: M-05 sitemap dates; M-06 Insights not implemented; M-07 layer and client-boundary
departures; M-08 design departures; M-09 `DESIGN.md` missing; M-10 CR-04 not enforced; M-11 credential status
and expiry; M-15 unapproved media in production; M-17 analytics events; M-18 stack departures.

### Low priority issues

Fixed: L-04 `/design-system` in production; L-06 `Link` `UrlObject`; L-12 JSON-LD claims; L-18 E2E fixtures.
Partly fixed: L-01 dead code; L-03 favicon and `global-error.tsx`; L-07 fifth-service friction; L-09 canonical
and title fallbacks. Open: L-02 metadata duplication; L-05 ESLint rule gaps; L-08 footer columns; L-10
formatting not enforced; L-11 duplicate announcements; L-13 unexplained files; L-14 known content
inconsistencies; L-15 third-party budget on Contact; L-16 `security.txt` expiry; L-17 mobile menu not inert.

### Rule violations (by source document)

| Source            | Findings                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`       | C-01 (§6), C-04 (§6), H-04 (§4, §5), H-07 (§3), H-08 (§3), H-03 (§5), M-02 (§6), M-03 (§7), M-07 (§7), M-08 (§4), M-09 (§1, §4), M-13 (§3), L-12 (§3)                                                                                                                                                                                                                                                                                  |
| `REQUIREMENTS.md` | C-01 SEC-06; C-02 FR-37, SEC-10; C-03 FR-35, SEC-08; C-04 CR-05; H-01 SEO-07; H-02 CR-02; H-03 FR-33, A11Y-08; H-04 A11Y-01 (WCAG 2.2.2); H-05 SEC-11, SEC-18, PERF-14; H-06 SEC-07; H-07 FR-22; H-08 PRIV-02, -04, -07; M-01 FR-36; M-02 SEC-10; M-03 SEO-01; M-05 SEO-06; M-06 FR-25, -26, -29; M-10 CR-04; M-11 FR-21; M-12 §8; M-16 PRIV-03; M-17 AN-01, -03, -04, -05; L-07 FR-19; L-08 FR-05; L-09 SEO-03, A11Y-10; L-15 PERF-11 |
| `ARCHITECTURE.md` | C-02 §9; C-03 §6; H-01 §8; H-05 §10; H-06 §8; H-09 §8, §9; M-02 §9; M-03 §4, §8; M-04 §4; M-05 §8; M-07 §1, §5; M-14 §10; M-15 §4.2; M-16 §2–§4; L-02 §2; L-03 §2; L-05 §7                                                                                                                                                                                                                                                             |
| `TECH_STACK.md`   | C-01 §1; H-05 §6; M-13 §8; M-18 §1–§3, §6, §8; L-05 §6; L-10 §6                                                                                                                                                                                                                                                                                                                                                                        |
| `DESIGN.md`       | H-04 §0.2 #5–6, §7; M-08 §0.1, §0.2 #3, #5, #11, #13, §3.1, §8                                                                                                                                                                                                                                                                                                                                                                         |
| `PROJECT.md`      | H-08 §11; M-09 §9 (design system implementation)                                                                                                                                                                                                                                                                                                                                                                                       |

### Missing requirements

After the fixes. Not met: FR-22, FR-25, FR-26, FR-29, CR-04, A11Y-20, SEO-06, PERF-14, PRIV-04, AN-03, AN-04,
AN-05. Partial: FR-04, FR-05, FR-19, FR-21, FR-31, CR-01, CR-02, CR-05, A11Y-06, A11Y-10, A11Y-16, A11Y-21,
SEO-01, SEO-03, SEO-04, PERF-11, SEC-06, SEC-11, PRIV-02, PRIV-03, PRIV-07, AN-01. Now met: FR-33, FR-35,
FR-36, FR-37, A11Y-08, SEO-07, PERF-10, SEC-07, SEC-08, SEC-10. Unverified pending a running site or infrastructure: the performance budgets,
transport and DNS security, administration controls, and most manual accessibility checks.

### Technical debt

- Content not fully behind the adapter: hardcoded copy, figure ids and brand strings (M-03). URLs are fixed.
- Unchecked string references between records (figure ids, `relatedSlugs`). Duplicate records are fixed (M-04),
  and the trust strip and capability references are now checked by the adapter.
- A source-scanning placeholder gate that cannot work once content moves to a database (H-02).
- Build-time dates standing in for content metadata (M-05, M-11, footer revision).
- Documents that no longer describe the code (`ARCHITECTURE.md`, `TECH_STACK.md`, `AGENTS.md`, handover docs;
  M-16, M-18) and a missing `DESIGN.md` (M-09).
- Dead components, fields, fonts and media (L-01).
- No CI, so none of the gates above runs automatically (H-05).

### Recommended fix order

Steps 1–3 of the original order and most of step 5 are done (see the status section). What is left:

1. **Decisions for the owner.** Q-11 (CAPTCHA versus no-JS submissions); the globe and the other `DESIGN.md`
   departures (H-04, M-08); FR-22 and the credential identifiers (H-07); whether to rewrite git history (C-04);
   the purpose of `crm-lead-import-template.xlsx` and `public/main-images/` (L-13).
2. **CI once hosting is chosen.** Typecheck, lint, Prettier check, `check:content`, build, a11y and E2E against a
   production build, Lighthouse, dependency automation (H-05). Point `playwright.config.ts` at `next start` by
   default (M-14).
3. **Remaining accessibility.** Globe pause and keyboard path, or the static SVG (H-04); `inert` (L-17);
   duplicate alerts (L-11); 404 title (L-09).
4. **Content integrity, as part of CMS modelling.** Content-based placeholder gate (H-02); credential status and
   expiry (H-07, M-11); unapproved media filtered in production (M-15); rights check (M-10); `updatedAt` for the
   sitemap (M-05); the code-versus-content split for the remaining hardcoded copy (M-03).
5. **Legal and privacy text** with the client's adviser (H-08).
6. **Documents.** Restore and update `DESIGN.md` (M-09); bring `ARCHITECTURE.md`, `TECH_STACK.md`, `AGENTS.md`
   and `CONTENT_EDITING_GUIDE.md` up to date (M-16, M-18); re-open the `TASKS.md` items in §7.
7. **Stack.** Decide Zod 3 vs 4 before writing CMS schemas (M-18); one lockfile; widen ESLint rules (L-05).
8. **Low-priority clean-up** and the features that wait on decisions: Insights (M-06) and analytics events (M-17).
