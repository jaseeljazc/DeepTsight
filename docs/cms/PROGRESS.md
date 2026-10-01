# CMS overnight build: progress

Branch: `cms/phase-2` · Start commit: `b2092d6` (main) · Run started 2026-10-01

## Current state
- Current phase: 0 done; next Phase 1
- Last commit: `0f1d77a` cms(phase 0): add build plan
- Next step: Phase 1, install Payload (no migrations can be applied: B-1)

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

## Dev-database backups
None (no database access).
