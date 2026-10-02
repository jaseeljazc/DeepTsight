# Morning report: CMS overnight build

> **Update 2026-10-02 (after real databases were available): the CMS is now verified.** `pnpm cms:test` passes end
> to end (CMS build matches the static site with 0 unexplained differences; public E2E and axe 56/56 against the CMS
> build; all 14 CMS tests pass, including sign-in with the authenticator code, lockout, the IP limit, draft → preview
> → publish, the enquiry inbox, enquiry types and Insights). `pnpm cms:smoke` passes 12/12 and the backup →
> restore → verify proof matches on all 80 tables. Sections 2, 3, 7 and 8 below describe the state *overnight*; where
> they say "unverified", it is now verified. The real run found and fixed six bugs (D-73 and D-75 to D-79 in
> `docs/cms/04_DECISIONS_DEFAULTS.md`), the most important being that my tests had been running anonymously.
> Still open: the owner decisions in section 4.

Branch: `cms/phase-2` · Start commit: `b2092d6` (main) · Final commit: see `git log -1` (after this report's commit;
last code commit `d1d3a73`) · Started 2026-10-01 20:25 · finished 2026-10-01 22:15 (local time)

## 1. Summary

The whole plan (Phases 0 to 14) is built and committed on `cms/phase-2` in 21 commits: Payload 3.90.2 in the app,
in-house TOTP MFA, every collection and global, import, adapter switch, preview, editable enquiry types, enquiry
inbox, media hardening, placeholder gates, backup/restore scripts and Insights. **Nothing that needs a database
could run**, because `.env.local` did not exist when the run started (preflight step F was not done): no migration
has been applied, the admin has never loaded, and the 14 CMS end-to-end tests are written but skipped. The
static site is verified unchanged: parity with the starting site shows 0 differences on all 17 routes, and every
public test passes (56/56 including 4 new ones; it was 52/52). **Most important next step:** add the three
`DATABASE_URI*` lines to `.env.local` and run `pnpm cms:test` (section 10). That proves or disproves everything
marked "unverified" below in about ten minutes.

Also urgent, and independent of the CMS: `pnpm audit` found a **critical** advisory in next 16.3.5 (remote code
execution in `next/og`, which the site uses). This branch upgrades to 16.3.7; **`main` is still on 16.3.5**.

## 2. Phase status

| Phase | Status | Commit | Notes |
|---|---|---|---|
| 0 Setup and baseline | done (DB check blocked) | `0f1d77a`, `5bf04a0` | Baseline green; parity harness built; self-compare 0 differences |
| 1 Install Payload | partial | `f65e805`, `c412fa0`, `6b84629` | Installed and wired; public site under `(public)`; initial migration created offline, **not applied**; `/admin` answers 500 without a database |
| 2 Admin security | partial | `3919e80`, `d1d3a73` | Roles, MFA, lockout, audit log, admin CSP built; MFA logic unit-tested; E2E written, not run |
| 3 Content model (Zod + static) | **done** | `bcfd7b0` | Parity 0; all verified offline |
| 4 Collections and globals | partial | `f567c24` | Built; migration created offline; `pnpm cms:smoke` not run |
| 5 Import | partial | `3913581` | Script built; only a dry-run report (`docs/cms/import-report.md`) |
| 6 Adapter switch | partial | `ace26f5` | Static mode verified (parity 0); CMS mode not run |
| 7 Revalidation, preview, dates | partial | `15ab2eb` | Built; preview E2E written, not run |
| 8 Editable enquiry types | partial | `f1ce107` | Built; E2E written, not run |
| 9 Enquiry inbox | partial | `8ead034` | Built; E2E written, not run. **Privacy notice not changed** (needs your adviser) |
| 10 Media | done (unit-verified) | `dde0ee2` | EXIF/GPS stripping and SVG refusal proven by unit tests; Local API check in smoke not run |
| 11 Placeholder gates | **done** | `4587433` | 19 markers in development output; production mode fails as intended (13) |
| 12 Backup and restore | partial | `6d24f28` | Scripts built, refusal guards checked; the backup → restore → verify proof not run |
| 13 Insights | partial | `6b2099c` | Built; "Insights off" tests run and pass; CMS insights E2E not run |
| 14 Docs, QA, report | done | `00800fa`, `45645c2`, this commit | Includes the next 16.3.7 security upgrade |

No phase was reverted.

## 3. Test results

| Check | Baseline (main) | Final (static) | Final (cms) |
|---|---|---|---|
| typecheck | pass | pass | not run (needs DB) |
| lint | pass | pass | n/a (same code) |
| build | pass (22 pages) | pass (24 pages) | not run |
| E2E (Playwright, both projects) | 24/24 | 28/28 (4 new: Insights off) | not run |
| axe | 28/28 | 28/28 | not run |
| parity differences vs baseline | 0 | **0** (17 routes, headers byte-identical) | not run |
| CMS unit tests (`pnpm test:cms-unit`) | n/a | 28/28 | n/a |
| CMS E2E (`pnpm test:cms`) | n/a | 14 written, 14 skipped | not run |
| `pnpm audit --prod` | 1 critical, 2 high (+10 lower) before fixes | 0 critical, 0 high, 1 moderate, 1 low | — |

Unit tests cover: TOTP against the RFC 6238 vectors, AES-256-GCM tamper detection, recovery codes, the MFA
cookie binding, the production 404 gate, preview path safety, enquiry schema, maps links, navigation, service
ordering, media EXIF/GPS removal and SVG refusal, rich-text rendering and link safety, placeholder paths.

## 4. Needs your decision (most urgent first)

1. **Upgrade `main` to next 16.3.7 (or 16.3.8).** Critical advisory (RCE in `next/og`, used by the share image).
   Tonight's default: upgraded on this branch only (D-69). Options: cherry-pick `00800fa` onto `main` now; or wait
   for the CMS merge.
2. **Privacy notice wording before the inbox goes live (PRIV-09, U-17).** Nothing was changed (rule: no legal
   wording). Default: the inbox is built but only active with `CONTENT_SOURCE=cms`. Suggested wording for your
   adviser, as a starting point only:
   > *4. Data storage and processing.* Enquiries submitted on this website are sent over HTTPS. Each enquiry is
   > stored in DeepTsight's website database, hosted in TBD — CLIENT, and a copy is emailed to DeepTsight's
   > mailbox. Only DeepTsight staff with two-step sign-in can read stored enquiries. Enquiries are deleted after
   > TBD — CLIENT, or sooner on request; copies in backups are deleted within TBD — CLIENT. To ask for your
   > enquiry to be deleted, email {site email}.
   >
   > *5. Cookies.* The public website sets no cookies. The content management area used by DeepTsight staff
   > uses essential sign-in cookies; visitors never receive them.
   Then set `ENQUIRY_RETENTION_DAYS` to the agreed period.
3. **Turn on the production admin only after the CMS tests pass.** `src/proxy.ts` makes `/admin`, `/api` and
   `/preview` answer 404 on the live site until `CMS_ADMIN_ENABLED=true` (D-29). Default: closed. Option: set it
   after `pnpm cms:test` is green on the production-like setup.
4. **Production database host and media storage (U-2).** Default: local PostgreSQL 17 only; uploads in
   `.data/media/<database>` (D-52). Needed: a host (with region), TLS (`sslmode=require` is enforced), daily
   backups with an off-machine copy, and storage for uploads.
5. **Issuer badges' licence (D-49).** Imported as media "approved for public use" (as the site shows them today)
   with licence `TBD — CLIENT`, which the content gate flags. Confirm the badge terms, or say if they should be
   unapproved.
6. **Project notes' "no identifying details" tick (D-48).** The import leaves it unticked; an editor must
   confirm it before re-publishing a note. Confirm that is the behaviour you want.
7. **Admin network restriction (U-9).** Default: reachable from anywhere, protected by password + TOTP + lockout
   + IP rate limit. Option: restrict `/admin` by IP at the host.
8. **IP rate limit trusts `X-Forwarded-For` (D-58).** Fine on Vercel; on another host, configure the trusted
   header before launch (already noted in `src/lib/rate-limit.ts`). Per-account lockout does not depend on it.
9. **`package-lock.json` (rule 9: not edited).** It no longer matches `pnpm-lock.yaml` (no Payload, old next).
   Options: delete it (pnpm is the package manager), or regenerate it.
10. **Things confirmed only as defaults:** Payload over Sanity (U-1), legal pages in the CMS with approver-only
    status (U-8), approver role sets flags (U-6), service icons (U-16), Insights stays off (U-4).
11. **Remaining advisories:** esbuild (moderate, inside drizzle-kit, a development tool) and dompurify (low,
    inside the admin's code editor). Both wait on Payload releases.

## 5. Needs your action

- **`.env.local`:** add `DATABASE_URI`, `DATABASE_URI_TEST`, `DATABASE_URI_RESTORE` (preflight step F). The file
  now exists and already holds generated `PAYLOAD_SECRET` and `MFA_ENCRYPTION_KEY` (development only); append
  your three lines, and merge your real keys from `.env.local.bak` if you made one.
- **PostgreSQL tools:** not on PATH. The scripts find `C:\Program Files\PostgreSQL\17\bin` themselves; adding it
  to PATH (preflight step B) is still recommended.
- **Run the CMS tests** (section 10). Report back anything red: those are the parts I could not verify.
- **Adviser:** privacy notice wording (section 4.2); legal page approval stays a manual approver action.
- **Google Maps link** (U-14): paste it into Site settings → Contact once the admin runs.
- **Production:** database host, TLS connection string, `PAYLOAD_SECRET` (32+ random characters),
  `MFA_ENCRYPTION_KEY` (32 random bytes, base64), media storage, backup job with off-site copy.

## 6. Decisions I made

Full text and how to reverse each: `docs/cms/04_DECISIONS_DEFAULTS.md`.

- D-16 Payload's client-hint headers limited to `/admin` (public headers unchanged).
- D-17 No database tonight: code, migrations (created offline) and tests written; DB steps listed as unverified.
- D-18 Unmatched URLs use `global-not-found.tsx` (two root layouts); identical output.
- D-19 Found next 16.3.5 installed, not 16.3.7 (later upgraded, D-69).
- D-20 `disableCreateDatabase: true`: Payload never tries `CREATE DATABASE`.
- D-21 Empty `custom.scss` not copied (would need `sass`).
- D-22 Admin and API answer 500 without a database (fail closed).
- D-23 MFA built in house (the `payload-totp` plugin stores secrets unencrypted, has no rate limit or recovery codes).
- D-24 `uqr` for local QR codes. · D-25 MFA screen replaces Payload's "unauthorized" view at `/admin/mfa`.
- D-26 MFA cookie lasts 2 hours, not extended by refresh. · D-27 No account creation outside `create-admin.ts`; no reset email.
- D-28 Audit writes fail closed. · D-29 Production 404 gate until `CMS_ADMIN_ENABLED=true`.
- D-30 CMS tests on port 3000 (CSRF origin). · D-31 Secure cookies on https; SameSite=Strict.
- D-32 No "login-failed" audit entry (no hook); lockout and IP limit still count failures.
- D-33 Enquiry-type values keep their original wording. · D-34 Thank-you reuses `ctaLabels.secondary`.
- D-35 Title template stays in code (not derivable identically). · D-36 Approved legal pages show no status row.
- D-37 Social links, address, hours stored but not rendered yet; maps link renders when set.
- D-38 `navLabels` stored, `nav` derived. · D-39 Error-page copy stays in code.
- D-40 Image slots are media records without a file. · D-41 Unpublish is audited as "update".
- D-42 Import skips audit and revalidation. · D-43 Legal `lastUpdated` stays text. · D-44 Legal reference moved to content.
- D-45 `revalidateTag(tag, { expire: 0 })`. · D-46 Home guard validates Home's own fields.
- D-47 Media files readable anonymously outside production; approved + published only in production.
- D-48 Import leaves the project-note tick for a person. · D-49 Badges imported as approved media, licence TBD.
- D-50 Import dry-run report. · D-51 `unstable_cache` (Cache Components unsupported by Payload).
- D-52 Media folder per database. · D-53 Unpublished references are left out; unpublished globals fail loudly.
- D-54 Client form imports the schema module directly. · D-55 Uncached enquiry types for the Server Action.
- D-56 Preview needs MFA; internal paths; relative redirects. · D-57 `/credentials` re-renders daily.
- D-58 Lockout test uses its own test address. · D-59 Enquiries stored only in CMS mode.
- D-60 Saved-but-email-failed shows thank-you and is flagged. · D-61 Inbox unread/failed counts.
- D-62 Upload sanitiser (decode, re-encode, no metadata). · D-63 `images.localPatterns` limited to four paths.
- D-64 Content-output placeholder check on every build; production publish block.
- D-65 Insights copy from existing SEO/nav content; ruled list design. · D-66 Optional article `seo`.
- D-67 Rich-text link rules. · D-68 Categories use drafts; sitemap lists Insights only when on.
- D-69 next 16.3.5 → 16.3.7 (critical advisory). · D-70 undici override 7.29.1 (two high advisories).
- D-71 Accounts update only themselves unless approver. · D-72 Production builds of this branch need the CMS variables.

## 7. Problems and reverted work

- **B-1 No database access (whole night).** `.env.local` was missing, so no `DATABASE_URI*` was set; role
  `deeptsight_cms` needs a password (probed once with `psql -w` as that role: "no password supplied"). Per the
  prompt, nothing connected as `postgres` and nothing was created. Effect: every DB-dependent exit check is
  unverified (sections 2 and 3).
- **Unverified integration risks** I could not test and would look at first if `pnpm cms:test` fails:
  1. The MFA screen as Payload's "unauthorized" view, and the redirect after password login.
  2. Payload's CSRF check with the MFA form posts (origin must equal `NEXT_PUBLIC_SITE_URL`; a `www` vs bare
     domain mismatch would break sign-in).
  3. `unstable_cache` and `revalidateTag` working together under `next start` for the publish test.
  4. Draft mode on the force-static pages (preview test).
  5. The import against the real schema (field names, relationship ids, uploads through the sanitiser).
- **Not reverted:** nothing failed in a way that needed a revert. The static site was checked after every phase.
- **Shell slips (no effect on the result):** a `prettier --write src` reformatted two unrelated components; I
  reverted them before committing. Two shell commands failed to parse and ran nothing; the work was redone with
  files.

## 8. Security checks

| Check (03) | Result |
|---|---|
| REST lockdown (anonymous refused on every collection and global) | **Unverified at runtime**: access rules in code (default deny); E2E written |
| GraphQL off | **Pass**: `/api/graphql` returns 404 for every method without loading Payload (probed) |
| MFA (TOTP, encrypted at rest, recovery codes, rate limit, session-bound cookie) | Logic **pass** (unit tests incl. RFC vectors); flow **unverified** |
| Lockout (5 attempts, 15 min) and login IP limit (10 / 15 min, hashed IP) | Configured; **unverified** (E2E written) |
| Admin CSP and headers (strict CSP, noindex, no-store) | **Pass** (probed on `/admin`, `/api/users`, `/api/graphql`) |
| Public CSP and headers unchanged | **Pass** (parity: byte-identical on every route) |
| EXIF/GPS stripping | **Pass** (unit test with a GPS-tagged JPEG) |
| SVG rejected | **Pass** (unit test; also GIF and non-images) |
| Enquiry data minimal (no IP, UA, token, honeypot) | In code; **unverified** at runtime (E2E checks it) |
| Audit log (append-only, approver flags from/to, fails closed) | In code; **unverified** at runtime |
| No telemetry | **Pass** (`telemetry: false`; no email adapter output) |
| Production fail-closed gate on `/admin`, `/api`, `/preview` | **Pass** (unit test) |
| Robots: production disallows `/admin`, `/api`, `/preview` | In code |
| Secrets | No connection string or password printed, logged or committed; `.data/` and `.env*` ignored |

## 9. New dependencies

| Package | Version | Purpose | Licence |
|---|---|---|---|
| `payload` | 3.90.2 | The CMS | MIT |
| `@payloadcms/next` | 3.90.2 | Admin UI and routes in Next.js | MIT |
| `@payloadcms/ui` | 3.90.2 | Admin UI components | MIT |
| `@payloadcms/db-postgres` | 3.90.2 | PostgreSQL adapter | MIT |
| `@payloadcms/richtext-lexical` | 3.90.2 | Insights article editor | MIT |
| `sharp` | 0.35.5 | Image processing, metadata stripping | Apache-2.0 |
| `graphql` | 16.14.2 | Required peer of Payload (GraphQL disabled) | MIT |
| `uqr` | 0.1.3 | Local QR code for MFA enrolment | MIT |
| `undici` (override) | 7.29.1 | Patched version of Payload's HTTP client | MIT |
| `next`, `eslint-config-next` (upgrade) | 16.3.7 | Security fix (was 16.3.5) | MIT |

Recorded in `docs/LICENCES_SERVICES.md` §4 and `TECH_STACK.md` §0 and §4.

## 10. How to try it

```bash
# 1. Database settings (names only here; your values go in .env.local)
#    DATABASE_URI=...deeptsight_cms_dev   DATABASE_URI_TEST=..._test   DATABASE_URI_RESTORE=..._restore
pnpm cms:check-db                 # prints "ok" per database

# 2. Everything I could not run, against the TEST database only (about 10 minutes):
pnpm cms:test                     # reset+migrate+import test DB, cms build, cms parity,
                                  # public E2E+axe in cms mode, CMS suites, then rebuilds static

# 3. Dev database, then the admin
pnpm cms:backup                   # empty now, but establishes the habit (D-04)
pnpm cms:migrate                  # applies the five migrations to DATABASE_URI
pnpm cms:import                   # loads today's content; writes docs/cms/import-report.md
npx tsx scripts/cms/create-admin.ts --db DATABASE_URI --email editor@example.com --name "Test Editor"
                                  # sign-in details go to .data/dev-admin.txt (password, key, recovery codes)
CONTENT_SOURCE=cms pnpm dev       # then open http://localhost:3000/admin

# 4. Backup proof
pnpm cms:prove-backup             # dev -> restore DB -> row counts compared
```

**Authenticator:** in your app choose "enter a setup key" and type the `Key:` line from `.data/dev-admin.txt`
(time-based, 6 digits). Do not copy its values anywhere else.

**Switching content source:** `CONTENT_SOURCE=static` (default) reads `src/content/source`; `CONTENT_SOURCE=cms`
reads the database. Production uses `cms` once the gate (section 4.3) is opened.

## 11. Undo and clean-up

- Restore the push URL: `git remote set-url --push origin <original-url>` (I did not read or change remotes).
- `.env.local` was created by `scripts/cms/ensure-local-env.ts` with two generated development keys; merge your
  database lines and any keys from `.env.local.bak` into it.
- Discard everything: `git switch main && git branch -D cms/phase-2`.
- Apply only the security upgrade to `main`: `git switch main && git cherry-pick 00800fa && pnpm install`.
- `package-lock.json` was not touched and is now stale (section 4.9).
- Local data: `.data/` does not exist yet (it is created by backups, uploads and test runs; git-ignored).
  `.cms-baseline/` holds the parity snapshots (git-ignored); keep `static-before/` as the reference.
