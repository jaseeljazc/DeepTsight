# Content model: Zod → Payload

The Zod schemas in `src/content/schema.ts` are the contract. Payload fields mirror them; mappers in
`src/content/mappers/*` turn Payload documents back into the exact Zod shapes. Where this file and
the Zod schema disagree on a type, the Zod schema wins; log a D-entry.

## Conventions

- All content collections and globals use `versions: { drafts: true, maxPerDoc: 25 }`.
  Exceptions: `enquiries`, `audit-log`, `users`, `enquiry-types` (no versions).
- **Publish guard:** a `beforeChange` hook runs the mapper and the Zod schema when `_status` becomes
  `published`, and turns Zod issues into Payload field errors. Drafts may be incomplete.
- Zod string arrays are Payload `array` fields with one `text` subfield. Mappers flatten them.
- Payload ids are numeric in SQLite. Keep each legacy string id (credential id, media id, proof id)
  as a unique `legacyId` text field, so `getFigures()` and other id-keyed outputs are unchanged.
- Ordering: a `sortOrder` number field (default 100), sorted ascending, then by title.
- Approval flags (`verified`, `disclosureApproved`, `approvedForPublic`, legal `status`,
  `insightsEnabled`) have field-level update access for the `approver` role only, and every change
  is written to the audit log (03, section 5).
- Canonicals are never editable. They are derived from the route or slug.
- Slugs: lowercase `^[a-z0-9-]+$`, unique, read-only once the document has been published (D-09).
- Every field gets a short plain-English admin description. Warnings from `CLAUDE.md` §6 go on the
  proof and media fields.

## Globals

| Global          | Maps to                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Tags               |
| --------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `site-settings` | `Site`                     | legalName, displayName, tagline, abn, address, phone, email, linkedIn, socialLinks[] (platform select + https URL), mapsUrl (https; host google.com/maps, maps.google.com, maps.app.goo.gl or goo.gl/maps), locationLabel, officeAddress group + showOfficeAddress, businessHours array (day, opens, closes, closed) + showBusinessHours, responseTime, serviceArea, navLabels (one label per fixed route; routes and order in code, D-07), ctaLabels, uiLabels (D-08), insightsEnabled | `site` (all pages) |
| `home`          | `HomeSource`               | hero (headline, supportingText, facts[]); trustStrip = relationship hasMany → credentials (replaces trustStripIds; order kept); media problems/why/close → media; coreCapabilitiesTitle/Intro; coreCapabilities[] (service relationship, title, outcome); whyDeepTsight; problemsAddressed; deliveryApproach; selectedProofTitle; selectedProof = relationship hasMany → proof-items; perthContext; finalCta; trustStripCopy (categoryLabels as one field per fixed category)           | `home`             |
| `about`         | `AboutContent`             | founder, narrative, principles[], media portrait/site/desk → media, timeline[]                                                                                                                                                                                                                                                                                                                                                                                                          | `about`            |
| `pages`         | `PagesContent`             | as in the schema, plus figure relationships for the services, credentials and contact pages                                                                                                                                                                                                                                                                                                                                                                                             | `pages`            |
| `seo`           | `SeoEntry` per fixed route | one group per fixed route (home, about, services, credentials, insights, contact, thank-you, three legal pages): title, description, ogImage?. Admin shows a length hint (title ≤ 60, description ≤ 160) but does not block.                                                                                                                                                                                                                                                            | `seo`              |

## Collections

| Collection            | Maps to                  | Fields and rules                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Tags                         |
| --------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `services`            | `Service`                | slug, title, shortTitle, summary, outcome, icon (select from `serviceIconNames`), challenge, whyItMatters, capability, scopeAndOutputs[] {scope, outputs[]}, deliveryApproach[] {step, title, description} with exactly 4 rows (the lamp animation supports 4; D-10), standards[], evidence (mirror the Zod type), relatedServices (relationship hasMany → services, excluding itself), media.hero/detail → media (required), seo {title, description}, enabled, sortOrder | `services`, `service:<slug>` |
| `credential-groups`   | `CredentialGroup` titles | category (select: qualifications, registrations, certifications, platforms; unique), title, sortOrder                                                                                                                                                                                                                                                                                                                                                                      | `credentials`                |
| `credentials`         | `Credential`             | legacyId, category (same select), title, issuer, identifier, year, expiry (text; validate a 4-digit pattern only if all existing data matches), url (https), badge → media (assetClass issuer-badge), verified (approver only), sortOrder                                                                                                                                                                                                                                  | `credentials`, `home`        |
| `proof-items`         | `ProofItem`              | legacyId, sector, challenge, outcome, metric, disclosureApproved (approver only), noIdentifyingDetailsConfirmed (checkbox, must be true to publish: "Contains no client, site or plant names")                                                                                                                                                                                                                                                                             | `home`                       |
| `media`               | `MediaAsset`             | upload (03, section 8), legacyId, alt (required unless decorative), decorative, caption, source, licence, usageRights, attribution, approvedForPublic (approver only), assetClass (photograph, illustration, issuer-badge); width and height automatic                                                                                                                                                                                                                     | `media`                      |
| `legal-pages`         | `LegalPage`              | slug (select: privacy, terms, accessibility; unique), title, lastUpdated (date), status (pending-adviser, approved; approver only), reference, sections[] {title, content}. Admin note: "Wording must come from the client's adviser."                                                                                                                                                                                                                                     | `legal:<slug>`, `seo`        |
| `enquiry-types`       | enquiry types            | value (slug pattern, unique, read-only after creation), label, enabled, sortOrder                                                                                                                                                                                                                                                                                                                                                                                          | `enquiry-types`              |
| `enquiries`           | inbox                    | see 03, section 7                                                                                                                                                                                                                                                                                                                                                                                                                                                          | none (never public)          |
| `articles` (Phase 13) | `Article`                | slug, title, summary, body (Lexical with restricted features: H2, H3, bold, italic, links, ordered and unordered lists, blockquote; no raw HTML, no embeds), categories (relationship hasMany → article-categories; mapped to `tags`), publishedAt (set on first publish), readingMinutes (computed from word count at 220 wpm), seo {title, description}                                                                                                                  | `articles`, `article:<slug>` |
| `article-categories`  | tags                     | name, slug                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `articles`                   |
| `users`, `audit-log`  | system                   | see 03                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | none                         |

## Tag map (what revalidates what)

| Change in                      | Tags                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| site-settings                  | `site` (every page: shared header and footer)                                                   |
| services                       | `services`, `service:<slug>`, old slug if changed (every page: header and footer list services) |
| credentials, credential-groups | `credentials`, `home`                                                                           |
| proof-items, home              | `home`                                                                                          |
| about                          | `about`                                                                                         |
| pages                          | `pages`                                                                                         |
| seo                            | `seo`                                                                                           |
| legal-pages                    | `legal:<slug>`, `seo`                                                                           |
| media                          | `media` (every getter that resolves figures)                                                    |
| enquiry-types                  | `enquiry-types`                                                                                 |
| articles, article-categories   | `articles`, `article:<slug>`                                                                    |

Every adapter getter declares the tags of everything it reads.

## Admin navigation groups

- Website content: site settings, home, about, pages, SEO
- Services and proof: services, proof items
- Credentials: credentials, credential groups
- Media
- Insights
- Enquiries: inbox, enquiry types
- System: users, audit log
