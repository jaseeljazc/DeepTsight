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
