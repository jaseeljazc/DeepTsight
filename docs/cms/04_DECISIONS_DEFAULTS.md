# Decisions and defaults for the overnight run

The agent uses these defaults and never stops to ask. New decisions are appended as D-xx entries:
decision, reason, how to reverse.

## Open questions from the context document
| # | Question | Default tonight | Needs owner? |
|---|---|---|---|
| U-1 | Payload or Sanity | Payload 3, in-app | Confirm |
| U-2 | Hosting and data residency | Local PostgreSQL 17 only; production database host undecided | Yes |
| U-3 | Domain | Unchanged; origin from `NEXT_PUBLIC_SITE_URL` | Yes |
| U-4 | Insights launch | Built, `insightsEnabled = false` | Yes |
| U-5 | Separate reviewer | No review step; roles editor and approver (founder holds both) | Later |
| U-6 | Who sets approval flags | Approver role only, audit-logged | Confirm |
| U-7 | Removed enquiry types on old enquiries | Label copied into each enquiry | No |
| U-8 | Legal pages in CMS | Yes; wording untouched; status field approver-only | Confirm |
| U-9 | Admin network restriction | Open, MFA-protected | Yes |
| U-10 | Payload compatibility | Checked in Phase 1; fallback track if not compatible | Info |
| U-11 | Start CMS before launch | Owner chose to start; work stays on a branch | No |
| U-12 | `crm-lead-import-template.xlsx` | Left untouched | Yes |
| U-13 | No-JS enquiries | Unchanged | Yes (Q-11) |
| U-14 | Maps link | Field built; empty until the URL is supplied | Supply URL |
| U-15 | Scope change | Approved | No |
| U-16 | Service icons | Icon field built; current values kept | Yes |
| U-17 | Retention and privacy wording | Purge built but off; no wording changed | Yes, before inbox goes live |

## Decisions in the plan
- **D-01** Local PostgreSQL 17 (owner's existing install) with three databases (`deeptsight_cms_dev`,
  `_test`, `_restore`) owned by the non-superuser role `deeptsight_cms`. The same adapter as
  production, so no switch is needed later.
- **D-02** `CONTENT_SOURCE=static|cms`, default `static`; the static source is kept as a fallback
  (`src/content/source/` is not deleted).
- **D-03** In production, `DATABASE_URI` must be Postgres and must use TLS (`sslmode=require` or
  `verify-full`) unless the host is localhost.
- **D-04** Payload `push` is off everywhere. Every schema change is a committed migration, proven on a
  freshly reset test database. The dev database is backed up before each migration.
- **D-05** The import publishes everything, so the CMS output matches today's site. Placeholder
  markers stay visible as they are today and are blocked from going live by the production gates
  (Phase 11). This replaces the context document's §20.1 "import as drafts", which would empty
  singleton pages such as Home.
- **D-06** Approval filtering keeps today's semantics (filtered only when
  `NEXT_PUBLIC_ENV=production`); the `_status = published` filter always applies outside draft mode.
- **D-07** Navigation: editors change labels only; routes and order are fixed in code.
- **D-08** Hardcoded copy (context §7.3). **Move to content:** button and link labels ("All services",
  "View service", the "View …" prefix, "Explore capabilities", "Return to the home page",
  "Connect on LinkedIn", "on LinkedIn" suffix, "Or email", "or call"); every "Perth, Western Australia"
  → `site.locationLabel`; figure ids in page files → `pages` global; default title template,
  description and OG text derived from `site` and `seo`, only if the result is identical.
  **Keep in code:** section headings and rail labels, table headers, the nine service part labels,
  enquiry form text, error and 404 copy, legal-document labels, credential table labels, the wordmark,
  JSON-LD `areaServed`.
- **D-09** Slugs are locked after first publish (no redirect manager yet, SEO-10).
- **D-10** Service delivery approach is fixed at 4 steps (animation limit).
- **D-11** Footer "Revision" date = `site.updatedAt`.
- **D-12** `check-placeholders.ts` keeps scanning code; the new `check-content-output.ts` scans adapter output.
- **D-13** Production `robots.txt` disallows `/admin` and `/api`.
- **D-14** Email failure after a successful save still shows thank-you; the failure is flagged in the admin.
- **D-15** E2E, parity and smoke tests run against `deeptsight_cms_test` (reset, migrated and imported
  each run), never the dev database. Reset scripts refuse any database whose name does not end in
  `_test` or `_restore`.

## Decisions made during the run
(The agent appends D-16 onwards here.)
- **D-16** `withPayload` adds `Accept-CH`, `Vary` and `Critical-CH` (colour-scheme client hints) to
  every route. `next.config.ts` re-scopes that rule to `/admin/:path*`, so public responses keep
  exactly their previous headers. Reverse: remove `scopePayloadHeaders` in `next.config.ts`.
- **D-17** No database access tonight (`.env.local` missing; blocker B-1 in PROGRESS). All code,
  migrations (created offline with `payload migrate:create`, which does not connect) and tests are
  written; anything that needs a running database is marked unverified in the report. Reverse: n/a;
  create `.env.local` and run the verification list in the morning report.
- **D-18** Unmatched URLs now render `src/app/global-not-found.tsx` (Next 16 `experimental.globalNotFound`),
  because the app has two root layouts. It reuses the public 404 body and document. `notFound()` inside
  the site still renders `src/app/(public)/not-found.tsx`. Parity: identical. Reverse: move the public
  layout back to `src/app/layout.tsx` (only possible without the Payload admin).
- **D-19** The installed Next.js is 16.3.5 (lockfile), not 16.3.7 as the plan says. Payload 3.90.2 accepts
  `>=16.3.3 <17`, so the version was left alone (the plan forbids changing it). Reverse: n/a.
- **D-20** `disableCreateDatabase: true` on the Postgres adapter: Payload would otherwise try
  `CREATE DATABASE` when the database is missing, which the app role must never attempt.
- **D-21** The template's empty `(payload)/custom.scss` is not copied: it would need the `sass` package
  in the app for no styling. Reverse: add the file and `sass`.
- **D-22** Payload's admin and API currently answer 500 when the database is unreachable (fails closed).
- **D-23** MFA is built in house, not with the `payload-totp` plugin (3.0.4, MIT, recent). The plugin
  generates the TOTP secret in the browser, stores it unencrypted, does not rate-limit code checks,
  has no recovery codes and needs a `proxy.ts` header. In-house: RFC 6238 on `node:crypto` (no
  `otplib`: fewer dependencies), AES-256-GCM at rest, 10 hashed recovery codes, replay protection,
  5 checks per 5 minutes per user, cookie bound to the Payload session id. Reverse: replace
  `src/cms/mfa` and the users fields with the plugin.
- **D-24** QR code for enrolment: `uqr` 0.1.3 (MIT, no dependencies), rendered as React SVG elements
  on the server. A manual key is shown as well.
- **D-25** The MFA screen replaces Payload's "unauthorized" view at `/admin/mfa`
  (`admin.routes.unauthorized`). Payload sends every signed-in user who fails `access.admin` there,
  and `access.admin` requires the MFA cookie, so a password alone never reaches content.
- **D-26** The MFA cookie lasts 2 hours from verification and is not extended by token refresh
  (stricter than the session). Reverse: reissue it in an `afterRefresh` hook.
- **D-27** Accounts can never be created through the API or the create-first-user screen, in any
  environment (not only production): a `beforeOperation` hook refuses `create` unless the
  `create-admin.ts` script sets a context flag. Forgot-password and reset-password are refused too,
  and a refusing email adapter stops Payload writing emails (with tokens) to the server log.
- **D-28** Audit writes run inside the request's transaction and fail closed: if the entry cannot be
  written, the change is rolled back.
- **D-29** Fail-closed production gate (`src/proxy.ts`): on the live site `/admin` and `/api` answer
  404 until `CMS_ADMIN_ENABLED=true`, because tonight's MFA could not be tested against a database.
  The owner sets the flag after `pnpm test:cms` passes. Reverse: remove `src/proxy.ts`.
- **D-30** CMS end-to-end tests run on port 3000 (Payload's CSRF origin check compares the Origin
  header with `NEXT_PUBLIC_SITE_URL`, default `http://localhost:3000`). Parity snapshots stay on 3100.
- **D-31** Auth cookies are `Secure` whenever the site URL is https (always on the live site, which the
  env rules force to https) and `SameSite=Strict`. Local http development cannot use Secure cookies.
- **D-32** "login-failed" audit entries are not written: Payload has no hook for a failed password
  check, and a write inside the failing login would be rolled back. Failed attempts are still counted
  by the lockout (5) and the IP limit (10 per 15 minutes); MFA failures are audited.
- **D-33** Enquiry-type `value`s keep the original wording (for example "Something else"), not a slug
  pattern as `02_CONTENT_MODEL.md` suggests: the value is what the form posts and the email records, so
  changing it would change behaviour. The Zod schema wins (`min(1)`); the CMS keeps `value` read-only
  after creation. Reverse: migrate values to slugs and map them to labels in the email.
- **D-34** Thank-you "Explore capabilities" reuses `site.ctaLabels.secondary` (identical text, same
  destination) instead of a second copy in `uiLabels`.
- **D-35** The default title template, description and OG/Twitter text in `src/lib/public-metadata.ts`
  stay in code: "DeepTsight Consulting" cannot be derived identically from `displayName` ("DeepTsight")
  or `legalName` ("... Pty Ltd"). The OG image's tagline and location now come from `site` (identical).
- **D-36** A legal page with `status: approved` shows no Status row (rather than inventing approval
  wording). Pending pages show the exact text as before.
- **D-37** `socialLinks`, `officeAddress` + `showOfficeAddress` and `businessHours` + `showBusinessHours`
  are stored and validated but not yet rendered (FR-41/FR-43 are a later release; rendering them is a
  design decision). `mapsUrl` renders an "Open in Google Maps" link (FR-42 wording) beside the location
  on the contact page, only when set.
- **D-38** Site settings are stored with `navLabels`; the adapter returns the same `Site` shape as before
  plus a derived `nav` (routes and order from `navRoutes` in `schema.ts`).
- **D-39** Error pages ("Return to the home page" in `error.tsx` and `global-error.tsx`) keep their copy
  in code (D-08: error and 404 copy stay in code); the thank-you page's link uses `uiLabels.returnHome`.
- **D-40** Reserved image positions (image slots) are media records with `kind: slot` and no file
  (`upload.filesRequiredOnCreate: false`), so `getFigures()` keeps returning the slot. Media uses drafts
  like every content collection.
- **D-41** The audit log records create, update, publish and delete. Unpublishing is recorded as an
  update: Payload's hooks do not say whether a save is a draft save or an unpublish.
- **D-42** The import script sets `skipAudit` and `disableRevalidate`: loading the existing content is not
  an editor's change. Every later change, including approval flags, is audited.
- **D-43** Legal `lastUpdated` stays text ("September 2026"), not a date: the Zod schema and the page show it
  as written (02 says date; the Zod schema wins).
- **D-44** The legal pages' "Reference" line moved from the page files into legal-page content so it is
  editable; output is identical.
- **D-45** Revalidation uses `revalidateTag(tag, { expire: 0 })` (Next 16 signature): the next visit after a
  publish renders fresh content instead of serving the old page once.
- **D-46** The Home publish guard validates Home's own fields; the trust strip and proof relationships are
  validated by their own collections' guards.
- **D-47** Media files are readable anonymously outside production (unapproved images render as marked
  mocks, as today) and only approved, published images on the live site. Rights fields (source, licence,
  usage rights, attribution) are hidden from anonymous reads.
- **D-48** The import publishes project notes (as today, D-05) but does not tick "Contains no client, site
  or plant names": that is a person's confirmation. It skips the publish guard through a script-only
  request context flag (`importPublish`); an editor must tick it before the note can be published again.
- **D-49** The eight issuer badges become media records (`assetClass: issuer-badge`), approved for public
  use as today, with licence `TBD — CLIENT`; the content gate (Phase 11) flags them.
- **D-50** `import-from-source.ts --dry-run` writes the import report from the static source without a
  database; tonight's `docs/cms/import-report.md` is that dry run and says so.
- **D-51** Published CMS reads are cached with `unstable_cache` and content tags. Next 16 documents
  `use cache` as its replacement, but that needs Cache Components, which Payload does not support yet
  (the plan forbids enabling them). Outside a Next.js server (scripts, verify-content) reads run uncached.
- **D-52** Uploaded media live in one folder per database, `.data/media/<database name>`, so importing into
  dev and test never renames files (which would break parity) and test runs cannot touch dev files.
  `MEDIA_DIR` overrides it (production storage is U-2). Backups copy that database's folder.
- **D-53** In CMS mode a related service, trust-strip credential, project note or Home capability whose
  record is unpublished (or a service switched off) is left out, like a disabled service. A global that has
  never been published fails the render with a clear message instead of rendering empty.
- **D-54** The client-side enquiry form imports `@/content/enquiry-schema` directly, not `@/content`:
  the adapter can load Payload (server only), which must never reach the browser bundle.
- **D-55** `getEnquiryOptionsNow()` (uncached) was added to the adapter for the Server Action, so the server
  validates against the types enabled at that moment (Phase 8); pages use the cached `getEnquiryOptions()`.
- **D-56** Preview (`/preview?path=`) needs an MFA-verified admin. Without one it redirects to
  `/admin/mfa` (password-only session) or `/admin/login`. Paths must be internal; redirects use a relative
  `Location`, so the Host header can never steer them. On the live site `/preview` is behind the same
  `CMS_ADMIN_ENABLED` gate as the admin.
- **D-57** `/credentials` re-renders daily (`revalidate = 86400`) in both modes, so an expired credential
  drops off without a publish. Home's trust strip does not filter by expiry, so Home is unchanged.
- **D-58** The lockout test sends a documentation-range `X-Forwarded-For` (203.0.113.10) so its attempts
  do not use the default address's allowance. This also shows the IP limit trusts that header, as
  `src/lib/rate-limit.ts` already notes: on a host that passes client values through, configure the
  trusted header before launch. The per-account lockout (5 attempts) does not depend on it.
- **D-59** Enquiries are stored only in CMS mode; static mode stores nothing, exactly as before (FR-38).
  The privacy notice is unchanged; suggested wording for storage is in the morning report (PRIV-09: it must
  be approved before the inbox goes live).
- **D-60** If the enquiry is saved but the email fails (including a live site with no email configured),
  the visitor sees the thank-you page and the record shows `emailStatus: failed` with a short reason code
  (`email-not-configured`, `email-service:<name>`, `email-error:<name>`), never a response body (D-14).
  If neither the save nor the email worked, the existing error with the email address is shown.
- **D-61** The inbox list shows unread and failed-notification counts above the table (a server component,
  `src/cms/views/inbox-summary.tsx`); search covers name, email, organisation and message.
- **D-62** Uploads are sanitised in the media collection's `beforeOperation` hook, so admin uploads,
  REST uploads and the import all pass through it: decoded with sharp, refused unless JPEG, PNG, WebP or
  AVIF (SVG, GIF and anything undecodable get a 400), then re-encoded in the same format with EXIF
  orientation applied and no metadata. The file name keeps its stem; the extension follows the real
  format. The imported images are therefore re-encoded too (dimensions and names unchanged).
- **D-63** `images.localPatterns` now lists the only local image paths: `/images/**`, `/badges/**`,
  `/dither/**` and `/api/media/file/**`. Any other path is refused by the optimiser (checked: 400).
- **D-64** `check-content-output.ts` runs as the last step of `check:content` (so on every build). In CMS
  mode it reads the database the build uses. It reports field paths only. The publish guard also refuses,
  on the live site only, to publish any document containing a marker (the import is exempt; D-48).
- **D-65** Insights pages take their H1 and lead from the existing `/insights` SEO entry, and their labels
  from `navLabels.insights`, rather than new page copy. Article details use the labels "Published",
  "Reading time" and "Categories"; reading time is shown as "N min". The index is a ruled schedule (no
  cards), with dates in mono (data). Categories are joined with commas, not middle dots (DESIGN.md §0.2 #11).
- **D-66** The Zod article contract gained an optional `seo` (title, description, derived canonical) so
  the stored SEO fields reach the page; without them the title and summary are used.
- **D-67** Rich text links accept http, https, mailto and site paths; internal-document links are off in
  the editor (`enabledCollections: []`). Anything else renders as plain text. External links get
  `rel="noopener noreferrer"`. Unknown node types (including any HTML node) render their text only.
- **D-68** Article categories use drafts like other content; only published categories are shown on an
  article. The sitemap lists `/insights` and each article only while Insights is on and has articles.
- **D-69** `next` and `eslint-config-next` upgraded from 16.3.5 to **16.3.7** (exact pins). `pnpm audit
  --prod` reported a **critical** advisory for 16.3.5 (remote code execution in `next/og` ImageResponse,
  fixed in 16.3.6), and the site uses `next/og` for its share image. 16.3.7 is the version the plan names;
  16.3.8 is also available. Verified after the upgrade: typecheck, lint, build, parity 0, Playwright 56/56,
  unit 28/28. Reverse: revert the commit and run `pnpm install`.
- **D-70** `pnpm.overrides`: `undici@7.29.0` → `7.29.1` (patch release). `payload` pins undici 7.29.0, which
  has two high advisories (TLS certificate validation bypass; denial of service). Reverse: remove the
  override when Payload ships a fixed pin.
- **D-71** A CMS account can update only itself; approvers can update any account (and only approvers
  change roles or delete accounts). Found in a security review after Phase 14; the admin-security test now
  checks that an editor cannot change another account's password.
- **D-72** Because `NEXT_PUBLIC_ENV=production` now requires `DATABASE_URI`, `PAYLOAD_SECRET` and
  `MFA_ENCRYPTION_KEY` (as the plan specifies), a production build of this branch needs them even with
  `CONTENT_SOURCE=static`. `main` is unaffected.
- **D-73** (found on the first run against a real database, 2026-10-02) The legal pages' approval field was
  named `status`, which collides with Payload's draft field `_status`: both produce the Postgres enum
  `enum_legal_pages_status`, and the migration failed with `invalid input value for enum ... "pending-adviser"`.
  The field is now `adviserStatus` (label still "Status"); the Zod field stays `status`, the mapper
  translates. No offline check could catch this. Reverse: not needed.
- **D-74** The three migrations created after `admin_security` (`collections`, `enquiries`, `insights`) were
  never applied to any database (dev and test had only the first two recorded), so they were deleted and
  replaced by one regenerated migration, `20261002_064614_cms_content`. Reverse: n/a (history rewritten only
  for migrations that never ran anywhere).
