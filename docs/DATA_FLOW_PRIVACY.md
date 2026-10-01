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
