# Content gaps

The website needs these facts and the founder sources (kept outside the repo in `../deeptsight-private/sources/`, CLAUDE.md §6) don't supply them, or supply
them in a form that can't be published yet. Until each one is resolved, its placeholder stays on
the site and the production build fails on it (`scripts/check-placeholders.ts`).

Sources checked (2026-09-30): `DeepTsight_founder_details.md` (source of truth: the founder's
reviewed answers), `Linkedin_profile_data.md`, `DeepTsight_Content_Reference_README.md`.
Items the founder file answered have been filled and removed from this list; see
`docs/CONTENT_PROVENANCE.md` for what went where.

## 1. Missing entirely

| #   | Needed                                                  | Where it shows                                                                           | Notes                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | **Website domain**                                      | Canonical URLs, sitemap, robots, OG image, JSON-LD, footer "Document" cell, security.txt | Not fixed yet. The enquiry email is `enquiries@deeptsight.com`, but the site is built for `deeptsight.com.au`. Once decided, replace the domain everywhere (grep `deeptsight.com.au`).                                      |
| 1.2 | Enquiry sender address                                  | Enquiry form emails (`ENQUIRY_FROM_EMAIL`)                                               | Still `contact@deeptsight.com.au`. It must be an address on a domain verified with the email provider, so it waits on 1.1.                                                                                                  |
| 1.3 | Credential numbers for CFS, CRAS, CDS, CMS and CAP®     | Credentials register                                                                     | All credentials are verified (2026-09-30) and each has a badge and a verification link. The founder file says only that the Expert has no number. If the others have none either, the placeholder becomes "Not applicable". |
| 1.4 | Anonymised project summaries with disclosure permission | Home, "Selected project notes" (2 slots)                                                 | Past projects are the founder's employers' work, not DeepTsight's. Any summary needs to be written and approved for DeepTsight use.                                                                                         |
| 1.5 | "Verified delivery" lines on the four service pages     | Each service page, evidence line                                                         | Currently `[PLACEHOLDER]`. They need approved wording that doesn't name clients or sites.                                                                                                                                   |
| 1.6 | Approved founder photograph and caption                 | About, home portrait                                                                     | The current image is a mock.                                                                                                                                                                                                |
| 1.7 | Company LinkedIn page                                   | Footer, contact, about, JSON-LD `sameAs`                                                 | Pending (FD:284). The founder's personal profile is linked until then.                                                                                                                                                      |
| 1.8 | Accessibility-feedback response time                    | Accessibility statement                                                                  | The founder file gives 1 business day for enquiries. Confirm whether the same applies to accessibility feedback.                                                                                                            |

## 2. Supplied, but needs confirming before it can be published

| #   | Item                                       | Issue                                                                                                                                                                                                           |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Mining employer name                       | The approved About text says **Hancock Iron Ore**; the founder file's timeline says **Roy Hill Iron Ore**. The site currently uses each where the founder file does (narrative and timeline). Confirm one name. |
| 2.2 | ATCO name                                  | The approved About text says **ATCO Power**; the timeline says **ATCO Australia**. Used as given in each. Confirm one name.                                                                                     |
| 2.3 | Master's award title                       | The About text says Master of Engineering (MEng); the education section says "Master Degree in Instrumentation Control and Automation". The register uses the second. Confirm the exact award title.            |
| 2.4 | "Cochin" in the About text                 | Founder-approved, so it is on the site. With "LNG regasification facility" it points to one facility, which CLAUDE.md §6 asks us to avoid. Confirm it can stay, or it becomes "in India".                       |
| 2.5 | ISA/IEC 62443 specialist badges (IC codes) | The resume lists IC32, IC33, IC34 and IC37 as specialist badges. These are ISA course codes, so they are left off the register. CRAS, CDS and CMS cover the specialist certificates.                            |

## 3. Deliberately left out

These are in the sources but won't go on the site:

- **Identifying details:** power station, project and facility names, pipeline specifications, and client and asset-owner names (CLAUDE.md §6).
- **Registered office address:** removed on the founder's instruction (FD:258).
- **Publications:** none exist; the section was removed on the founder's instruction (FD:252).
- **Personal details:** residential address, languages, the secondary-school record, grades (WAM, percentages, university rank) and personal skill tags.
- **Training courses:** ISA short courses and course codes, and the DOEACC PLC/SCADA/DCS certificate. These are training, not professional certifications.
- **Generic skill lists:** capability keywords with no named product or standard.
- **Marketing wording:** "leading vendors", "successful projects" and similar phrasing from the profile summary.
