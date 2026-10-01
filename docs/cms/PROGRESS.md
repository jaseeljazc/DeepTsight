# CMS overnight build: progress

Branch: `cms/phase-2` · Start commit: `b2092d6` (main) · Run started 2026-10-01

## Current state
- Current phase: 11 done; next Phase 12
- Last commit: see git log (cms(phase 11))
- Next step: Phase 12, backup and restore

## Blockers
- **B-1 Databases unreachable (all phases that need a database).** `.env.local` does not exist, so
  `DATABASE_URI`, `DATABASE_URI_TEST` and `DATABASE_URI_RESTORE` are not set (preflight step F not done).
  The Postgres 17 server answers on localhost:5432, but role `deeptsight_cms` needs a password.
  The Postgres tools are installed at `C:\Program Files\PostgreSQL\17\bin` but are not on PATH
  (preflight step B). Per the prompt (rule 4) this is a blocker: no database work tonight. DB-dependent
  code and tests are written but not run.

## Versions (installed, Phase 0)
next 16.3.5 (the plan names 16.3.7; `package.json` allows ^16.3.5 and the lockfile pins 16.3.5) · react / react-dom 19.3.0 ·
typescript 5.9.3 · zod 3.25.76 · node v22.16.0 · pnpm 10.28.2 · PostgreSQL client 17.4 (not on PATH)

## Test counts
| Check | Baseline | Current |
|---|---|---|
| typecheck | pass | pass |
| lint | pass | pass |
| build (static) | pass (22 static pages) | pass |
| Playwright E2E (prod build) | 24/24 | 24/24 |
| axe (prod build) | 28/28 | 28/28 |
| parity baseline vs itself | 0 differences (17 routes) | 0 |
| CMS unit tests (`pnpm test:cms-unit`) | n/a | 24/24 |
| CMS E2E (`pnpm test:cms`) | n/a | 13 written, all skipped (B-1) |

## Dev-database backups
None (no database access).

## Phase log
- **Phase 0** done. Baseline green; parity harness built; DB check blocked (B-1).
- **Phase 1** partial. Payload 3.90.2 installed (all @payloadcms/* 3.90.2, sharp 0.35.5, graphql 16.14.2
  as a required peer). Public site moved under `(public)`; `global-not-found.tsx` for unmatched URLs.
  `withPayload`, admin and REST routes (no GraphQL routes), env rules, ESLint Payload boundary,
  `.env.local` secrets generated (key names only), initial migration created offline.
  Parity 0 differences; 52/52 Playwright. **Not done (B-1):** `payload migrate` on dev and test,
  `/admin` loading in `pnpm dev` (answers 500 without a database).
- **Phase 2** partial (code complete, DB tests not run). Users (roles, lockout 5/15 min, 2 h tokens, no API
  keys, Strict cookies), in-house TOTP MFA (D-23), MFA screen at /admin/mfa (D-25), audit log, login IP limit,
  admin/API CSP + noindex + no-store, GraphQL 404 route, create-admin and reset-admin-password scripts,
  production fail-closed gate (D-29). Migration `admin_security` created offline. Unit tests 11/11.
  `tests/cms/admin-security.spec.ts` (9 tests) written; skipped (B-1). Parity 0; Playwright 52/52.
- **Phase 3** done. Site (navLabels → derived nav, uiLabels, locationLabel, socialLinks, mapsUrl,
  office address/hours + show flags), services (enabled, sortOrder, related pruning), page figure ids,
  legal status, Lexical article body, updatedAt, enquiry types {value,label,enabled,sortOrder} with
  buildEnquirySchema, D-08 strings moved, integrity checks, verify-content calls every getter.
  Parity 0; Playwright 52/52; unit 16/16.
- **Phase 4** partial (code complete, smoke not run). Collections: services, proof-items, credentials,
  credential-groups, media, legal-pages, enquiry-types; globals: site-settings, home, about, pages, seo.
  Drafts (25 versions), publish guard (mappers + Zod), approver-only flags with audit, slug lock (D-09),
  revalidation hooks, admin groups and descriptions. Mappers in src/content/mappers. Types generated
  (src/cms/payload-types.ts); migration `collections` created offline. scripts/cms/smoke.ts written, not run (B-1).
  Parity 0; unit 16/16.
- **Phase 5** partial. scripts/cms/import-from-source.ts (idempotent upsert by natural key, --reset content only,
  --report, --dry-run). Dry-run report written: 4 services, 2 project notes, 15 credentials, 4 groups, 3 legal pages,
  5 enquiry types, 26 media; 18 placeholder field paths. Import not run (B-1); added to the CMS test setup.
- **Phase 6** partial. index.ts is a dispatcher (same signatures); static-source.ts (unchanged behaviour),
  cms-source.ts (Local API, published only, draft mode uncached, unstable_cache with tags), shared rules.ts.
  Media per database (D-52). Static parity 0; Playwright 52/52; unit 17/17. scripts/cms/parity-cms.ts
  (cms build + parity) written, not run (B-1). Full suite run (Phase 6 checkpoint): static green.
- **Phase 7** partial. Revalidation hooks active (D-45); /preview and /preview/exit (MFA admin, internal
  paths only, D-56); admin Preview buttons on services, legal pages and globals; footer revision from
  site.updatedAt (done in Phase 3); /credentials daily revalidation (D-57). tests/cms/preview.spec.ts and
  scripts/cms/test-cms.ts (full CMS run) written; not run (B-1). Parity 0; unit 19/19.
- **Phase 8** partial. Contact page passes enabled types (cached, tag enquiry-types); the client schema is built
  from them; the Server Action validates with getEnquiryOptionsNow() (uncached, D-55); messages unchanged.
  tests/cms/enquiry-types.spec.ts written; not run (B-1).
- **Phase 9** partial. Enquiries collection (no versions, hard delete, read flag only editable, admin-only),
  inbox summary, save → email → status in the Server Action via src/content/enquiries.ts, purge script
  (no-op while ENQUIRY_RETENTION_DAYS is unset), migration `enquiries` (offline), tests/cms/inbox.spec.ts.
  Phase 9 checkpoint: typecheck, lint, build green; parity 0; Playwright 52/52; unit 19/19; CMS E2E 13 skipped (B-1).
- **Phase 10** done (unit-verified; Local API check in smoke not run). Upload sanitiser (D-62): type by
  decoding, JPEG/PNG/WebP/AVIF only, re-encode without metadata; 10 MB limit; images.localPatterns (D-63).
  Unit: EXIF/GPS removed, orientation applied, SVG/GIF/text refused. Parity 0; Playwright 52/52; unit 23/23.
- **Phase 11** done (static verified). scripts/check-content-output.ts in check:content: 19 markers in static
  output (development); 13 in production mode, which fails as intended. Production publish block for
  marked documents. Parity 0; unit 24/24.
