# Data Flow & Privacy Documentation

This document outlines how data moves through the DeepTsight Consulting website, confirming strict adherence to privacy by design (PRIV-03, PRIV-05, PRIV-08).

## 1. Zero Database Persistence

The DeepTsight website operates completely statelessly.

- **No Database:** There is no database attached to the application.
- **No Stored Records:** User enquiry submissions are NEVER persisted in a database, CRM, or external storage bucket by the application.
- **Stateless Operation:** All submitted data exists in memory only for the fraction of a second required to perform server-side validation, rate-limiting, and email dispatch, before being garbage collected.

## 2. Enquiry Form Data Flow

When a user submits an enquiry at `/contact`:

1. **Client-Side Validation:** The data is validated in the browser using a shared Zod schema (`enquirySchema`).
2. **Spam Prevention (Turnstile & Honeypot):**
   - A Cloudflare Turnstile token is generated (this runs entirely client-side and communicates securely with Cloudflare).
   - An invisible "honeypot" field ensures automated bots fail instantly.
3. **Server Action Transmission:** Data is POSTed securely over HTTPS to the Next.js Server Action (`src/app/actions/enquiry.ts`).
4. **Server-Side Security Checks**, in this order:
   - The honeypot field must be empty.
   - The fields are validated with the shared Zod schema. Invalid submissions stop here and do not count against the rate limit.
   - The visitor's IP address is checked against a sliding-window rate limit (5 per hour per IP, 30 per hour overall) in Upstash Redis. The raw IP address is used as the key and expires with the one-hour window. The payload itself is NOT sent to Redis.
   - The server verifies the Turnstile token with Cloudflare. On the live site a submission without a token is refused, so the form needs JavaScript there (open question Q-11 in `TASKS.md`).
   - The server checks that at least 3 seconds passed between the Turnstile challenge (Cloudflare's own timestamp) and the submission.
5. **Email Dispatch:** The validated payload is formatted into plain-text and HTML emails and securely POSTed to the **Resend API**.
6. **Data Destruction:** The server responds to the client, and all variables holding the payload fall out of scope and are deleted from memory.

### Application Logging Protection

Strict rules (PRIV-08) govern the application logs. No user inputs (Names, Emails, Phone numbers, Company names, or Messages) are ever written to `console.log`, `console.error`, or error tracking payloads.

## 3. Analytics & Cookies

- **Cookieless Analytics:** The site uses **Plausible Analytics**. Plausible does not use cookies and does not track personal data. Therefore, the site does not require a GDPR/ePrivacy cookie consent banner.
- **Data Sanitization:** Event tracking (e.g., tracking form submissions) explicitly strips all text field data before sending events to the analytics server. Only non-identifiable action data (e.g., "Form Submitted Successfully") is tracked.

## 4. Third-Party Data Processors

The application communicates with the following external services during its operation:

1. **Cloudflare (Turnstile):** Processes IP and browser signals strictly for bot mitigation.
2. **Upstash (Redis):** Stores the visitor's IP address (as the rate-limit key) and request timestamps for up to one hour, strictly for rate limiting.
3. **Resend (Email API):** Receives the enquiry payloads strictly for the purpose of transmitting the email to the DeepTsight team.
4. **Plausible (Analytics):** Receives anonymous, aggregated pageview and event data.

## 5. Phase 2 (CMS): what is built, not yet live

Built on branch `cms/phase-2` (1 October 2026; `REQUIREMENTS.md` FR-38 changed, FR-44, PRIV-09). Sections 1 to 4
still describe the live site. The new behaviour applies only when the site runs with `CONTENT_SOURCE=cms`.
It must not go live until the privacy notice is updated and approved.

**Enquiry storage (FR-44).** The Server Action saves each valid enquiry to the CMS database before emailing it:

- **Stored:** name, work email, organisation, phone, the area of enquiry (value and the label shown), message,
  consent, time received, a read/unread flag, and how the email notification went (`pending`, `sent`,
  `failed`, `simulated`, plus a short reason code such as `email-not-configured`; never a response body).
- **Never stored:** IP address, user agent, CAPTCHA token, honeypot value.
- **Order:** honeypot → validation → rate limit → Turnstile → timing → save → email → record the email outcome.
  If the save works but the email fails, the visitor still sees the thank-you page and the record is flagged
  as failed in the admin. If neither works, the visitor is told to email instead.
- **Who can see it:** CMS accounts only, after a password and an authenticator code (MFA). Access is checked on
  every request. Anonymous API access is refused.
- **Deletion:** an admin can delete one or many enquiries; deletion is permanent (no versions are kept).
  Deleted enquiries remain in database backups until those backups expire.
- **Retention:** `ENQUIRY_RETENTION_DAYS` with `pnpm cms:purge-enquiries` deletes older enquiries. **Not set:
  nothing is purged until the owner decides the period (PRIV-04, U-17).** Backup retention must follow it.
- **Audit log:** saving an enquiry, marking it read and deleting it are logged with the record id and the
  action only, never personal data.

**Admin sign-in data.** CMS accounts (email, name, roles, password hash, encrypted authenticator secret,
hashed recovery codes, session records) and an audit log of sign-ins and changes are stored in the same
database. Sign-in attempts are rate-limited by a one-way hash of the IP address; raw IP addresses are not
stored in the CMS database. Editors receive session cookies (`payload-token`, `dts-mfa`; HttpOnly,
SameSite=Strict, Secure on https). Public visitors receive no cookies from the CMS; a visitor using draft
preview is always a signed-in editor.

**Media.** Uploaded images are re-encoded on upload with all metadata removed (EXIF, GPS position, camera
details), so a photograph cannot reveal where it was taken.

**Processors.** The database and media storage are on the client's own infrastructure; no new third-party
processor is added by the CMS. The production database host and its jurisdiction are still to be decided
(U-2) and must be added to section 4 when chosen.

**Before the inbox goes live:** the privacy notice must describe this storage, who can see it, how long it is
kept and how to request deletion (suggested wording is in `docs/cms/MORNING_REPORT.md`; the client's adviser
approves the final text); a retention period must be set; the database host must be listed above.
