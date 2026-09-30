# Content gaps

The website needs these facts and the sources in `docs/sources/` don't supply them, or supply
them in a form that can't be published yet. Until each one is resolved, its placeholder stays on
the site and the production build fails on it (`scripts/check-placeholders.ts`).

Sources checked (2026-09-29): `Linkedin_profile_data.md`, `DeepTsight_Content_Reference_README.md`.

## 1. Missing entirely

| #   | Needed                                                                              | Where it shows                               | Notes                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ~~Founding year~~                                                                   | —                                            | **Resolved 2026-09-29:** 2026, from the user.                                                                                                              |
| 2   | ABN (11-digit Australian Business Number; the company will also have a 9-digit ACN) | Footer title block, legal pages              | `site.ts` → `abn`. Find it at abr.business.gov.au or ask the founder's accountant.                                                                         |
| 3   | CPEng registration number                                                           | Credentials register                         | Engineers Australia issued it July 2024, but no number is given. The register exists so a buyer can look it up.                                            |
| 4   | Credential IDs for CAP® and the ISA/IEC 62443 certificates                          | Credentials register                         | Badge links are supplied, but not which badge belongs to which certificate (see 2.4).                                                                      |
| 5   | Issue dates for CRAS, CDS and CMS                                                   | Credentials register                         | Only Expert (July 2026) and CFS (May 2026) have dates.                                                                                                     |
| 6   | Publication details: title, venue, year, authors, DOI                               | Credentials → publications, home trust strip | The site has a slot for a "RAMS symposium paper". Neither source mentions any publication. Confirm whether one exists. If not, the slot should be removed. |
| 7   | Engineering tools (software)                                                        | Credentials → platforms                      | The sources name hardware and platform vendors but no tools.                                                                                               |
| 8   | Service area (Perth only, WA, national, overseas?)                                  | Home, "Based in Perth" section (OPEN-03)     | Sectors are in the sources. Geography isn't.                                                                                                               |
| 9   | Anonymised project summaries with disclosure permission                             | Home, "Selected proof" (2 slots)             | The README says past projects are the founder's experience, not DeepTsight's. Any summary needs to be written and approved for DeepTsight use.             |
| 10  | Approved founder photograph and caption                                             | About, home portrait                         | The current image is a mock.                                                                                                                               |
| 11  | Company LinkedIn page, if there is one                                              | Footer, JSON-LD `sameAs`                     | Only the personal profile is in the sources.                                                                                                               |

## 2. Supplied, but needs confirming before it can be published

| #   | Item                                | Issue                                                                                                                                                                                                 |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Phone `+61 8 5550 0142`             | The README says it's a development placeholder. It's now marked `[PLACEHOLDER]` on the site, so the production build is blocked until the real number is supplied.                                    |
| 2.2 | NER registration                    | The LinkedIn headline shows "CPEng NER", but the README says NER expired in July 2025. Is it current?                                                                                                 |
| 2.3 | ~~ATCO Australia end date~~         | **Resolved 2026-09-29:** the founder is still there. The timeline shows 2024–present.                                                                                                                 |
| 2.4 | ~~Badge verification links~~        | **Resolved 2026-09-29:** the user mapped each link to its credential. The links are stored as `url` on each credential and shown once it is verified.                                                 |
| 2.5 | LinkedIn profile URL                | The PDF export wraps the URL across two lines: `linkedin.com/in/deepak` / `pazhoor-a29b7b49`. Is it `deepak-pazhoor-a29b7b49`?                                                                        |
| 2.6 | "Power generation" and "ATCO Power" | The current site copy mentions both, but the sources say ATCO **Australia** and list oil and gas, mining, utilities and construction. Confirm whether power generation experience exists, or drop it. |
| 2.7 | "Cochin"                            | The current site copy mentions early experience in Cochin. The sources only give the undergraduate institution (Maliankara, Ernakulam).                                                               |
| 2.8 | ~~OT security governance~~          | **Resolved 2026-09-29:** yes. It's back in the OT cybersecurity service and its SEO description.                                                                                                      |
| 2.9 | Credentials show as unverified      | Production hides every `verified: false` credential. Once 3–5 above are supplied and checked, the founder needs to confirm each credential before its flag is set to `true`.                          |

## 3. Deliberately left out

These are in the sources but won't go on the site:

- **Identifying details:** project and facility names, pipeline and facility specifications, and client and asset-owner names (CLAUDE.md §6).
- **Personal details:** languages, the secondary-school record and personal skill tags.
- **Training courses:** ISA short courses (IC32M, IC33M, IC34M, IC37M, EC00M exam review). These are training, not certifications.
- **Marketing wording:** "leading vendors", "successful projects" and similar phrasing from the profile summary.
