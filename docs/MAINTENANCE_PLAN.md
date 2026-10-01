# Maintenance & Security Plan

This document outlines the required cadence and procedures for maintaining the stability, security, and performance of the DeepTsight Consulting website.

## 1. Dependency Management

The project relies on Node.js and external packages managed via `pnpm`.

**Cadence:** Monthly

**Procedure:**

1. Clone the repository and run `pnpm install` to ensure a clean slate.
2. Run `pnpm outdated` to identify packages with newer versions.
3. Update minor and patch versions safely: `pnpm update`
4. For major version bumps (e.g., Next.js, React), read the library's upgrade guide before bumping.
5. After updating, always run the full quality assurance suite (see below) to ensure no regressions.

## 2. Security Audits

The project has zero database persistence and collects no user analytics directly, minimizing attack surface. However, dependencies must remain secure.

**Cadence:** Monthly (or immediately upon critical CVE disclosure)

**Procedure:**

1. Run `pnpm audit` to check for known vulnerabilities in dependencies.
2. Resolve any `high` or `critical` vulnerabilities immediately by updating the affected packages.
3. Review security headers via [Security Headers](https://securityheaders.com) or [Mozilla Observatory](https://observatory.mozilla.org) to ensure the Content Security Policy (CSP) and HSTS remain strictly enforced.

## 3. Quality Assurance Validation

Before deploying any updates to content, styles, or dependencies, the following checks must pass locally. The deployment pipeline should also run these steps.

**Procedure:**

```bash
pnpm check:content    # Verifies no dummy placeholder text is shipping
pnpm typecheck        # Verifies TypeScript strict typings
pnpm lint             # Runs ESLint checks
pnpm test:a11y        # Runs Playwright Axe accessibility tests (must have 0 violations)
pnpm test:e2e         # Runs Playwright End-to-End functional tests
```

_Note: Any failure in the above commands indicates a regression that must be fixed before deploying._

## 4. Incident Escalation

In the event of a site outage or critical vulnerability:

- **Level 1 (Host/DNS Outage):** Verify Vercel / Cloudflare status pages.
- **Level 2 (Form Failure):** Verify Resend API status page. Check the application logs in the hosting dashboard.
- **Level 3 (Code Level Issue):** Revert the deployment to the last known working commit while the fix is engineered.
- **Primary Technical Contact:** [TBD - Insert Owner Name/Email]

## 5. CMS database: backup and restore

From Phase 2 the site has a PostgreSQL 17 database (the CMS content and the enquiry inbox) and a media
folder. Both must be backed up. The scripts below print file names and counts only, never connection
strings, passwords or content.

**Development (this machine).** Backups go to `.data/backups/` (git-ignored):

```bash
pnpm cms:backup                      # pg_dump --format=custom --no-owner of DATABASE_URI, plus a copy of its media folder
pnpm cms:restore --from .data/backups/<file>.dump --db DATABASE_URI_RESTORE
pnpm cms:verify-backup DATABASE_URI DATABASE_URI_RESTORE   # row counts per table must match
tsx scripts/cms/prove-backup.ts      # all three steps in one go
```

`restore.ts` refuses any database whose name does not end in `_test` or `_restore`. **Restoring the dev
or production database is a manual owner action**, deliberately not automated:

1. Stop the site (or put it in maintenance), so nothing writes during the restore.
2. Take a fresh backup of the current state first (`pnpm cms:backup`), in case the restore is wrong.
3. As the database owner, drop and recreate the `public` schema of the target database, then run
   `pg_restore --no-owner --exit-on-error --dbname=<target> <file>.dump` and copy the matching
   `<file>-media` folder over the target's media folder.
4. Run `pnpm cms:verify-backup` against a copy restored into `DATABASE_URI_RESTORE` to compare counts.
5. Start the site and check the admin and a few pages.

**Production (to be set up before go-live; owner decision U-2).**

- Daily automated backups: `pg_dump` from a scheduled job, or the database host's managed backups.
- **An off-machine copy:** a backup on the same host as the database is not a backup. Store a copy in a
  different location, encrypted at rest.
- Media files are backed up together with the database dump they belong to.
- Retention: follow the enquiry retention rule (PRIV-04). Deleted enquiries stay in backups until those
  backups expire, so the backup retention must not be longer than the agreed enquiry retention.
- One tested restore before go-live (`TECH_STACK.md` §4), then one at least every six months, recorded here.

**Enquiry retention.** `pnpm cms:purge-enquiries` deletes enquiries older than `ENQUIRY_RETENTION_DAYS`.
It deletes nothing until that variable is set (decision U-17). Schedule it daily once it is.

## 6. CMS accounts

- Accounts are created with `tsx scripts/cms/create-admin.ts --db DATABASE_URI --email <address>`; there is
  no sign-up. The script writes the password, authenticator key and recovery codes to a file in `.data/`.
  Move them to a password manager and delete the file.
- Lost password: `tsx scripts/cms/reset-admin-password.ts --db DATABASE_URI --email <address>` (add
  `--reset-mfa` only if the authenticator and the recovery codes are both lost).
- Review the audit log (Admin → System → Audit log) monthly for unexpected sign-ins or approval changes.
