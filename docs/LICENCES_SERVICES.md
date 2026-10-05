# Licences & Third-Party Services Register

This register details all external services, keys, and licences required to operate the DeepTsight Consulting website.

## 1. External Services

| Service                 | Purpose                                                                                      | Cost                               | Key Rotation/Renewal                                           |
| ----------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| **Vercel**              | Frontend hosting and edge network. Executes the Server Actions and serves the static assets. | Vercel Pro / Hobby                 | Renewed via linked payment method on Vercel account.           |
| **Cloudflare**          | DNS hosting and Turnstile (bot mitigation for the enquiry form).                             | Free Tier                          | Turnstile keys do not expire, but should be rotated if leaked. |
| **Upstash (Redis)**     | Serverless Redis instance used strictly for IP-based rate limiting on the enquiry form.      | Free Tier / Pay-as-you-go          | Keys manage access to the Redis instance. Rotate if leaked.    |
| **Resend**              | Transactional email API used to dispatch form submissions to the DeepTsight team.            | Free Tier / Pro                    | API keys should be rotated annually or if leaked.              |
| **Plausible Analytics** | Privacy-focused, cookieless web analytics.                                                   | Paid subscription based on traffic | Renewed via Plausible account.                                 |

## 2. Environment Variables

To run the site in production, the following environment variables must be securely configured in the hosting environment (e.g., Vercel). With `NEXT_PUBLIC_ENV="production"`, every variable below except `NEXT_PUBLIC_ANALYTICS_DOMAIN` is required: `scripts/check-env.ts` fails the build if one is missing, if `NEXT_PUBLIC_SITE_URL` is not https, or if a Cloudflare test key is used. `.env.example` lists them all.

### Client-Side Variables

- `NEXT_PUBLIC_ENV="production"`: Strict flag enabling crawler access and activating placeholder protection mechanisms.
- `NEXT_PUBLIC_SITE_URL="https://deeptsight.com.au"`: Used for canonical URLs and sitemap generation.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: The public site key from Cloudflare Turnstile.
- `NEXT_PUBLIC_ANALYTICS_DOMAIN`: The domain registered in Plausible Analytics (e.g., `deeptsight.com.au`).

### Secret Server-Side Variables

_Never commit these values to the repository._

- `TURNSTILE_SECRET_KEY`: The secret key from Cloudflare Turnstile.
- `RESEND_API_KEY`: The production API key for Resend.
- `ENQUIRY_TO_EMAIL`: The recipient email address for enquiries (e.g., `enquiries@deeptsight.com.au`).
- `ENQUIRY_FROM_EMAIL`: The verified sender email address on Resend (e.g., `contact@deeptsight.com.au`).
- `UPSTASH_REDIS_REST_URL`: The REST URL for the Upstash Redis database.
- `UPSTASH_REDIS_REST_TOKEN`: The authentication token for the Upstash Redis database.

## 3. Fonts & Assets

- **Fonts:** Archivo, IBM Plex Sans, and IBM Plex Mono. These are downloaded once as WOFF2 files (`scripts/download-fonts.mjs`), committed to `public/fonts/` and self-hosted with `next/font/local`. They are licensed under the SIL Open Font License (OFL), permitting commercial use without royalty.
- **Icons:** Lucide React (`lucide-react`). Licensed under the ISC License, permitting commercial use.

## 4. CMS (Phase 2, branch `cms/phase-2`)

Added 1 October 2026. Everything below runs inside this application or on infrastructure the client
controls; none of it sends data to a third party. Payload telemetry is switched off in the config.

| Component                            | Version | Licence    | Purpose                                                        |
| ------------------------------------ | ------- | ---------- | -------------------------------------------------------------- |
| `payload`                            | 3.90.2  | MIT        | The CMS, running inside the Next.js app (`/admin`, `/api`)     |
| `@payloadcms/next`, `@payloadcms/ui` | 3.90.2  | MIT        | Admin interface and route handlers                             |
| `@payloadcms/db-postgres`            | 3.90.2  | MIT        | PostgreSQL adapter                                             |
| `@payloadcms/richtext-lexical`       | 3.90.2  | MIT        | Formatted text for Insights articles                           |
| `sharp`                              | 0.35.5  | Apache-2.0 | Image processing; strips metadata from uploads                 |
| `graphql`                            | 16.14.2 | MIT        | Required peer of Payload; GraphQL is disabled                  |
| `uqr`                                | 0.1.3   | MIT        | QR code for authenticator enrolment, drawn locally             |
| `undici` (override of Payload's pin) | 7.29.1  | MIT        | HTTP client inside Payload; patched version                    |
| PostgreSQL                           | 17      | PostgreSQL | Database. Local for development; production host to be decided |

**Services:** no new external service. The production database host and media storage are owner decisions
(U-2); whichever is chosen must be added to section 1 with its cost, region and renewal.

**Environment variables** (also in `.env.example`; names only, never values):

- `CONTENT_SOURCE`: `static` (default) or `cms`.
- `DATABASE_URI`: PostgreSQL connection for the CMS. Required in production and in `cms` mode; in production
  it must use `sslmode=require` or `sslmode=verify-full` unless the database is on the same host.
- `PAYLOAD_SECRET`: at least 32 random characters; signs CMS sessions.
- `MFA_ENCRYPTION_KEY`: 32 random bytes, base64; encrypts authenticator secrets at rest.
- `CMS_ADMIN_ENABLED`: production only; the admin answers 404 until it is `true`.
- `ENQUIRY_RETENTION_DAYS`: days to keep enquiries; unset means nothing is purged.
- `DATABASE_URI_TEST`, `DATABASE_URI_RESTORE`: development and tests only.
- `MEDIA_DIR` (optional): where uploaded files are stored; default `.data/media/<database name>`.
