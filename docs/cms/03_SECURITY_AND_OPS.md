# CMS security and operations spec

The site is a work sample for a security consultancy (`CLAUDE.md` §2). The admin is its first
authenticated surface. Default to deny; fail closed.

## 1. Exposure

- The admin lives at `/admin`; Payload's REST API at `/api`. GraphQL is disabled and has no routes.
- `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store` on `/admin/*` and `/api/*`.
- In production, `robots.txt` adds `Disallow: /admin` and `Disallow: /api` (D-13).
- Admin reachable from any network, protected by MFA (U-9 default; IP restriction is a morning question).

## 2. Users and authentication

- `users` collection: email, name, roles (multi-select: `editor`, `approver`), plus the MFA fields
  in section 3. The founder will hold both roles.
- Auth settings: max 5 login attempts with a 15-minute lock; token expiry 2 hours; cookies Secure
  (production), HttpOnly, SameSite=Strict; API keys off.
- No forgot-password email, no email adapter. Password reset is done with
  `scripts/cms/reset-admin-password.ts`.
- No self-registration: users `create` access is false through the API. Accounts are created only
  with `scripts/cms/create-admin.ts`. The create-first-user screen must not be usable when
  `NEXT_PUBLIC_ENV=production`; verify how this Payload version handles it and block it if needed.
- Login IP rate limit: reuse `src/lib/rate-limit.ts` in a `beforeLogin` hook, 10 attempts per 15
  minutes per hashed IP. Never store raw IPs in the CMS database.
- Admin avatar: no Gravatar. No external requests from the admin UI.

## 3. MFA (TOTP)

- First choice: a maintained Payload 3 TOTP plugin. Criteria: compatible with the installed version,
  released in the last 6 months, permissive licence, readable source, no network calls. Pin it exactly.
- Otherwise, build it in house with `otplib`:
  - The TOTP secret is encrypted at rest with AES-256-GCM using `MFA_ENCRYPTION_KEY`, and never sent
    to the client after enrolment.
  - Enrolment needs the password session plus a valid first code. It shows a QR code rendered locally
    (no external QR service).
  - 10 single-use recovery codes, stored hashed.
  - After a valid code, set a second cookie (HttpOnly, Secure, SameSite=Strict) holding an HMAC over
    user id, session issue time and expiry. Expiry is the same as the session.
  - The MFA verify endpoint is limited to 5 attempts per 5 minutes per user.
- Enforcement: one helper `isAdmin(req)` requires a user **and** a valid MFA cookie bound to that
  user. Every access function, the preview route, the inbox and custom endpoints use it. The admin UI
  redirects to the MFA screen when it is missing.
- Fail closed: if MFA cannot be completed tonight, the admin must return 404 when
  `NEXT_PUBLIC_ENV=production`. Put this in the morning report as urgent.

## 4. Field-level permissions

`verified`, `disclosureApproved`, `approvedForPublic`, legal `status` and `insightsEnabled` can only
be updated by users with the `approver` role and a valid MFA session. Editors see them read-only.

## 5. Audit log

- `audit-log` collection: at, userId, userEmail, action (create, update, delete, publish, unpublish,
  login, login-failed where a hook exists, mfa-enrolled, flag-change), collection, docId, field, from, to.
- Written only by server hooks through the Local API. API access: read for admins; create, update
  and delete false for everyone. No admin delete.
- Approval-flag changes always record from and to.
- Enquiry entries record id and action only, never personal data.

## 6. Headers and CSP

- The public CSP and headers stay exactly as they are (parity compares them byte for byte).
- Admin and API CSP, as a separate header rule:
  `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';
form-action 'self'; base-uri 'self'; object-src 'none'`.
  Add `'unsafe-eval'` only if the admin demonstrably fails without it, and log a D-entry.
- Header rules must not overlap. Verify which headers each path actually receives.

## 7. Enquiry inbox (FR-44, PRIV-09)

- Fields: name, workEmail, organisation, phone, enquiryTypeValue, enquiryTypeLabel (a copy taken at
  submission, so deleted types still display), message, consent (always true), submittedAt, read
  (default false), emailStatus (pending, sent, failed, simulated), emailError (short reason; never
  keys or responses containing secrets).
- Not stored: IP address, user agent, Turnstile token, honeypot value.
- No versions or drafts. Delete is a hard delete. API: create false (the Server Action uses the
  Local API); read, update (the `read` field only) and delete require `isAdmin`.
- Failure handling:
  - save fails → still try the email; if that also fails, show the existing error with the email address
  - save succeeds but the email fails → redirect to thank-you, set `emailStatus = failed`, and show a
    count of failed notifications in the admin (D-14)
- Retention: `ENQUIRY_RETENTION_DAYS` with the purge script. Unset means no purge, and the report says so.
- Deleted enquiries remain in database backups until those backups expire. State this in the report
  so the retention policy covers backups too.
- Do not change the privacy notice. Draft suggested wording in the morning report only.

## 8. Media uploads

- Allowed types: JPEG, PNG, WebP, AVIF. No SVG (script risk). Maximum 10 MB.
- Verify the real type by decoding with sharp; reject anything sharp cannot decode.
- Re-encode the original on upload: `sharp().rotate()`, same format, no metadata. This removes
  EXIF and GPS data. Generated sizes are also metadata-free.
- Storage: `.data/media` (git-ignored) in development. Production storage is a morning decision (U-2).
- Anonymous read: all files outside production. In production, only `approvedForPublic` files.
  Rights fields are hidden from anonymous reads through field access.

## 9. Rich text (Insights)

Render to React nodes only (SEC-07). Links: only `http`, `https`, `mailto` and internal paths;
external links get `rel="noopener noreferrer"`. No raw HTML node, no iframes, no embeds.

## 10. Secrets, env and database access

- New variables are added to the env rules and server schema (Phase 1). Errors name variables,
  never values. Nothing secret is logged, committed or written into reports.
- The app connects as a least-privilege role that owns only its own database. Never a superuser.
  Production uses the same pattern with a role created by the owner.
- Production connections require TLS (`sslmode=require` or `verify-full`) unless the database is on
  the same host (D-03).
- Connection strings are passed to `pg_dump` and `pg_restore` as process arguments from Node, never
  echoed to the terminal or written to logs.

## 11. Backups

- Development (Phase 12): `pg_dump --format=custom --no-owner`, stored in `.data/backups/` with a copy
  of the media directory. Restore is proven into the `_restore` database and verified by row counts.
- Production (morning item): daily automated `pg_dump` (or the host's managed backups), a copy stored
  off the database host, a retention period aligned with the enquiry retention rule, and one tested
  restore before go-live (`TECH_STACK.md` §4).

## 12. Dependency hygiene

Exact pins. `pnpm audit --prod` in Phase 14. Report high and critical findings with the affected package.
