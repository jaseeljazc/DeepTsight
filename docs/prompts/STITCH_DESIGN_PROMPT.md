# Google Stitch design prompt: DeepTsight Consulting

This file is a set of prompts for Google Stitch. Stitch works better with a short global brief followed by one prompt per screen than with one long prompt, so:

1. Paste **Part A (global brief)** as the first prompt, together with the **Home, desktop** prompt from Part B.
2. Once the home page is right, generate each remaining screen in its own prompt. Start every one of those prompts with: _"Same design system as the previous screens. Follow the global brief exactly."_
3. Generate desktop (1440px) first, then ask for the mobile (390px) version of each screen.
4. Use **Part C (correction prompts)** when Stitch drifts back to generic output.

Everything in square brackets marked `[PLACEHOLDER]` is unverified client content. It must look like a placeholder in the design so it can never be mistaken for approved copy.

---

## Part A: Global brief (paste first)

```
Design a marketing website for DeepTsight Consulting, a founder-led industrial engineering
consultancy based in Perth, Western Australia. One senior practitioner covers four disciplines:
control systems and E&I engineering, OT cybersecurity (ISA/IEC 62443), IT/OT segregation, and
plant reliability. Clients are critical-infrastructure and heavy-industry operators: plant
managers, principal engineers, OT security leads, asset owners and executives.

The site must feel like it was designed by a senior designer for this specific engineering firm,
and not like a template, a SaaS product, a startup or anything AI-generated. The reference points
are a well-made engineering deliverable (a design report, a drawing title block, a commissioning
dossier) crossed with a quiet, confident editorial publication. The references are Arup, Pentagram
case studies, the Financial Times weekend edition and a Swiss engineering annual report. It must
not look like Stripe, Linear, Vercel or a cybersecurity startup.

MOOD: calm, exact, assured, technical and human. Restraint is the brief. It should feel expensive
because it is precise, not because it is decorated.

THEME: light. Warm-neutral paper background, near-black blue ink text, one dark ink band per page
for rhythm. No dark-mode "hacker" aesthetic.

COLOUR (use only these):
- Paper (page background) #F5F5F2
- Paper deep (alternate section background) #ECECE7
- Surface (panels, form fields) #FFFFFF
- Ink 900 (headings, dark bands, primary button) #111A22
- Ink 700 (body text) #3E4A55
- Steel 500 (meta text, captions) #5C6670
- Control border #7D868E
- Hairline rule #D5D7D2
- Accent, client primary blue #0E50ED. Use it rarely: link underlines on hover, the active nav
  underline, primary buttons, one thin rule per section and focus rings. Never for large fills or backgrounds.
- On dark bands: text #E9ECEE, muted #A3ADB5, accent #7AA2FF
No other colours. No gradients anywhere.

TYPOGRAPHY:
- Display and H1–H2: "Newsreader" (editorial serif), weight 400–500, tight leading (1.05–1.15),
  slight negative tracking. H1 72–88px on desktop and 40–44px on mobile. H2 44–52px.
- Everything else (H3, body, UI, nav, buttons): "IBM Plex Sans". Body 18px with 1.6 line height
  and a max line length of about 68 characters. H3 22–24px, weight 500.
- Data only (standards references such as ISA/IEC 62443-3-3, step codes, dates, identifiers,
  figure numbers): "IBM Plex Mono" 13–14px. Never used as decorative uppercase eyebrows.
- Sentence case everywhere: headings, buttons, nav and labels. No ALL CAPS, no Title Case.

LAYOUT:
- 12-column grid, 1280px content width, 32px gutters, generous margins.
- Editorial asymmetry: most sections use a narrow left column (3 cols) for the section title and a
  wide right column (8 cols, offset by 1) for content. Not every section is centred.
- Very generous vertical rhythm: 144–176px between major sections on desktop, 88px on mobile.
- Hairline 1px rules separate content, as in a well-set document. Content sits on the grid and is
  not boxed into cards.

SHAPE AND DEPTH:
- Border radius 2px on buttons and inputs and 0–4px on everything else. No pills or rounded cards.
- No drop shadows, glows, glassmorphism, blur or neumorphism. Depth comes from surface colour
  steps and hairlines only.

IMAGERY:
- Real, documentary-style industrial photography: switchrooms, control cabinets, instrumentation,
  process plant, site work in PPE, Western Australian industrial landscapes. Natural light,
  slightly muted grading, no neon, no blue "cyber" colour grading, no people pointing at screens,
  no glowing padlocks, no globes, no binary code, no circuit boards.
- Images are large and deliberate: full-bleed or spanning 8+ columns, with 21:9, 3:2 or 4:5 ratios
  and square corners.
- Every image has a small caption beneath it in Plex Mono 13px, steel 500, e.g.
  "Fig. 02 — Representative image. Motor control centre, process facility." The captions read like
  figures in an engineering report.

ICONS: almost none. Where one is needed (an arrow on a link, the menu button, an external link)
use thin 1.5px line icons in ink 700. No icon above every card, no icon circles, no emoji.

SIGNATURE DETAILS (these make the site specific to this client, so use them consistently):
1. Figure captions on every image, as described above.
2. Section numbering used like a technical document's contents, e.g. "1.0", "2.0" in Plex Mono,
   placed in the left title column beside the H2 and never stacked above it as an eyebrow.
3. The footer is designed like an engineering drawing title block: a ruled grid of small cells
   holding company name, ABN, location, contact, "Document: deeptsight.com.au", "Revision" (the
   last-updated date) and copyright.
4. Hairline 1px rules with small tick marks at column boundaries, used sparingly on the hero and
   footer to evoke drawing borders. Keep them subtle and never let them become a pattern
   background.

BUTTONS AND LINKS:
- Primary button: solid client primary blue #0E50ED, white text, 2px radius, 52px tall, generous horizontal padding
  and a small line arrow. Only one per view.
- Secondary: text link in ink 900 with a 1px underline offset 4px. On hover the underline turns
  primary blue and thickens to 2px.
- Focus: 2px primary blue ring with a 2px offset on everything focusable.
- Minimum 44×44px target size.

MOTION (subtle and never decorative):
- Slow parallax on large photographs only (image moves 6–10% slower than the page).
- Content fades in with a 12px upward shift, once, over 400ms.
- Link underlines draw in on hover. The service index rows reveal a thumbnail image on hover
  (desktop only).
- No counters, typing effects, marquee logos, floating shapes, cursor effects or scroll-jacking.

COPY TONE: technical, direct and calm. No "world-class", "cutting-edge", "innovative solutions",
"unlock", "empower", "seamless", "next-generation" or fear-based cyber messaging. Headlines state
problems and outcomes plainly.

HARD NO list: purple, blue-to-purple or any gradient. Dark navy hero with glowing accents.
Glassmorphism. Blurred colour blobs. Grid-of-dots or circuit backgrounds. Three or four identical
icon cards in a row. Centred hero with a pill badge above the headline. Gradient text. Stats
counters ("500+ projects"). Client logo marquee. Testimonial carousel. Rounded-2xl cards with
shadows. Emoji. Uppercase letter-spaced eyebrow labels above every heading. Stock photos of
hooded hackers, padlocks, shields or globes. 3D illustrations. Abstract "tech" illustrations.
Chat widgets. Cookie banners. Pop-ups.
```

---

## Part B: Screen prompts

### B1. Home, desktop (1440px)

```
Design the Home page, desktop 1440px, following the global brief. Sections in this exact order:

HEADER (sticky, 80px): paper background with a hairline bottom rule that only appears once the
page has scrolled. Left: wordmark "DeepTsight" in Newsreader 24px with "Consulting" in Plex Sans
14px steel beside it. Right: nav links "About", "Services", "Credentials", "Insights" and
"Contact" in Plex Sans 15px ink 700. The active item has a 2px primary blue underline. Far right, a
primary button "Discuss a challenge". No "Home" link text; the wordmark links home.

1. HERO (not centred, no background colour block):
   - Top of section: a thin hairline spanning the grid with tiny tick marks at column boundaries.
   - Left 8 columns: H1 in Newsreader, about 84px, three lines max: "Deep technical insight for
     safer, more reliable and more secure industrial operations."
   - Below, in Plex Sans 20px ink 700 at a max width of 560px: "Control systems and E&I engineering,
     OT cybersecurity and reliability thinking from one practitioner, applied without losing sight
     of plant availability, lifecycle value or implementation reality."
   - One primary button "Discuss your operational challenge" and one text link "Explore
     capabilities".
   - Right 3 columns, aligned to the H1 baseline: a small ruled "spec" block in Plex Mono 13px
     listing: "Based — Perth, Western Australia" / "Disciplines — 4" / "Standards — ISA/IEC 62443"
     / "Engagement — founder-led", each row separated by hairlines.
   - Below, full-bleed 21:9 documentary photograph of an industrial switchroom or process plant
     with slow parallax, and the caption "Fig. 01 — Representative image. [PLACEHOLDER: image
     subject and credit]".

2. TRUST STRIP: not logos. A single ruled horizontal table on paper deep, four columns, each with
   a label in Plex Sans 14px steel and a value in Plex Sans 16px ink: "Qualification —
   [PLACEHOLDER: MEng details]", "Registration — [PLACEHOLDER: PEng details]", "Certification —
   [PLACEHOLDER: ISA/IEC 62443 certificate]", "Publication — [PLACEHOLDER: RAMS paper]". The
   placeholders sit in a dashed-outline box so they read as unfinished.

3. CAPABILITIES, section "1.0": left column H2 "Four disciplines, one accountable engineer". Right
   column: an INDEX LIST, not cards. Four full-width rows separated by hairlines. Each row has the
   number "01" to "04" in Plex Mono, the title in Newsreader 36px, a one-sentence outcome in Plex
   Sans, and an arrow link at the far right. On hover, a 4:3 thumbnail image appears to the right
   and a 2px primary blue rule draws along the row's left edge.
   Rows:
   01 "Control systems and E&I engineering": "Reduce delivery risk and integrate change within live
      industrial environments."
   02 "OT cybersecurity and network architecture": "Improve visibility, segmentation and resilience,
      grounded in operational reality."
   03 "IT/OT segregation": "Reduce exposure while preserving the operational data flows the plant
      depends on."
   04 "Plant reliability and asset lifecycle": "Prioritise expenditure and balance technical risk
      against lifecycle cost."

4. WHY DEEPTSIGHT, section "2.0": split layout. Left 5 columns: a founder portrait at 4:5 in
   natural light, business attire or site PPE, with the caption "Fig. 02 — Deepak Pazhoor,
   founder. [PLACEHOLDER: approved portrait]". Right 6 columns: H2 "Site experience, not
   theoretical advice", a short paragraph, then a simple line diagram: four thin horizontal
   lines labelled "Control systems", "OT security", "Segregation" and "Reliability", all passing
   through one vertical primary blue line labelled "One practitioner". Draw it in the style of a
   technical schematic, with hairline weight and no fills. Below the diagram, three short numbered
   principles as plain text: "Plant availability first", "Designed for implementation",
   "Evidence over claims".

5. PROBLEMS ADDRESSED, section "3.0": H2 "Where we are typically brought in". A two-column ruled
   ledger. Each row has the situation on the left in Plex Sans 500 20px and the approach on the
   right as a short paragraph. Four rows: complex control system upgrades on live plant; IT/OT
   network segregation; unquantified operational and cyber risk; ageing assets and CAPEX
   prioritisation. No icons.

6. DELIVERY APPROACH, section "4.0": the page's single DARK INK BAND (#111A22). H2 in #E9ECEE:
   "A method built around a running plant". A horizontal four-step sequence connected by one
   hairline that fills with primary blue from left to right as the user scrolls. Each step has a
   Plex Mono code ("A1 Assess", "A2 Architect", "A3 Implement", "A4 Assure"), a Newsreader title,
   two lines of description and a short "Typical outputs" list in Plex Sans 14px muted.

7. SELECTED PROOF, section "5.0": two "project notes" laid out like report extracts. Each is a
   white panel with a hairline border and 4px radius, sector and year in Plex Mono at the top, a
   Newsreader title, and a definition list of Context / Constraint / Scope / Outcome. All values
   are "[PLACEHOLDER: approved anonymised project]" in dashed boxes.

8. PERTH AND SECTOR CONTEXT, section "6.0": wide 3:2 photograph of a Western Australian industrial
   landscape with parallax on the left 7 columns. On the right, H2 "Based in Perth, working across
   critical infrastructure", a short paragraph, and a plain list of sectors: "[PLACEHOLDER: priority
   sectors]".

9. FINAL CONVERSION: paper deep background. Left: a large Newsreader line, 56px, "Have an
   operational challenge worth a conversation?" Right: the primary button "Discuss your operational
   challenge", then the text "Or email enquiries@deeptsight.com.au" with the address as a link, and
   the response-time note "[PLACEHOLDER: approved response time]".

FOOTER, as an engineering title block: dark ink background with a ruled grid of cells.
- Row 1: "Services" (four links), "Company" (About, Credentials, Insights, Contact), "Contact"
  (email, phone +61 8 5550 0142, Perth WA) and "Legal" (Privacy, Terms, Accessibility, LinkedIn).
- Row 2, the title block strip, in small Plex Mono cells: "DeepTsight Pty Ltd",
  "ABN [PLACEHOLDER]", "Perth, Western Australia", "Document deeptsight.com.au",
  "Revision 2026-09", "© 2026".
```

### B2. Home, mobile (390px)

```
Now design the mobile version (390px) of the Home page. Same content and order.
- Header: wordmark left, "Menu" text button with a 1.5px line icon right, 64px tall. The primary
  CTA moves into the menu and also appears in the hero.
- Open menu: full-screen paper overlay, nav links in Newsreader 32px stacked with hairlines, the
  primary button at the bottom and contact details beneath it. No slide-in drawer with a shadow.
- H1 at 40px. The spec block moves below the CTAs as a 2×2 ruled grid.
- Capabilities index: rows stack, no hover thumbnails, number and title on one line with the
  outcome beneath.
- Problems ledger becomes stacked pairs.
- Delivery steps stack vertically with the connecting line running down the left edge.
- Footer title block cells stack into two columns.
- 20px side margins, all tap targets at least 44px.
```

### B3. Services overview (`/services`)

```
Design the Services overview page, desktop. Same design system.
- Breadcrumb is not needed (one level deep). Page header: left column holds Plex Mono "Services";
  wide column holds the H1 "Engineering, security and reliability for operating plant" and an
  intro paragraph.
- Four large alternating feature blocks, one per service. Each block has an image at 3:2 across
  6 columns with a figure caption, and on the other side the number in mono, the Newsreader H2
  title, a two-sentence summary, "The outcome" as a short bold sentence, three scope bullets and a
  text link "View control systems and E&I engineering". Image sides alternate left and right.
  Blocks are separated by hairlines, not boxed.
- Beneath: a compact ruled "How the disciplines connect" table. Rows are the four services and
  columns are "Typical trigger", "Main output" and "Works alongside", in Plex Sans 15px.
- End with the final conversion band from the home page.
```

### B4. Service detail, e.g. OT cybersecurity (`/services/ot-cybersecurity`)

```
Design a service detail page for "OT cybersecurity and network architecture", desktop.
- Breadcrumb in Plex Sans 14px steel: Home / Services / OT cybersecurity.
- Header: H1 in Newsreader 72px spanning 9 columns and a lead paragraph. Beside it, a ruled key
  facts box in Plex Mono 13px: "Standards — ISA/IEC 62443-2-1, 3-2, 3-3" / "Typical duration —
  [PLACEHOLDER]" / "Engagement — assessment, architecture, implementation support".
- Full-bleed 21:9 image with parallax and a figure caption.
- LAYOUT FOR THE BODY: a sticky left "Contents" column (3 cols) listing the nine sections as
  numbered links (1.0 Client challenge … 9.0 Enquire) with the current section marked by a primary-blue
  2px left rule. The right 7 columns hold the reading content:
  1.0 Client challenge
  2.0 Why it matters operationally (a pull-statement in Newsreader 32px with a primary-blue left rule)
  3.0 DeepTsight capability
  4.0 Typical scope and outputs (a two-column ruled table: Scope item | Output document)
  5.0 Delivery approach (compact version of the four-step A1–A4 sequence)
  6.0 Standards, platforms and methods (a definition list with Plex Mono standard references)
  7.0 Representative experience (one project note panel, placeholder)
  8.0 Related services (three index rows linking to the other services)
  9.0 Enquiry (the conversion band)
- Body copy in long-form reading style: 18px, 68 characters per line, generous paragraph spacing.
```

### B5. About (`/about`)

```
Design the About page, desktop.
- Header: H1 "An engineer's view of operational risk", with a lead paragraph.
- A large founder portrait at 4:5 across 5 columns, sticky while the narrative scrolls beside it.
  Caption: "Fig. 01 — Deepak Pazhoor, founder and principal. [PLACEHOLDER: approved portrait]".
- Career narrative as a vertical "record" timeline: a thin vertical hairline with small square
  markers (not circles). Each entry has a Plex Mono date range "[PLACEHOLDER: dates]", a place,
  a Newsreader title, a paragraph on why the experience matters today and a line in steel
  "Relevance: …". Entries: early engineering in Cochin; site-based work on operated oil and gas
  assets and power generation, including ATCO Power [PLACEHOLDER: confirm]; founding DeepTsight in
  Perth.
- A separate, clearly divided section on paper deep: "How DeepTsight works". Four delivery
  principles in a 2×2 ruled grid with a Plex Mono number, a title and two sentences each. No icons.
- Link row: "View credentials" and "Connect on LinkedIn [PLACEHOLDER]".
- Conversion band and footer.
```

### B6. Credentials (`/credentials`)

```
Design the Credentials page, desktop. It should read as a verifiable register.
- Header: H1 "Credentials and publications" and a one-line note in steel: "Each item below is
  listed with its issuer and identifier so it can be verified independently."
- Sticky left category index: Qualifications, Registrations, Certifications, Publications,
  Platforms and standards.
- Each category is a proper data table with a hairline row separator, a caption, and column
  headers in Plex Sans 14px 500: "Credential | Issuer | Identifier | Status | Expiry". Identifiers,
  dates and standard numbers are in Plex Mono. Status is shown as text ("Current") with a small
  square marker, never colour alone.
- Publications list in citation style: authors, year, title in Newsreader italic, venue, and a
  "DOI" link in mono.
- Platforms and standards as a compact multi-column list grouped under small H3s (PLC/DCS
  platforms, engineering tools, standards).
- Every value is "[PLACEHOLDER]" in a dashed box. Show the design with 3–4 rows per table.
```

### B7. Insights index and article

```
Design two screens, desktop.
(1) Insights index: H1 "Insights" plus an intro. The articles form an editorial list, not a
card grid. Each row has the date in Plex Mono, the reading time, a Newsreader title at 32px, a
two-line summary and a hairline between rows. The first article can be featured with a 3:2 image.
All titles are "[PLACEHOLDER: article title]".
(2) Article: breadcrumb, H1 in Newsreader 56px across 8 columns, a meta line (author, date,
reading time in mono), a 21:9 lead image with a caption, and a 68-character reading column.
Body styles: H2 and H3, pull quote with a primary-blue left rule, a table, a code/standard reference
block in Plex Mono on paper deep, numbered footnotes and a figure with a caption. End with an
author box (small portrait, name, one line, "View credentials") and a related articles list.
```

### B8. Contact, thank-you and error states

```
Design the Contact page, desktop, then its form states.
- Split layout. Left 5 columns: H1 "Discuss your operational challenge", a short paragraph on what
  happens next, then a ruled contact block with email enquiries@deeptsight.com.au, phone
  +61 8 5550 0142, location "Perth, Western Australia", LinkedIn [PLACEHOLDER] and response time
  [PLACEHOLDER]. Include a note: "Please do not include site names, network details or
  vulnerability information in this form."
- Right 6 columns: a white form panel, 4px radius, hairline border, no shadow. Fields with
  visible labels above inputs (never placeholder-only): Name (required), Work email (required),
  Organisation, Phone, Enquiry type (native-looking select), Message (required, textarea), and a
  consent checkbox (required) with a link to the privacy notice. Required fields are marked with
  the word "required" in steel text, not only an asterisk. Inputs are 52px tall with a 1px
  #7D868E border and 2px radius; on focus the border is ink with a 2px primary blue ring.
- Submit button "Send enquiry" at full width, with the privacy note beside it.
- ERROR STATE variant: an error summary box at the top of the form with a 4px ink left border, a
  heading "There are 2 problems with your enquiry" and linked list items. Each invalid field shows
  inline error text below the label with a small line icon. The error styling uses #A32A0C text
  plus the icon, never colour alone.
- THANK-YOU page: calm and centred-left. H1 "Thank you, your enquiry has been sent", a three-step
  "What happens next" numbered list, and links back to Services and Insights.
```

### B9. 404 and legal pages

```
(1) 404: H1 in Newsreader "This page isn't on the drawing", with a line of explanation and three
text links: Home, Services, Contact. A subtle hairline title-block frame around the message. No
illustration.
(2) Legal page template (Privacy / Terms / Accessibility): breadcrumb, H1, "Last updated" in mono,
a sticky contents list on the left and long-form reading content on the right in the article
styles. All body copy is "[PLACEHOLDER: approved legal text]".
```

---

## Part C: Correction prompts (use when Stitch drifts)

- _"Remove all drop shadows, gradients and rounded corners above 4px. Use hairline 1px borders and background colour steps instead."_
- _"This looks like a SaaS template. Replace the icon card grid with a ruled index list: number, serif title, one-sentence outcome and an arrow link, separated by 1px hairlines."_
- _"Remove the uppercase letter-spaced labels above headings. Put the section number (1.0, 2.0) in IBM Plex Mono in the left column beside the heading instead."_
- _"The hero is too centred and generic. Left-align it on the 12-column grid, H1 across 8 columns, with the ruled spec block in the right 3 columns and a full-bleed documentary photograph below."_
- _"Use only the defined palette. The accent #0E50ED is for underlines, active states, thin rules and focus rings only. It is never a fill."_
- _"Replace the stock cyber imagery with documentary industrial photography: switchrooms, instrumentation, process plant, natural light and muted grading."_
- _"Increase whitespace between sections to at least 144px and let the typography carry the page."_
- _"Headings must be sentence case in Newsreader. Body and UI text in IBM Plex Sans. Mono only for data."_

---

## Part D: Review checklist for the generated designs

Before taking a Stitch screen into development, check:

- [ ] Could the logo be swapped for a SaaS startup's without anything feeling wrong? If so, rework it.
- [ ] One primary button per view, and no more than one accent-coloured element competing for attention.
- [ ] No shadows, gradients, pills, glows, blur or icon-card grids.
- [ ] Every image has a figure caption and is documentary, not stock or AI-looking.
- [ ] Every unverified fact is visibly marked `[PLACEHOLDER]`.
- [ ] Text contrast meets 4.5:1, controls and borders 3:1, and focus rings are visible.
- [ ] The mobile layout keeps the reading order and has no horizontal scroll at 360px.
