# PROJECT.md

Source of truth for who the client is, what we are building, and what is in scope.
Derived from _DeepTsight Website Design and Architecture Brief_, 6 September 2026.

---

## 1. Client

| Field               | Value                                               |
| ------------------- | --------------------------------------------------- |
| Legal entity        | DeepTsight Pty Ltd                                  |
| Display name        | DeepTsight Consulting                               |
| Founder / principal | Deepak Pazhoor                                      |
| Base                | Perth, Western Australia                            |
| Type                | Founder-led industrial engineering consultancy, B2B |
| Brief author        | Deepak Pazhoor, 6 September 2026                    |

**Placeholder contact details** — mock values for development only, replace before launch.
They live in one file: `src/content/source/site.ts`.

| Field             | Placeholder value                                          |
| ----------------- | ---------------------------------------------------------- |
| Registered office | Level 11, 191 St Georges Terrace, Perth WA 6000, Australia |
| Phone             | +61 8 5550 0142 _(ACMA fictional-use range)_               |
| Enquiries email   | enquiries@deeptsight.com.au                                |
| Domain            | deeptsight.com.au                                          |
| ABN               | TBD — CLIENT                                               |
| LinkedIn          | TBD — CLIENT                                               |

---

## 2. What the business does

DeepTsight provides specialist engineering consulting to heavy industry and critical infrastructure:
control systems and E&I engineering, OT cybersecurity, IT/OT segregation, and plant reliability.
The differentiator is that one practitioner covers all four, with hands-on site experience, so
recommendations account for plant availability and implementation reality rather than being
theoretical security or reliability advice.

**Positioning statement (from brief, recommended):**

> Deep technical insight for safer, more reliable and more secure industrial operations.

**Supporting message:** DeepTsight combines hands-on control systems and E&I engineering experience with
practical OT cybersecurity and reliability thinking to solve complex operational challenges without
losing sight of plant availability, lifecycle value or implementation reality.

---

## 3. What the website is for

The site is simultaneously a **credibility platform** and a **lead-generation channel**. It must
establish trust fast, demonstrate relevant capability, and route a qualified visitor to a low-friction
professional enquiry.

### Objectives

1. Establish immediate professional credibility with senior engineering, operations, asset and risk stakeholders.
2. Explain the specialist capabilities in clear commercial and operational terms.
3. Demonstrate experience, qualifications, registrations, certifications and publications — subject to verification and approval.
4. Generate qualified enquiries through clear, well-placed calls to action.
5. Create a scalable content foundation for future insights, case studies and service pages.
6. Deliver a secure, accessible, maintainable, high-performing website.

### Calls to action

| Level      | Label                              | Destination            |
| ---------- | ---------------------------------- | ---------------------- |
| Primary    | Discuss your operational challenge | `/contact`             |
| Secondary  | Explore capabilities               | `/services`            |
| Supporting | View credentials                   | `/credentials`         |
| Supporting | Connect on LinkedIn                | external, TBD — CLIENT |

The primary CTA label is a client decision (brief §19.3). Until confirmed, use the above and keep the
label in `site.ts` so it is a one-line change.

---

## 4. Audiences

| Audience                          | What they need                                                       | Content they go to first                                           |
| --------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Plant and operations leaders      | Delivery capability, operational risk, impact on plant availability  | Services, experience, delivery approach, contact                   |
| Engineering and technical leaders | Technical depth, systems knowledge, suitability for complex upgrades | Detailed capabilities, technologies, credentials, project evidence |
| OT cybersecurity and risk leaders | Standards alignment, architecture capability, real plant experience  | Security services, IT/OT segregation, methodology, credentials     |
| Asset owners and executives       | Business value, risk reduction, lifecycle outcomes                   | Value proposition, outcomes, trust evidence, short enquiry path    |
| Partners and recruiters           | Specialist expertise, location, professional standing                | About, credentials, publications, LinkedIn                         |

Design implication: the same page is read by a skim-reading executive and a sceptical principal engineer.
Every section needs a scannable claim and a substantiating detail underneath it.

---

## 5. Services

Four capability pillars. Each becomes a child page under `/services` using the standard template in §7.

### 5.1 Control Systems and E&I Engineering — `/services/control-systems-ei-engineering`

PLC and DCS engineering, instrumentation design, integration and complex plant upgrades.
**Client outcome:** reduce delivery risk, improve operability, integrate changes within live industrial environments.
**Page content:** scope and constraints; systems and platforms; engineering outputs; implementation approach; commissioning and assurance.

### 5.2 OT Cybersecurity and Network Architecture — `/services/ot-cybersecurity`

ISA/IEC 62443-aligned assessment, OT asset and taxonomy work, security architecture, implementation planning.
**Client outcome:** improve visibility, segmentation and resilience with solutions grounded in operational reality.
**Page content:** risk context; standards alignment; architecture; controls; implementation roadmap; plant-availability considerations.

### 5.3 IT/OT Segregation — `/services/it-ot-segregation`

Design and implementation support for controlled separation and communication between enterprise and operational environments.
**Client outcome:** reduce exposure while preserving necessary operational data flows and supportability.
**Page content:** current-state assessment; zones and conduits; requirements; target architecture; migration; validation.

### 5.4 Plant Reliability and Asset Lifecycle — `/services/plant-reliability`

Reliability analysis and lifecycle thinking for critical assets and upgrade decisions.
**Client outcome:** improve resilience, prioritise expenditure, balance technical risk against lifecycle cost.
**Page content:** failure and risk context; analysis; options; prioritisation; CAPEX and lifecycle implications; recommended actions.

Slugs above are proposed. Confirm before build; changing them later means redirects.

---

## 6. Sitemap

```
/                          Home
/about                     About and founder narrative
/services                  Services overview
  /services/[slug]         Four child pages (§5)
/credentials               Qualifications, registrations, certifications, publications
/insights                  Article index          (Phase 1 if content exists, else Phase 2)
  /insights/[slug]         Article
/contact                   Enquiry
  /contact/thank-you       Confirmation
/legal/privacy             Privacy policy
/legal/terms               Website terms
/legal/accessibility       Accessibility statement
/404                       Not found
/sitemap.xml  /robots.txt
```

**Primary navigation:** Home · About · Services · Credentials · Insights · Contact
**Navigation principles:** concise and predictable; persistent visible contact action; descriptive labels
over clever ones; nothing reachable only by hover; structured footer with services, contact, legal, LinkedIn.

---

## 7. Page content models

### Home — section order

1. **Hero** — value proposition, supporting statement, primary CTA.
2. **Trust strip** — verified credentials, registrations, standards knowledge, publication evidence.
3. **Core capabilities** — the four pillars with outcome-focused summaries.
4. **Why DeepTsight** — founder-led expertise, site experience, integration of engineering + security + reliability.
5. **Problems addressed** — complex upgrades, network segregation, operational risk, lifecycle optimisation.
6. **Delivery approach** — assess, architect, implement, assure (or client-approved alternative).
7. **Selected proof** — anonymised project examples, publications, measurable outcomes where disclosure is permitted.
8. **Perth and sector context** — local presence, capability across critical infrastructure and heavy industry.
9. **Final conversion** — invitation to discuss an operational challenge.

**Homepage writing rule:** lead with client problems and outcomes. Credentials are evidence, not the
opening message. No "world-class", "leading", "best-in-class", "innovative solutions" unless substantiated.

### Standard service page template

1. Client challenge
2. Why it matters operationally
3. DeepTsight capability
4. Typical scope and outputs
5. Delivery approach
6. Relevant standards, platforms or methods
7. Evidence or representative experience
8. Related services
9. Enquiry CTA

### About

A concise, credible progression: early engineering experience in Cochin → site-based work in operated
oil and gas assets and power generation, including ATCO Power → establishing DeepTsight in Perth.

- Explain the _relevance_ of the career, not just the chronology.
- Connect site experience to the approach to safety, availability, maintainability, implementation.
- Professional portrait; authentic project-context imagery where permissions allow.
- Keep personal biography separate from the company's client promise and delivery principles.
- **Dates, employer names, role descriptions and experience claims must be confirmed before publication.**

### Credentials

Structured evidence, approved and verifiable only. Categories:
academic qualifications (MEng details) · professional registrations (PEng details) · ISA/IEC 62443-related
certifications · RAMS symposium papers and other publications · control platforms, engineering tools and
standards experience · approved project summaries, sectors and outcomes.

> **Verification gate.** Every qualification, registration, certification, publication, client reference,
> project claim and quantified outcome must be checked for exact wording, current status, permission and
> expiry before publication. Until a given item is confirmed, it renders as a marked placeholder or is
> omitted. No exceptions.

### Contact

Short form; email alternative; Perth location area; LinkedIn; privacy notice; response-time statement if approved.

---

## 8. Tone of voice

| Principle                | Do                                                                                                           | Avoid                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Technical and direct     | Precise language senior engineers recognise; define specialist terms where a commercial reader needs context | Dense acronym strings, unexplained jargon, promotional filler              |
| Solution-oriented        | Connect technical work to safety, availability, resilience, lifecycle value, implementation confidence       | Feature lists with no explanation of why they matter                       |
| Professional and assured | Calm confidence, evidence, restraint                                                                         | Aggressive selling, exaggerated claims, fear-based cybersecurity messaging |
| Specific and credible    | Verified examples, clear outputs, approved evidence                                                          | Vague claims without substance                                             |
| Human and accessible     | Short sections, descriptive headings, plain English around technical detail                                  | Walls of text; language that reads as generated or impersonal              |

---

## 9. Scope

### In scope — Phase 1 (launch)

- All pages in §6, statically rendered.
- Content stored as typed data and MDX in the repo, read through the content adapter.
- Enquiry form with server-side validation, spam protection and email delivery.
- Full design system implementation (`DESIGN.md`).
- WCAG 2.2 AA conformance, SEO and structured data, performance budgets, security headers.
- Privacy-conscious analytics.
- Deployment, monitoring, handover documentation.

### In scope — Phase 2 (post-launch)

- CMS so the founder can edit copy, services, credentials, insights and metadata without a developer.
- Insights publishing workflow (draft → review → publish).
- Content migration from repo files into the CMS.

The Phase 1 architecture is built specifically so Phase 2 replaces one adapter module and nothing else.
See `ARCHITECTURE.md` §4. **Do not** defer content structure decisions to Phase 2 — the content model is
defined now, in Zod schemas, and the CMS is later made to match it.

### Out of scope (unless separately agreed)

Multilingual content · client portal or authenticated area · e-commerce or payments · CRM/marketing
automation integration · site search (brief: only when content volume justifies it) · live chat ·
downloadable gated assets · blog comments · booking/calendar integration · copywriting of final approved
content · photography and videography · logo or brand identity design · legal drafting of privacy and
terms text.

---

## 10. Content and asset inputs required from the client

Tracked in `TASKS.md` Phase 0. Nothing that depends on these may be invented.

- [ ] Approved logo suite and brand guidelines _(logo file received; no guidelines — see `DESIGN.md` §1)_
- [ ] Confirmed business name, descriptor and contact details
- [ ] Founder biography and professional portrait
- [ ] Verified qualifications, registrations and certifications
- [ ] Approved publication citations and links
- [ ] Approved service descriptions and technology references
- [ ] Permitted client, project and outcome evidence
- [ ] Image assets with documented usage rights
- [ ] Privacy, legal and cookie requirements approved by an appropriate adviser
- [ ] LinkedIn and other approved external profile links

---

## 11. Content responsibility matrix

| Content                 | Draft                  | Review            | Approve        |
| ----------------------- | ---------------------- | ----------------- | -------------- |
| Page copy               | TBD — CLIENT           | TBD               | Deepak Pazhoor |
| Credentials data        | Deepak Pazhoor         | Dev team (format) | Deepak Pazhoor |
| Service descriptions    | TBD — CLIENT           | Dev team          | Deepak Pazhoor |
| Insights articles       | Deepak Pazhoor         | —                 | Deepak Pazhoor |
| Legal pages             | Client's legal adviser | —                 | Deepak Pazhoor |
| Metadata and CTA labels | Dev team               | Deepak Pazhoor    | Deepak Pazhoor |
| Imagery and rights      | TBD — CLIENT           | Dev team          | Deepak Pazhoor |

---

## 12. Open decisions

Brief §19 lists decisions to confirm before design begins. Current status:

| #       | Decision                                                                                                                            | Status                                                |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| OPEN-01 | Name capitalisation: brief uses **DeepTsight** throughout; internal message used "DeepTSight". Files use **DeepTsight Consulting**. | **Confirm** — one-line change in `site.ts`            |
| OPEN-02 | Does "Consulting" appear in navigation and page titles, or just the wordmark?                                                       | TBD — CLIENT                                          |
| OPEN-03 | Priority sectors and geographic service area                                                                                        | TBD — CLIENT                                          |
| OPEN-04 | Primary CTA label and preferred enquiry method                                                                                      | Proposed in §3                                        |
| OPEN-05 | Launch scope for Insights, case studies, downloadable credentials                                                                   | TBD — CLIENT. Build the route; launch empty or defer. |
| OPEN-06 | Approved credentials, project examples, client references, publication details                                                      | TBD — CLIENT, blocks `/credentials`                   |
| OPEN-07 | CMS platform, hosting and ongoing support owner                                                                                     | Proposed in `TECH_STACK.md` §4–5                      |
| OPEN-08 | Privacy, analytics, cookie and data-retention choices                                                                               | Proposed in `REQUIREMENTS.md` §6                      |
| OPEN-09 | Languages, integrations, future functionality to allow for                                                                          | TBD — CLIENT                                          |
| OPEN-10 | Brand navy sampled from the logo file                                                                                               | **Blocks final palette** — see `DESIGN.md` §1         |
| OPEN-11 | Accent direction: amber vs desaturated teal                                                                                         | Amber selected; teal fallback in `DESIGN.md` §3.4     |
| OPEN-12 | Domain, DNS control, launch date, team size                                                                                         | TBD                                                   |
| OPEN-13 | Where enquiry submissions go: inbox, shared mailbox or CRM                                                                          | TBD — CLIENT, blocks form delivery config             |
| OPEN-14 | Is there an existing site with URLs needing redirects?                                                                              | TBD — CLIENT                                          |

---

## 13. Acceptance criteria (client sign-off)

- [ ] All agreed pages and templates implemented and content-approved
- [ ] Desktop and mobile layouts match the approved design system
- [ ] Navigation, links, forms and confirmation messages operate correctly
- [ ] Site usable by keyboard and meets the agreed accessibility target
- [ ] Performance results meet agreed thresholds on representative pages and devices
- [ ] HTTPS, administration controls, backups and maintenance ownership documented
- [ ] No unapproved confidential, client, credential or security-sensitive information published
- [ ] Page titles, metadata, structured data, sitemap and indexing controls configured
- [ ] Analytics events and privacy controls operate as agreed
- [ ] Source files, accounts, licences, documentation and ownership handed over
