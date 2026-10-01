# Preflight: run before starting the overnight CMS build

Do every step. If one fails, fix it before starting; a failed preflight wastes the night.

## A. Keep the PC awake
1. Settings → System → Power & battery → Screen and sleep:
   "When plugged in, put my device to sleep after" → **Never**. Keep the charger connected.
2. Settings → Windows Update → **Pause updates** for 1 week (stops overnight restarts).
3. Close apps using ports 3000, 3001 or 3100.

## B. Tools (run in Git Bash)
    node -v          # must be v22.x
    pnpm -v          # must be 10.x
    git --version
    claude --version
    pg_isready -h localhost -p 5432   # must say "accepting connections"
    psql --version                     # 17.x
    pg_dump --version                  # 17.x
If `pg_isready`, `psql` or `pg_dump` is "command not found": add `C:\Program Files\PostgreSQL\17\bin`
to the Windows **Path** (System Properties → Environment Variables), then close and reopen Git Bash.
Free disk space: at least 5 GB.

## C. Postgres service and databases
1. Press Win+R → `services.msc` → find **postgresql-x64-17** → Startup type **Automatic**, status **Running**.
2. Open **PowerShell** (not Git Bash; interactive psql misbehaves there) and connect as the superuser:

       & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost

3. Paste the following. Choose a long password with **letters and digits only**, so it needs no
   escaping in a URL:

       CREATE ROLE deeptsight_cms LOGIN PASSWORD 'REPLACE_WITH_LONG_ALPHANUMERIC_PASSWORD';
       CREATE DATABASE deeptsight_cms_dev     OWNER deeptsight_cms;
       CREATE DATABASE deeptsight_cms_test    OWNER deeptsight_cms;
       CREATE DATABASE deeptsight_cms_restore OWNER deeptsight_cms;
       \q

   The role is not a superuser and cannot create or drop databases. It owns only these three,
   so the agent cannot touch any other database on your machine.
4. Test it in Git Bash:

       psql "postgresql://deeptsight_cms:YOURPASSWORD@localhost:5432/deeptsight_cms_dev" -c "select 1"

   If your Postgres uses a port other than 5432, use that port here and in step F.

## D. Repository
1. `git status` must be clean. Commit or stash your own work first.
2. Write down the current commit: `git rev-parse --short HEAD` → ________
3. Confirm the context document exists at `docs/PROJECT_CONTEXT_FOR_CMS.md`
   (rename it, or edit the path in `docs/cms/00_OVERNIGHT_PROMPT.md`).
4. Copy all files from this plan into place.

## E. Make pushing impossible (hard guarantee, independent of Claude)
    git remote -v                                  # write the URLs down
    git remote set-url --push origin NO_PUSH_OVERNIGHT
Repeat for every remote listed. Test: `git push --dry-run` must fail.
Undo in the morning: `git remote set-url --push origin <original-url>`.

## F. Environment files
1. If `.env.local` (or `.env`) contains real Resend, Upstash or Turnstile keys, move it aside:

       mv .env.local .env.local.bak

   Without them the site simulates email, uses an in-memory rate limiter and Cloudflare test keys.
2. Create a new `.env.local` containing only these three lines (your password, your port):

       DATABASE_URI=postgresql://deeptsight_cms:YOURPASSWORD@localhost:5432/deeptsight_cms_dev
       DATABASE_URI_TEST=postgresql://deeptsight_cms:YOURPASSWORD@localhost:5432/deeptsight_cms_test
       DATABASE_URI_RESTORE=postgresql://deeptsight_cms:YOURPASSWORD@localhost:5432/deeptsight_cms_restore

   The agent adds its own generated local values below these. Merge your real keys back in the morning.

## G. Sanity build (catches problems before you sleep)
    pnpm install
    pnpm typecheck && pnpm build
Both must pass.

## H. Start
    claude --dangerously-skip-permissions
Paste:
    Read docs/cms/00_OVERNIGHT_PROMPT.md and follow it exactly. Start with Phase 0 now.

Watch for about 10 minutes, until Phase 0 is committed and Phase 1 starts installing packages. Then leave it.

Note: `--dangerously-skip-permissions` lets the agent run commands without asking, which is the
only way it can work unattended. The deny rules in `.claude/settings.local.json` are a second layer;
step E is the hard guarantee against pushing, and step C limits what it can do in Postgres.
If the session stops on a usage limit, run `claude --continue` in the morning. The agent resumes
from `docs/cms/PROGRESS.md`.