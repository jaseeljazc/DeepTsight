# CMS build plan (Payload 3, in-app, PostgreSQL 17)

Each phase lists its dependencies, its tasks and its exit checks. A phase is done only when its
exit checks pass and it is committed.

## Database safety (applies to every phase)

- Three databases, all owned by `deeptsight_cms`:
  - `DATABASE_URI` (dev): used by `pnpm dev` and manual checks; changed only by migrations and the import
  - `DATABASE_URI_TEST`: used by E2E, parity and smoke runs; reset freely
  - `DATABASE_URI_RESTORE`: used only by the Phase 12 restore test; reset freely
- `scripts/cms/reset-db.ts <ENV_VAR_NAME>`: drops and recreates the `public` schema. Refuses unless the
  database name ends in `_test` or `_restore`.
- Before any phase that runs migrations on the dev database, take a backup with
  `scripts/cms/backup.ts` (a minimal version is built in Phase 1) and record the file in PROGRESS.
- Payload `push` is **off** everywhere (D-04). Every schema change goes through a migration:
  `payload migrate:create <name>`, then `payload migrate`. Every phase that changes collections ends by
  proving the full migration chain on a freshly reset test database.
- Postgres pool: limit each pool to 5 connections, because `next build` runs several workers.

---

## Phase 0: Setup and baseline (deps: none)

- Create branch `cms/phase-2`. Commit `docs/cms/*` ("cms(phase 0): add build plan").
- `pnpm install`. Record installed versions of next, react, typescript, zod in PROGRESS.
- Check that all three databases answer (`select 1` through a Node script using the env variables;
  print only "ok" or the error code).
- Baseline: `pnpm typecheck`, `pnpm lint`, `pnpm build`. Then Playwright E2E and axe against the
  production build (`PLAYWRIGHT_TEST_BASE_URL`). Record pass counts (expected 24/24 E2E, 28/28 axe).
- Parity harness:
  - `scripts/cms/parity-snapshot.ts <outDir>`: starts the production server on port 3100, fetches
    every route (sitemap routes, `/contact/thank-you`, the three legal pages, one unknown path for
    the 404, `/robots.txt`, `/sitemap.xml`, `/.well-known/security.txt`) and writes one JSON per route:
    status, `<title>`, meta description, canonical, robots meta, parsed JSON-LD, normalised visible
    text of header, `<main>` and footer, image alt texts and file basenames, and the response headers
    `content-security-policy`, `x-frame-options`, `referrer-policy`, `permissions-policy`,
    `strict-transport-security`, `x-content-type-options`.
  - `scripts/cms/parity-compare.ts <dirA> <dirB>`: prints differences. Exits non-zero unless every
    difference is listed in `docs/cms/parity-allowlist.json`, where each entry has a written reason.
  - Snapshot to `.cms-baseline/static-before/` (git-ignored).
- Exit: baseline recorded; databases reachable; comparing the baseline with itself gives 0 differences.

## Phase 1: Install Payload (deps: 0)

- **Version check first.** `pnpm view payload versions --json`. Pick the highest stable 3.x.
  `pnpm view payload@<v> peerDependencies` must accept next 16.3.7 and react/react-dom 19.3.0.
  Do the same check for `@payloadcms/next`, `@payloadcms/ui`, `@payloadcms/db-postgres` and
  `@payloadcms/richtext-lexical`. If no version qualifies, do not install. Record the finding and
  switch to the Fallback Track at the bottom of this file.
- Install with exact pins, all `@payloadcms/*` at the same version: payload, @payloadcms/next,
  @payloadcms/ui, @payloadcms/db-postgres, @payloadcms/richtext-lexical, sharp, and graphql only if
  it is a required peer.
- Reference files: generate the official blank template for the same version in a temp directory
  outside the repo, using create-payload-app's non-interactive flags (check `--help`; if it still
  prompts, use the docs instead). Copy only the `(payload)` route files and the import-map pattern.
  Delete the temp directory afterwards.
- **Restructure root layouts.** Payload's admin renders its own `<html>`, so `src/app/layout.tsx`
  cannot stay the root of everything. Target structure:
  - `src/app/(public)/layout.tsx`: the current root layout (html lang, fonts, skip link, default metadata, Plausible)
  - `src/app/(public)/(site)/...`: the existing site group, unchanged
  - `src/app/(public)/design-system/...`
  - `src/app/(payload)/...`: Payload admin and REST routes
  - `global-error.tsx`, metadata routes and `.well-known` stay at `src/app/` if they still work there.
    Otherwise move them into `(public)`.
  - 404 with multiple root layouts: follow Next 16.3's documented way (global not-found). Check
    `node_modules/next/dist/docs` if present, otherwise nextjs.org. The 404 page must look and
    behave exactly as before (the parity check covers it).
- `next.config.ts`: wrap with `withPayload`. Keep the existing headers. Change the public CSP rule's
  `source` so it excludes `/admin` and `/api` without changing its value. The admin CSP comes in Phase 2.
- tsconfig path alias `@payload-config` → `src/payload.config.ts`.
- `src/payload.config.ts` (minimal for now): secret from env; postgres adapter with
  `pool: { connectionString: DATABASE_URI, max: 5 }` and `push: false`; migrations directory
  `src/cms/migrations`; lexical editor; a temporary users collection; `telemetry: false`; GraphQL
  disabled with no GraphQL route files; admin avatar not Gravatar; `serverURL` from the site URL;
  csrf and cors set to that origin only.
- First migration: `payload migrate:create initial`, then `payload migrate` on the dev database.
  Prove it on a reset test database too. Commit the migration files.
- Minimal `scripts/cms/backup.ts` (`pg_dump -Fc` to `.data/backups/<dbname>-YYYYMMDD-HHMMSS.dump`) so
  later phases can back up before migrating. Phase 12 completes it.
- Code location: `src/cms/` (collections/, globals/, fields/, hooks/, access/, mfa/, lib/, migrations/).
- `.gitignore`: `.data/`, `.cms-baseline/`.
- Env (in `src/lib/env-rules.ts` and the server schema; names only in `.env.example`):
  - `CONTENT_SOURCE` = `static` | `cms`, default `static`
  - `DATABASE_URI` must start with `postgres://` or `postgresql://`
  - `DATABASE_URI_TEST`, `DATABASE_URI_RESTORE`: optional, development and test only
  - `PAYLOAD_SECRET` (at least 32 characters)
  - `MFA_ENCRYPTION_KEY` (32 bytes, base64)
  - `DATABASE_URI`, `PAYLOAD_SECRET` and `MFA_ENCRYPTION_KEY` are required when `CONTENT_SOURCE=cms`
    and when `NEXT_PUBLIC_ENV=production`.
  - In production, `DATABASE_URI` must include `sslmode=require` or `sslmode=verify-full` unless the
    host is `localhost` or `127.0.0.1` (D-03).
  - Add generated local values for `PAYLOAD_SECRET` and `MFA_ENCRYPTION_KEY` to `.env.local` with the
    append-only script (00, rule 4). Do not print values.
- ESLint: extend `no-restricted-imports` so `payload`, `@payload-config` and `@payloadcms/*` may only
  be imported from `src/content/**`, `src/cms/**`, `src/app/(payload)/**`, `src/payload.config.ts`,
  `scripts/cms/**` and `tests/**`.
- Exit: `/admin` loads in `pnpm dev`. With `CONTENT_SOURCE=static`, the parity check against
  `static-before` gives 0 differences. Build, E2E and axe are green.

## Phase 2: Admin security (deps: 1)

Implement `03_SECURITY_AND_OPS.md` sections 2 to 6: users and roles, MFA, lockout, login rate limit,
sessions, audit log, admin CSP and headers, REST lockdown, and `scripts/cms/create-admin.ts`.
The dev account is `editor@example.com`, with its password and TOTP secret written to
`.data/dev-admin.txt` (git-ignored). Back up dev first; create and apply migrations.

- Tests in `tests/cms/admin-security.spec.ts`, against a reset and migrated test database:
  - anonymous `GET /api/users`, `/api/services` and `/api/enquiries` are refused (401 or 403)
  - `/api/graphql` returns 404
  - after password login but without TOTP, no collection data is readable
  - with TOTP, the admin works
  - repeated wrong passwords lock the account
  - admin responses carry `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`
  - the public CSP is unchanged (parity)
- Exit: tests green, parity 0 differences, migration chain proven on a fresh test database.

## Phase 3: Content model changes in Zod and static source (deps: 0)

The Zod schemas are the contract, so change them first and keep the static site's output identical.

- `Site`:
  - add `socialLinks[]`, `mapsUrl?`, `locationLabel`, `officeAddress?` with `showOfficeAddress`
    (default false), and `businessHours?` with `showBusinessHours` (default false)
  - add a `uiLabels` group (decision D-08)
  - replace `nav` with per-route labels, with routes and order fixed in code (decision D-07)
- `Service`: add `enabled` (default true) and `sortOrder`. `getServices` drops disabled services
  and removes them from other services' `relatedSlugs`.
- `PagesContent`: add figure ids for the services, credentials and contact pages. The ids now
  hard-coded in those page files move here.
- `LegalPage`: add `status` (`pending-adviser` | `approved`). `legal-document.tsx` reads it; the
  pending text stays exactly as it is today.
- `Article.body`: Lexical JSON (`z.object({ root: ... }).passthrough()`).
- Optional `updatedAt` on documents, used for the sitemap's `lastModified` when present.
- Enquiry types: move into `src/content/source/enquiry-types.ts` as `{ value, label, enabled, sortOrder }`,
  and add `buildEnquirySchema(values: string[])`. `enquirySchema` becomes the static-mode instance.
- Move the strings listed in decision D-08 from components into content. Derive brand strings from
  `site.displayName` and `site.tagline`, but only where the derived text is identical to today's.
- Adapter integrity checks: unknown `relatedSlugs` or media ids throw (build fails).
- `scripts/verify-content.ts` calls every getter, including `getFigures`, `getPageContent` and `getEnquiryOptions`.
- Exit: static parity 0 differences; green.

## Phase 4: Collections and globals (deps: 1, 2, 3)

Build everything in `02_CONTENT_MODEL.md`: drafts, the publish validation hook (Zod), access rules,
field-level permissions, the revalidation hooks (guarded; they become active in Phase 7), and the
admin grouping and field descriptions.

- Back up dev. `payload migrate:create collections`, then `payload migrate` on dev.
- `npx payload generate:types` → `src/cms/payload-types.ts`. Run `generate:importmap`.
- `scripts/cms/smoke.ts`: reset and migrate the test database, then create, update, publish and delete
  one record in every collection through the Local API.
- Exit: smoke script passes; admin lists every collection and global; migration chain proven on a
  fresh test database; green.

## Phase 5: Import (deps: 4)

- `scripts/cms/import-from-source.ts --db <ENV_VAR_NAME>`: idempotent upsert by natural key (slug,
  legacy id). A `--reset` flag wipes content collections only (never users, audit log or enquiries).
  Set `context.disableRevalidate = true`. Copy image files from `public/` into Payload media; leave
  `public/` untouched because static mode still uses it.
- Everything is imported as published (decision D-05).
- Import into both dev and test.
- Write `docs/cms/import-report.md`: counts per collection and the field paths that contain
  placeholder markers. Field paths only, never content values.
- Exit: running the import twice produces identical counts; report written.

## Phase 6: Adapter switch (deps: 5)

- `src/content/index.ts` becomes a dispatcher with the same exported signatures:
  - `src/content/static-source.ts`: today's behaviour, moved, unchanged
  - `src/content/cms-source.ts`: Payload Local API, mappers in `src/content/mappers/*`, the same
    Zod parse and the same approval filtering
- Public reads always filter `_status = published`, even with `overrideAccess`. Drafts never appear
  outside draft mode.
- Wrap published reads in Next's tagged data cache (the tags are in `02_CONTENT_MODEL.md`). Do not
  enable Cache Components; Payload does not support them yet. If `unstable_cache` is deprecated in
  16.3, use the documented replacement that works without Cache Components.
- Parity:
  1. Reset, migrate and import the test database.
  2. Build with `CONTENT_SOURCE=cms` against it.
  3. Snapshot to `.cms-baseline/cms/`.
  4. Compare with `static-before`: 0 differences. Image URL changes are allowed only through
     allowlist entries with a reason.
- Exit: parity passes; full E2E and axe suites green in both modes.

## Phase 7: Revalidation, preview, dates (deps: 6)

- `afterChange` and `afterDelete` hooks call `revalidateTag` according to the tag map. A slug change
  invalidates both the old and the new slug. Hooks are skipped when `context.disableRevalidate` is set
  and are wrapped in try/catch outside a request. Check `revalidateTag`'s signature in Next 16.3.
- Preview:
  - `src/app/preview/route.ts` requires a logged-in, MFA-verified admin; accepts only an internal path
    (starts with `/`, no `//`, no scheme); enables draft mode; redirects
  - `src/app/preview/exit/route.ts` disables draft mode
  - Wire the admin's preview button to this route
- In draft mode the adapter reads drafts, uncached, and shows unapproved records with the existing
  placeholder markers, as development does today.
- Footer "Revision" date comes from `site.updatedAt` (decision D-11). `/credentials` (and Home, if it
  shows expiry) adds daily time-based revalidation so expiry stays correct.
- E2E, against `next start` on the test database:
  1. Edit a service summary and save it as a draft → the public page is unchanged.
  2. Open preview → the draft is shown.
  3. Publish → the public page is updated.
- Exit: E2E green; parity green.

## Phase 8: Editable enquiry types (deps: 6)

- The contact page passes the enabled types to the form as props (tag `enquiry-types`). The client
  resolver uses `buildEnquirySchema` with those values.
- The Server Action fetches the enabled types at request time (uncached) and validates against them.
  Error messages are unchanged.
- E2E: disable a type in the admin → it disappears from the form → a submission using it is rejected
  by the server.

## Phase 9: Enquiry inbox (deps: 8)

Implement `03_SECURITY_AND_OPS.md` section 7. Back up dev; create and apply migrations.

- New order in the Server Action: honeypot → Zod → rate limit → Turnstile → timing →
  **save (emailStatus = pending)** → email → update emailStatus → redirect.
- Saving goes through `src/content/enquiries.ts` (inside the content seam), not through Payload
  directly from the action.
- Admin: list columns, read/unread, search, bulk delete, unread count.
- `scripts/cms/purge-enquiries.ts` reads `ENQUIRY_RETENTION_DAYS`; if unset it deletes nothing and
  prints a warning.
- E2E: a submission creates a record with `emailStatus = simulated`; anonymous API access is refused;
  deleting removes the record completely (no versions left behind).
- Exit: full suite green in both modes. Commit. (Tier A complete.)

## Phase 10: Media (deps: 4; parity again after)

Implement `03_SECURITY_AND_OPS.md` section 8. Back up dev; create and apply migrations if fields change.

- Update `next.config.ts` image settings for Payload file URLs.
- Test: generate a JPEG with GPS EXIF using sharp, upload it through the Local API, and assert the
  stored file has no EXIF data. Also assert an SVG upload is rejected.

## Phase 11: Placeholder and integrity gates (deps: 6)

- `scripts/check-content-output.ts`: calls every getter and scans all returned strings with
  `isPlaceholder`. Fails when `NEXT_PUBLIC_ENV=production`; otherwise prints a count. Add it to
  `check:content`. Keep `check-placeholders.ts` for code (decision D-12).
- Publishing a record that contains a marker is blocked when `NEXT_PUBLIC_ENV=production`.

## Phase 12: Backup and restore (deps: 4)

- Complete `scripts/cms/backup.ts --db <ENV_VAR_NAME>`: `pg_dump --format=custom --no-owner` to
  `.data/backups/<dbname>-YYYYMMDD-HHMMSS.dump`, plus a copy of the media directory beside it.
- `scripts/cms/restore.ts --from <file> --db <ENV_VAR_NAME>`: refuses unless the target name ends in
  `_test` or `_restore`. Resets the schema, then runs `pg_restore --no-owner --exit-on-error`.
  Restoring dev is a manual owner action, documented but not automated.
- `scripts/cms/verify-backup.ts <ENV_A> <ENV_B>`: compares row counts per table in `public`.
- Prove it: back up dev → restore into `DATABASE_URI_RESTORE` → verify counts are equal. Record the
  result in the report.
- Document it in `docs/MAINTENANCE_PLAN.md`, including the note that production backups also need an
  off-machine copy.

## Phase 13: Insights (deps: 6, 7, 10)

- Back up dev; create and apply migrations.
- `articles` and `article-categories` collections, as in `02_CONTENT_MODEL.md`.
- Lexical → React renderer in `src/components/content/rich-text.tsx`, mapped to design-system
  typography (use the `Prose` primitive and DESIGN.md). React nodes only; no HTML strings.
- Routes: `/insights` (index), `/insights/[slug]` (with `generateStaticParams`), `/insights/rss.xml`
  (XML-escaped).
- Article JSON-LD using the existing builder; sitemap entries; everything gated by `insightsEnabled`,
  which stays false on dev.
- Tests: with the flag false → 404. With the flag true in the test database, plus one published
  article and one draft → the article renders, axe passes, the draft is absent, the RSS feed is valid XML.

## Phase 14: Documentation, QA, report (always)

- Full suite in both modes; parity; migration chain on a fresh test database; `pnpm audit --prod`
  (report high and critical findings).
- Update: `ARCHITECTURE.md` §2 to §4, `TECH_STACK.md` (installed versions, Payload, Postgres 17),
  `docs/CONTENT_EDITING_GUIDE.md` (rewrite as a plain-language founder guide to the admin),
  `docs/DATA_FLOW_PRIVACY.md`, `docs/ACCESS_REGISTER.md` (including the `deeptsight_cms` role),
  `docs/LICENCES_SERVICES.md`, `docs/MAINTENANCE_PLAN.md`, a CMS rules section in `CLAUDE.md`,
  audit status in `docs/PROJECT_CODE_AUDIT.md`, and `TASKS.md` Phase 10 (tick only what is verified).
- Write `docs/cms/MORNING_REPORT.md`. Final commit.

---

## Fallback Track (only if no Payload version supports Next 16.3.7 / React 19.3)

Do Phase 0, Phase 3, the static part of Phase 11, and the `buildEnquirySchema` change. Write
`docs/cms/02_CONTENT_MODEL.md` notes on what is ready. Report the exact peer-dependency mismatch and
the options: wait for Payload, pin Next to the newest version Payload supports, or use another CMS.
Do not change the Next.js version yourself.
