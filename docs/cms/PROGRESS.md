# CMS overnight build: progress

Branch: `cms/phase-2` · Start commit: `b2092d6` (main) · Run started 2026-10-01

## Current state
- Current phase: 2 done (partial: no database); next Phase 3
- Last commit: see git log (cms(phase 2))
- Next step: Phase 3, content model changes in Zod and the static source

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
| CMS unit tests (`pnpm test:cms-unit`) | n/a | 11/11 |
| CMS E2E (`pnpm test:cms`) | n/a | 9 written, all skipped (B-1) |

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
