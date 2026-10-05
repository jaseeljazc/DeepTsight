# Overnight CMS build: operating instructions

You are running unattended overnight on Windows (Git Bash). Nobody will answer questions
until morning. Your job: build the Phase 2 CMS described in `docs/cms/01_BUILD_PLAN.md`,
keep the public site working at every commit, and leave a clear morning report.

## Read first, in this order

1. `CLAUDE.md` (all rules still apply; §2 and §6 especially)
2. `docs/PROJECT_CONTEXT_FOR_CMS.md` (the CMS planning context; §7.4 governs scope)
3. `docs/cms/01_BUILD_PLAN.md`, `02_CONTENT_MODEL.md`, `03_SECURITY_AND_OPS.md`, `04_DECISIONS_DEFAULTS.md`
4. `REQUIREMENTS.md` FR-41 to FR-45 and PRIV-09; `docs/PROJECT_CODE_AUDIT.md` (skim)
5. `src/content/schema.ts`, `src/content/index.ts`, `src/content/source/*`
   `DESIGN.md` is not in this repo. Read the copy at `../deeptsight-website/DESIGN.md` (read-only).
   That is the only path outside this repository you may read. Never read `../deeptsight-private/`.

## Hard rules

1. **Never ask, never wait.** When a choice is needed, pick the option that is (a) more secure,
   (b) easier to reverse, (c) closer to the documented plan, in that order. Log it as a new
   `D-xx` entry in `04_DECISIONS_DEFAULTS.md` and continue.
2. **Nothing leaves this machine.** No `git push`, no remote or git config changes, no deploys,
   no package publishing, no uploading code or content to any website or service. Network use
   is limited to installing packages from the npm registry and reading official documentation
   (payloadcms.com, nextjs.org, github.com/payloadcms). Set Payload telemetry off.
3. **No real external services.** Run every build, server and test command with these overrides:
   `RESEND_API_KEY= UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN=`.
   Never read `.env`, `.env.local.bak` or `.env.production*`.
4. **Database.** Local PostgreSQL 17, already set up by the owner. `.env.local` provides
   `DATABASE_URI` (dev), `DATABASE_URI_TEST` and `DATABASE_URI_RESTORE`, all as role `deeptsight_cms`.
   - Use only these three databases. Never connect as `postgres` and never try to create databases or roles.
   - Never print, log or commit a connection string or password. In reports and logs, refer to the
     variable names only.
   - Destructive resets (dropping and recreating the `public` schema) are allowed **only** on
     databases whose name ends in `_test` or `_restore`. The reset script must check the name and
     refuse otherwise. The dev database is changed only through Payload migrations and the import script.
   - Never append to `.env.local` by printing its contents. Add missing keys with a Node script that
     reads the file, appends only absent keys, and prints only the key names.
   - If a database is unreachable, record it as a phase blocker and continue with any phase that
     does not need the database.
5. **Never weaken security.** The public CSP and security headers must stay byte-identical
   (the parity check compares them). Approval gates, enquiry privacy rules and `CLAUDE.md` §2/§6 stand.
6. **Do not change:** legal and privacy-notice wording, design tokens (`globals.css`), the enquiry
   form's fields, or the public visual design. If a phase seems to need one of these, put it in the morning report.
7. **No real data in fixtures or tests.** Use `example.com` addresses and names like "Test Editor".
   No client, site, plant or network details anywhere.
8. **Git.** Create branch `cms/phase-2` from the current HEAD. Commit at the end of every phase as
   `cms(phase N): <summary>` (more commits within a phase are fine). Never rewrite history.
   Never commit `.data/`, `.cms-baseline/`, `.env*` (except `.env.example`) or any secret.
9. **Dependencies.** pnpm only; do not edit `package-lock.json` (note it in the report). Pin exact
   versions. Record every new dependency (name, version, purpose, licence) in the report and in
   `docs/LICENCES_SERVICES.md`. Prefer no new dependency over a small one.
10. **Stay green.** After every phase: `pnpm typecheck && pnpm lint && pnpm build` plus the tests
    named in that phase. Run the full suite at Phases 6, 9 and 14.
11. **Failure rule.** If a phase cannot be made green after 3 real fix attempts (or about 90 minutes),
    revert its commits with `git revert` (or `git stash` uncommitted work), record the exact error
    in `PROGRESS.md`, and continue with the next phase whose dependencies are met. If the reverted
    phase had applied migrations to the dev database, restore the dev database from the backup taken
    at the start of that phase (see `01_BUILD_PLAN.md`, "Database safety").
12. **Phase stop conditions** (stop that phase, keep the run going): it needs a real secret or
    account; it needs an owner decision about public wording, legal text or privacy; it would
    weaken security; it would delete data you did not create.
13. **Whole-run stop:** only if the repository is damaged and `git revert` cannot restore it.
    Then write the report and stop.
14. **Config keys and CLI flags:** where this plan names a Payload or Next.js option, verify it against
    the installed package's TypeScript types and `--help` output. The installed version wins over this
    document. Any CLI command that might prompt must be run with its non-interactive flags. An
    interactive prompt blocks the whole night.

## Windows notes

- Write every script as TypeScript run with `tsx`, never bash. Use `path.join`, not hard-coded slashes.
- Avoid background processes in Git Bash. Start servers through Playwright's `webServer`, or spawn
  `node node_modules/next/dist/bin/next start -p <port>` directly from a Node script (one process
  to kill, not a pnpm wrapper). Use port 3100 for parity snapshots.
- `psql`, `pg_dump` and `pg_restore` are on PATH. Pass connections as
  `--dbname="$DATABASE_URI"`-style arguments from Node (`child_process` with an args array),
  never by echoing the URL.
- Media files and backups live in `.data/` (git-ignored).

## Progress and memory

Keep `docs/cms/PROGRESS.md` up to date: current phase, last commit hash, next step, open problems,
baseline and current test counts, and the latest dev-database backup file. Update it after every
phase and before any long command. After context compaction, or when resuming, re-read
`PROGRESS.md` and `01_BUILD_PLAN.md` first.

## Order and priority

Follow the phase order in `01_BUILD_PLAN.md`. Tier A (Phases 0 to 9) matters most, then Tier B
(10 to 12), then Tier C (13). Always leave enough capacity for Phase 14 (documentation and report).

## Finish

Write `docs/cms/MORNING_REPORT.md` from `05_MORNING_REPORT_TEMPLATE.md`. Make the final commit.
Make sure no server is left running. End with the report path as your last message.
