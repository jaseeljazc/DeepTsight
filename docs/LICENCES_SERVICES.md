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

To run the site in production, the following environment variables must be securely configured in the hosting environment (e.g., Vercel):

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

- **Fonts:** Archivo, IBM Plex Sans, and IBM Plex Mono. These are self-hosted via `@fontsource` and are licensed under the SIL Open Font License (OFL), permitting commercial use without royalty.
- **Icons:** Lucide React (`lucide-react`). Licensed under the ISC License, permitting commercial use.
