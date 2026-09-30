# REQUIREMENTS.md

Every requirement is testable. Each has an ID so tasks, commits and QA can reference it.
Priority: **M** must have for launch · **S** should have · **C** could have · **W** won't have this phase.

---

## 1. Functional requirements

### 1.1 Global

| ID    | Requirement                                                                                                                                  | Pri |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-01 | Every page renders statically at build time. No client-side data fetching on any route.                                                      | M   |
| FR-02 | Persistent header with wordmark, primary nav (Home, About, Services, Credentials, Insights, Contact) and a visually distinct enquiry action. | M   |
| FR-03 | Current section indicated in nav by an active state that is not colour-only (underline + `aria-current="page"`).                             | M   |
| FR-04 | Mobile navigation opens from a button, traps focus, closes on Escape and on route change, and restores focus to the trigger.                 | M   |
| FR-05 | Footer with four columns: services, company, contact, legal/LinkedIn. Includes ABN and copyright.                                            | M   |
| FR-06 | Skip-to-content link, first in tab order, visible on focus.                                                                                  | M   |
| FR-07 | Breadcrumbs on all pages two or more levels deep (service child pages, articles).                                                            | M   |
| FR-08 | Custom 404 with orientation and links back to Home, Services, Contact.                                                                       | M   |
| FR-09 | No interstitials, modals, exit-intent or newsletter pop-ups anywhere on the site.                                                            | M   |
| FR-10 | Site-wide search.                                                                                                                            | W   |

### 1.2 Home

| ID    | Requirement                                                                                                                                    | Pri |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-11 | Renders the nine sections in the order given in `PROJECT.md` §7.                                                                               | M   |
| FR-12 | Hero contains exactly one primary CTA and at most one secondary.                                                                               | M   |
| FR-13 | Trust strip renders only items marked `verified: true` in the credentials data; unverified items are omitted from the build.                   | M   |
| FR-14 | Capability section links to each of the four service child pages.                                                                              | M   |
| FR-15 | "Selected proof" renders only entries with `disclosureApproved: true`. If none exist, the section is omitted entirely rather than shown empty. | M   |

### 1.3 Services

| ID    | Requirement                                                                                                                 | Pri |
| ----- | --------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-16 | `/services` lists all four pillars with outcome-focused summaries and links to child pages.                                 | M   |
| FR-17 | Child pages are generated from the `Service` content model via one template component implementing the nine-part structure. | M   |
| FR-18 | Each child page ends with a "Related services" block linking to the other three, and an enquiry CTA.                        | M   |
| FR-19 | Adding a fifth service requires only a new data entry — no new route file, no template edit.                                | M   |

### 1.4 Credentials

| ID    | Requirement                                                                                                            | Pri |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | --- |
| FR-20 | Credentials grouped by category: qualifications, registrations, certifications, publications, platforms and standards. | M   |
| FR-21 | Each item carries issuer, identifier, status and (where relevant) expiry. Expired items do not render.                 | M   |
| FR-22 | Build fails if any credential entry lacks `verified: true` while `NEXT_PUBLIC_ENV=production`.                         | M   |
| FR-23 | Publications link to a DOI or publisher page where approved.                                                           | S   |
| FR-24 | Downloadable capability profile (PDF).                                                                                 | C   |

### 1.5 Insights

| ID    | Requirement                                                                                                       | Pri |
| ----- | ----------------------------------------------------------------------------------------------------------------- | --- |
| FR-25 | `/insights` lists articles newest first with title, date, reading time and summary.                               | M   |
| FR-26 | Articles authored as MDX in Phase 1; article route is content-source agnostic.                                    | M   |
| FR-27 | If zero published articles exist at launch, `/insights` is removed from nav and returns 404 (single config flag). | M   |
| FR-28 | Tag or category filtering.                                                                                        | C   |
| FR-29 | RSS feed at `/insights/rss.xml`.                                                                                  | S   |

### 1.6 Contact and enquiry form

| ID    | Requirement                                                                                                                                                                                                    | Pri |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-30 | Fields: name*, work email*, organisation, phone, enquiry type (select), message*, consent checkbox*. Nothing else. No field collects sensitive or operational detail.                                          | M   |
| FR-31 | Submission handled by a Server Action. The form works without JavaScript via progressive enhancement.                                                                                                          | M   |
| FR-32 | Validation runs server-side with the same Zod schema used client-side. Client validation never the only gate.                                                                                                  | M   |
| FR-33 | Errors appear inline, adjacent to the field, in text and via `aria-describedby`; an error summary at the top of the form receives focus on failed submit.                                                      | M   |
| FR-34 | Successful submission redirects to `/contact/thank-you` stating what happens next.                                                                                                                             | M   |
| FR-35 | Spam protection: honeypot field + minimum-time check + CAPTCHA (see SEC-08). No user-visible puzzle unless the other two are insufficient.                                                                     | M   |
| FR-36 | Rate limiting on the action: 5 submissions per IP per hour, 30 per hour globally. Exceeding returns a friendly error, not a stack trace.                                                                       | M   |
| FR-37 | Submission delivered by transactional email to the configured address, with a plain-text fallback body. Delivery failure is logged and shown to the user as a recoverable error with the direct email address. | M   |
| FR-38 | No enquiry content is persisted to a database in Phase 1. Email is the system of record.                                                                                                                       | M   |
| FR-39 | Privacy notice link adjacent to the submit button stating what is collected and why.                                                                                                                           | M   |
| FR-40 | CRM integration.                                                                                                                                                                                               | W   |

---

## 2. Content requirements

| ID    | Requirement                                                                                                                                                    | Pri |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| CR-01 | All content validated against Zod schemas at build time. Invalid content fails the build.                                                                      | M   |
| CR-02 | Unapproved content renders as a visibly marked placeholder in non-production and fails the production build.                                                   | M   |
| CR-03 | No page ships with fewer than the sections its template defines, unless the section is explicitly optional and omitted.                                        | M   |
| CR-04 | Every image has documented source, licence, usage rights and attribution recorded in `content/source/media.ts`. Images without a rights record fail the build. | M   |
| CR-05 | No client, site, plant, network or vulnerability detail appears in any content file, alt text, filename or commit message.                                     | M   |

---

## 3. Accessibility requirements — WCAG 2.2 Level AA

| ID      | Requirement                                                                                                                                                                | WCAG          |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| A11Y-01 | Every page conforms to WCAG 2.2 AA. Zero axe-core violations on all routes in CI.                                                                                          | —             |
| A11Y-02 | Text contrast ≥ 4.5:1; large text (≥24px, or ≥18.66px bold) ≥ 3:1. Verified against the table in `DESIGN.md` §3.5.                                                         | 1.4.3         |
| A11Y-03 | UI component and graphical object contrast ≥ 3:1 — includes input borders, button outlines, focus rings, icons conveying meaning.                                          | 1.4.11        |
| A11Y-04 | Content reflows without horizontal scrolling at 320px width and at 400% zoom.                                                                                              | 1.4.10        |
| A11Y-05 | Text spacing can be overridden (line-height 1.5×, paragraph spacing 2×, letter-spacing 0.12em, word-spacing 0.16em) with no loss of content.                               | 1.4.12        |
| A11Y-06 | All functionality operable by keyboard; no traps.                                                                                                                          | 2.1.1, 2.1.2  |
| A11Y-07 | Focus indicator visible, not obscured by sticky header or footer, minimum 2px perimeter.                                                                                   | 2.4.7, 2.4.11 |
| A11Y-08 | Focus order follows reading order; DOM order matches visual order.                                                                                                         | 2.4.3         |
| A11Y-09 | Pointer targets at least 24×24 CSS px by WCAG; **project standard is 44×44**.                                                                                              | 2.5.8         |
| A11Y-10 | Unique, descriptive `<title>` and exactly one `<h1>` per page; heading levels never skip.                                                                                  | 2.4.2, 1.3.1  |
| A11Y-11 | Link text meaningful out of context. No "click here", "read more" without an accessible name extension.                                                                    | 2.4.4         |
| A11Y-12 | All form controls have visible, programmatically associated labels; required fields marked in text as well as symbol; autocomplete attributes set on personal-data fields. | 3.3.2, 1.3.5  |
| A11Y-13 | Errors identified in text and describe how to fix.                                                                                                                         | 3.3.1, 3.3.3  |
| A11Y-14 | No information conveyed by colour alone.                                                                                                                                   | 1.4.1         |
| A11Y-15 | Images: informative images have equivalent alt text; decorative have `alt=""`; no text embedded in images.                                                                 | 1.1.1, 1.4.5  |
| A11Y-16 | `prefers-reduced-motion: reduce` disables all non-essential motion.                                                                                                        | 2.3.3         |
| A11Y-17 | `lang="en-AU"` on `<html>`.                                                                                                                                                | 3.1.1         |
| A11Y-18 | Landmarks used correctly: one `banner`, one `main`, one `contentinfo`, `nav` labelled where multiple exist.                                                                | 1.3.1         |
| A11Y-19 | Help mechanism (contact link) in the same relative position across pages.                                                                                                  | 3.2.6         |
| A11Y-20 | Manual review completed: keyboard walkthrough, focus order, screen-reader pass (NVDA + VoiceOver), 200% zoom, Windows High Contrast.                                       | —             |
| A11Y-21 | Accessibility statement published at `/legal/accessibility` describing conformance, known limitations and a feedback route.                                                | —             |

Automated testing catches roughly a third of issues. A11Y-20 is not optional.

---

## 4. SEO and structured content

| ID     | Requirement                                                                                                                                                                                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEO-01 | One clear search intent and a unique `<title>` and meta description per page, defined in content data, not hardcoded in components.                                                                                                                                    |
| SEO-02 | Descriptive, lowercase, hyphenated URLs. No dates, IDs or query parameters in canonical paths.                                                                                                                                                                         |
| SEO-03 | Canonical URL on every page.                                                                                                                                                                                                                                           |
| SEO-04 | JSON-LD, only where accurate: `Organization` and `LocalBusiness` (site-wide), `Person` (About), `Service` (each service page), `Article` (insights), `BreadcrumbList` (nested pages). No `Review`, `AggregateRating` or `FAQPage` unless the content genuinely exists. |
| SEO-05 | Open Graph and Twitter card metadata with a controlled 1200×630 preview image.                                                                                                                                                                                         |
| SEO-06 | `sitemap.xml` generated at build from the route and content manifest, with accurate `lastModified`.                                                                                                                                                                    |
| SEO-07 | `robots.txt` appropriate to environment. Preview and staging fully disallowed and `noindex`.                                                                                                                                                                           |
| SEO-08 | Service copy is substantive and unique per page. No thin pages, no keyword repetition, no near-duplicate service text.                                                                                                                                                 |
| SEO-09 | Perth and Western Australia context included naturally where it supports the proposition, not stuffed.                                                                                                                                                                 |
| SEO-10 | Redirect map produced and implemented if any existing URLs change (OPEN-14).                                                                                                                                                                                           |
| SEO-11 | Semantic HTML: headings describe structure, lists are lists, tables have `<caption>` and `<th scope>`.                                                                                                                                                                 |

---

## 5. Performance

Budgets apply to the four representative pages: Home, a service child page, Credentials, Contact.
Measured on Lighthouse mobile (Moto G Power class, 4× CPU throttle, Slow 4G) and on a real mid-range
Android device before sign-off.

| ID      | Metric                                                                                            | Budget                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| PERF-01 | Largest Contentful Paint                                                                          | ≤ 2.0 s                                                                                                                  |
| PERF-02 | Interaction to Next Paint                                                                         | ≤ 150 ms                                                                                                                 |
| PERF-03 | Cumulative Layout Shift                                                                           | ≤ 0.05                                                                                                                   |
| PERF-04 | Time to First Byte                                                                                | ≤ 600 ms                                                                                                                 |
| PERF-05 | Lighthouse Performance                                                                            | ≥ 95 mobile, ≥ 98 desktop                                                                                                |
| PERF-06 | Lighthouse Accessibility / Best Practices / SEO                                                   | 100                                                                                                                      |
| PERF-07 | Initial JavaScript, compressed                                                                    | ≤ 100 kB per route                                                                                                       |
| PERF-08 | Total page weight                                                                                 | ≤ 600 kB Home, ≤ 450 kB others                                                                                           |
| PERF-09 | Web fonts                                                                                         | ≤ 5 files, all self-hosted, subset to latin + latin-ext, WOFF2, `font-display: swap`, preloaded for above-the-fold faces |
| PERF-10 | Images                                                                                            | AVIF with WebP fallback, explicit width/height or aspect-ratio, lazy below the fold, `priority` only on the hero         |
| PERF-11 | Third-party requests                                                                              | ≤ 1 (analytics). Zero third-party fonts, tag managers or embeds                                                          |
| PERF-12 | Static assets served with immutable, long-lived cache headers; HTML revalidated                   |
| PERF-13 | No layout shift from font swap — metric-compatible fallbacks via `next/font` `adjustFontFallback` |
| PERF-14 | Budgets enforced in CI; a regression fails the build                                              |

---

## 6. Security, privacy and hosting

Because DeepTsight sells OT cybersecurity, the site itself is evidence of practice.

### 6.1 Transport and hosting

| ID     | Requirement                                                                                                                                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-01 | HTTPS everywhere, TLS 1.2 minimum (1.3 preferred), automated certificate renewal with expiry monitoring.                                                                      |
| SEC-02 | HTTP → HTTPS redirect; HSTS `max-age=63072000; includeSubDomains; preload`.                                                                                                   |
| SEC-03 | Zero mixed content. Verified at launch.                                                                                                                                       |
| SEC-04 | Apex and `www` both resolve; one canonical, the other redirects 301.                                                                                                          |
| SEC-05 | DNS: DNSSEC enabled where the registrar supports it. SPF, DKIM and DMARC records configured for the sending domain (`p=reject` once monitored), plus a null MX or correct MX. |

### 6.2 Application

| ID     | Requirement                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-06 | Security headers: strict `Content-Security-Policy` (no `unsafe-inline` for scripts; nonce-based), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` / `frame-ancestors 'none'`, `Permissions-Policy` denying camera, microphone, geolocation, payment, USB. Target: A+ on Mozilla Observatory and securityheaders.com. |
| SEC-07 | All input validated and typed server-side. Output escaped by default; no `dangerouslySetInnerHTML` on anything but build-time-compiled MDX.                                                                                                                                                                                                                                         |
| SEC-08 | Enquiry form protected by honeypot, timing check, Cloudflare Turnstile and rate limiting (FR-36).                                                                                                                                                                                                                                                                                   |
| SEC-09 | Server Actions restricted by origin; no action accepts arbitrary object input.                                                                                                                                                                                                                                                                                                      |
| SEC-10 | No secrets in the repository or client bundle. Env vars validated at boot; the build fails on a missing required var. Only `NEXT_PUBLIC_*` reaches the browser, and no `NEXT_PUBLIC_*` var holds a secret.                                                                                                                                                                          |
| SEC-11 | Dependencies: pinned via lockfile, `pnpm audit` clean of high and critical at release, Dependabot or Renovate enabled, no package with a known-unmaintained status.                                                                                                                                                                                                                 |
| SEC-12 | `/.well-known/security.txt` published with a contact address and policy link.                                                                                                                                                                                                                                                                                                       |
| SEC-13 | No source maps exposed in production; no directory listing; no framework or server version disclosure in headers.                                                                                                                                                                                                                                                                   |
| SEC-14 | Error pages never reveal stack traces, file paths, dependency versions or environment values.                                                                                                                                                                                                                                                                                       |
| SEC-15 | Pre-launch security review completed and findings remediated or formally accepted. Evidence attached to handover.                                                                                                                                                                                                                                                                   |

### 6.3 Administration

| ID     | Requirement                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| SEC-16 | MFA enforced on every account with production access: registrar, DNS, hosting, email, repository, analytics. |
| SEC-17 | Named administrator roles with least privilege. No shared logins. Default and unused accounts removed.       |
| SEC-18 | Production deploys only from the protected `main` branch via CI. No manual deploy from a laptop.             |
| SEC-19 | Access and ownership register delivered at handover, listing every account, owner, role and renewal date.    |
| SEC-20 | Auditability: deploy history retained; DNS and hosting changes attributable to a named person.               |

### 6.4 Privacy

| ID      | Requirement                                                                                                                                                                                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRIV-01 | Collect only what the enquiry needs (FR-30). No tracking cookies, no fingerprinting, no session recording, no heatmaps.                                                                                                                                                      |
| PRIV-02 | Privacy notice published and linked from the footer and the form. Covers what is collected, purpose, who processes it, where it is stored, retention period and how to request access or deletion.                                                                           |
| PRIV-03 | Data flow mapped and documented: form fields → Server Action → email provider → recipient inbox. Every processor named with its jurisdiction.                                                                                                                                |
| PRIV-04 | Retention decision recorded for enquiry emails (proposed: 24 months, then delete). TBD — CLIENT.                                                                                                                                                                             |
| PRIV-05 | If the analytics choice is cookieless and collects no personal information, no consent banner is required. If any tool needing consent is later added, a compliant consent mechanism must be added with it. Default position: stay cookieless and have no banner.            |
| PRIV-06 | Alignment with the Australian Privacy Act 1988 and the Australian Privacy Principles. Note: a small business operator may fall under an exemption, but the site will meet APP expectations regardless. Wording of the privacy policy to be approved by the client's adviser. |
| PRIV-07 | Third-party data processors kept to the minimum needed: email delivery, hosting, CAPTCHA, analytics. Each listed in the privacy notice.                                                                                                                                      |
| PRIV-08 | No personal data in logs. Form field contents are never written to application logs or error-tracking payloads.                                                                                                                                                              |

### 6.5 Monitoring and maintenance

| ID     | Requirement                                                                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OPS-01 | Uptime monitoring on the homepage and a synthetic form-submission check, alerting a named contact.                                                            |
| OPS-02 | Certificate expiry, domain expiry and DNS change monitoring.                                                                                                  |
| OPS-03 | Source of truth is the Git repository; deployment is reproducible from a clean clone. Backup and rollback procedure documented and tested once before launch. |
| OPS-04 | Maintenance plan covering dependency updates, security patches, content updates, review cadence and named owners.                                             |
| OPS-05 | Incident contact and escalation path documented at handover.                                                                                                  |

---

## 7. Analytics and measurement

Privacy-conscious, limited to what improves the site. Events, not page-view vanity metrics.

| ID    | Event                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------- |
| AN-01 | Enquiry form: started, submitted, succeeded, failed. Completion rate derivable.                       |
| AN-02 | Form validation errors by field name. **Field contents are never captured.**                          |
| AN-03 | Clicks on email, phone and LinkedIn actions.                                                          |
| AN-04 | Primary and secondary CTA engagement, with the source section identified.                             |
| AN-05 | Visits to service and credentials pages.                                                              |
| AN-06 | Engagement with approved downloadable material, if any ships.                                         |
| AN-07 | Traffic source and search landing-page performance.                                                   |
| AN-08 | Tool, consent requirements, retention and reporting ownership agreed before implementation (OPEN-08). |

---

## 8. Browser and device support

| Tier               | Targets                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Full support       | Latest two versions of Chrome, Edge, Firefox, Safari (macOS and iOS), Samsung Internet                     |
| Functional support | Any browser from the last four years — layout may simplify, all content and functionality remain available |
| Screen sizes       | 320px to 2560px, tested at 360 / 768 / 1024 / 1280 / 1920                                                  |
| Assistive tech     | NVDA + Firefox, VoiceOver + Safari (macOS and iOS), keyboard-only, Windows High Contrast                   |

No JavaScript: all content readable, all navigation usable, enquiry form functional via progressive enhancement.
