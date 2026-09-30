# Redesign prompt: DeepTsight Consulting website

This prompt is for a coding agent (Claude Code or Antigravity) that will redesign the existing
Next.js codebase. Paste everything below the line as the task. Attach the approved Google Stitch
screens (produced with `docs/prompts/STITCH_DESIGN_PROMPT.md`) as the visual reference.

---

## Role

You are a senior product designer and senior frontend engineer. You care about typography, grid,
accessibility and performance at the same time. You are redesigning the visual layer of the
DeepTsight Consulting website. The current UI was rejected because it reads as minimal in a
beginner sense: under-designed, generic and template-like. The new UI must look like a senior
designer made it for this specific engineering consultancy. It must be professional and quiet,
must not be flashy, and must show no sign of AI generation.

## Read first, in this order

1. `CLAUDE.md`: all rules still apply except where this prompt explicitly replaces the design
   rules in §4 (see "Documents you must update" below).
2. `PROJECT.md`: client, audiences, services, sitemap, page content models and tone.
3. `REQUIREMENTS.md`: every FR, A11Y, PERF and SEC requirement is still the acceptance bar.
4. `ARCHITECTURE.md`: the folder structure and the `@/content` adapter seam are **not** changing.
5. `TECH_STACK.md`: no new dependencies without asking. Framer Motion is explicitly rejected.
6. `TASKS.md`: add a new "Redesign" phase and work through it item by item.
7. The attached Stitch screens.

Do **not** use the current `DESIGN.md` or the existing visual styling as a reference. You are
replacing them. Do keep every structural, content, accessibility and security behaviour the
current code already implements.

## What must not change

- The content adapter `@/content`, the Zod content schemas and all content data. This is a visual
  redesign, not a content rewrite. Do not invent copy. Where a new layout needs copy that does not
  exist in content data, add a field to the schema and fill it with a `[PLACEHOLDER] ` string or
  `TODO(CLIENT):`, following CLAUDE.md §3.
- Routes, slugs, metadata, JSON-LD, sitemap and robots.
- The enquiry form's Server Action, validation, spam protection, rate limiting and progressive
  enhancement. Only its presentation changes.
- Server Components by default. `"use client"` only for the mobile menu, the form and the tiny
  motion helper described below.
- CSP: no inline scripts, no `unsafe-inline`, and no third-party requests. Fonts are self-hosted.
- Every requirement in `REQUIREMENTS.md`: WCAG 2.2 AA, 44px targets, focus visibility, reduced
  motion, performance budgets (LCP ≤ 2.0s, CLS ≤ 0.05, JS ≤ 100kB per route, ≤ 5 font files).

## Design direction: "the engineering record"

The site should read like a beautifully set engineering deliverable (design report, drawing title
block, commissioning dossier) crossed with a calm editorial publication. It needs a senior
engineer's precision and an editor's restraint. It should feel expensive through precision rather
than decoration.

What separates this from the rejected version: **scale, contrast and structure.** Large editorial
serif headlines, a real asymmetric grid, full-bleed documentary photography with figure captions,
ruled tables and indexes instead of cards, one dark band per page for rhythm, and a small set of
signature details that belong to this client.

### Design tokens (replace the tokens in `src/app/globals.css` `@theme`)

Colour, light theme only:

| Token            | Value     | Use                                                                       |
| ---------------- | --------- | ------------------------------------------------------------------------- |
| `paper`          | `#F5F5F2` | Page background                                                           |
| `paper-deep`     | `#ECECE7` | Alternate sections, code blocks, trust strip                              |
| `surface`        | `#FFFFFF` | Form panel, project notes                                                 |
| `ink-900`        | `#111A22` | Headings, dark band, footer (primary buttons use `accent`)                |
| `ink-700`        | `#3E4A55` | Body text                                                                 |
| `steel-500`      | `#5C6670` | Meta, captions, helper text                                               |
| `control`        | `#7D868E` | Input and control borders (≥ 3:1 on paper)                                |
| `rule`           | `#D5D7D2` | Decorative hairlines only                                                 |
| `accent`         | `#0E50ED` | Client primary blue: hover underlines, active nav, focus ring, thin rules |
| `error`          | `#A32A0C` | Error text, always paired with an icon and text                           |
| `on-dark`        | `#E9ECEE` | Text on ink                                                               |
| `on-dark-muted`  | `#A3ADB5` | Muted text on ink                                                         |
| `accent-on-dark` | `#7AA2FF` | Accent on ink                                                             |

`ink-900` is a stand-in until the brand navy is sampled from the logo (OPEN-10). Keep it as a
single token so the swap is a one-line change. Run `scripts/check-contrast.ts` against the whole
table and fix any pair that fails. Tailwind's default colour palette must stay disabled.

Typography (self-hosted WOFF2 via `next/font/local`, latin + latin-ext subset, at most 5 files):

| Role                        | Family               | Files                                                          |
| --------------------------- | -------------------- | -------------------------------------------------------------- |
| Display, H1–H2, pull quotes | Newsreader (SIL OFL) | 1 variable file (roman), plus italic only if the budget allows |
| H3, body, UI                | IBM Plex Sans        | 400, 500, 600                                                  |
| Data only                   | IBM Plex Mono        | 400                                                            |

That is 5 files. Remove Archivo and Plex Mono 500 from `public/fonts/`. Use
`adjustFontFallback` to avoid CLS, and never fall back to a bare `sans-serif` or `system-ui` chain.

Type scale (fluid with `clamp()`, desktop → mobile):

| Style          | Size      | Line height | Notes                             |
| -------------- | --------- | ----------- | --------------------------------- |
| Display / H1   | 84 → 40px | 1.05        | Newsreader 400, tracking -0.015em |
| H2             | 52 → 32px | 1.1         | Newsreader 400                    |
| H3             | 24 → 20px | 1.3         | Plex Sans 500                     |
| Lead           | 21 → 18px | 1.55        | Plex Sans 400, ink-700            |
| Body           | 18 → 17px | 1.65        | max 68ch                          |
| Small / UI     | 15px      | 1.5         | nav, labels                       |
| Caption / data | 13–14px   | 1.5         | Plex Mono, steel-500              |

Sentence case everywhere. Mono is only for data: standards references, identifiers, dates, step
codes, figure numbers and section numbers.

Space and grid:

- 12 columns, 1280px max content width, 32px gutters (20px margins on mobile).
- Section rhythm: `clamp(88px, 11vw, 176px)` between major sections.
- The default section layout is a title column (3 cols) plus a content column (8 cols, offset 1).
  Break this deliberately for full-bleed images and the dark band.

Shape and depth: radius 2px on controls and 4px on panels, nothing larger. No shadows, gradients,
blur or glows. Depth comes only from surface steps and 1px rules.

### Signature details (implement each as one reusable primitive)

1. **`<Figure>`** is an image with a caption in Plex Mono, e.g. "Fig. 02 — Representative image.
   …". Figure numbers are generated per page, not hardcoded. The caption text and credit come from
   `content/source/media.ts` (CR-04). Captions double as rights attribution.
2. **`<SectionHeader number="2.0">`**: the section number in mono sits beside the H2 in the title
   column. It is never an uppercase eyebrow above the heading. The number is `aria-hidden` if it
   adds noise, or included in the heading's accessible name if it aids orientation. Decide once,
   log it, and apply it everywhere.
3. **`<IndexList>`** is the ruled capability index: number, serif title, one-line outcome and an
   arrow link, with hairlines between rows. On hover and focus-within at desktop sizes, a 2px
   accent rule draws along the left edge and a 4:3 thumbnail fades in. This replaces every card
   grid on the site. The whole row is one link with a meaningful accessible name (A11Y-11).
4. **`<SpecBlock>`**: a ruled key/value list in mono for the hero and service headers. Use a
   `<dl>`.
5. **`<Ledger>`**: two-column situation → approach rows for "Problems addressed" and scope/output
   tables. Use real `<table>` markup with a `<caption>` and `<th scope>` wherever the content is
   tabular (SEO-11).
6. **`<ProcessSequence>`**: steps A1 Assess, A2 Architect, A3 Implement and A4 Assure, joined by a
   hairline that fills with accent as it scrolls into view. It is horizontal on desktop and
   vertical on mobile, and is an `<ol>` in markup.
7. **`<TitleBlockFooter>`**: the footer, built like an engineering drawing title block. It has
   the four link columns (FR-05), then a ruled strip of mono cells: legal entity, ABN (placeholder),
   location, "Document deeptsight.com.au", "Revision" (build date) and copyright.
8. **`<DrawingRule>`**: a 1px rule with small tick marks at column boundaries, drawn with CSS or an
   inline SVG and marked `aria-hidden`. Use it at most once per page (hero) plus in the footer. It
   must never become a background pattern.
9. **`<ProjectNote>`**: an anonymised project entry laid out as a report extract. A white panel
   with sector and year in mono, a serif title and a `<dl>` of Context, Constraint, Scope and
   Outcome. It renders only when `disclosureApproved: true` (FR-15).
10. **`<Placeholder>`**: extend the existing primitive, keeping it clearly marked. Use a dashed
    `control`-coloured outline, mono text and the `[PLACEHOLDER]` prefix. It must never look like
    finished content.

Reuse and extend the existing primitives in `src/components/primitives`. Do not create a second
Button, Link or Container. Keep each file under about 200 lines.

### Page-by-page specification

Follow `PROJECT.md` §7 for section order, and the Stitch screens for composition.

- **Header:** 80px tall and sticky, on paper. The hairline bottom border appears only after scroll,
  which requires a scroll-state CSS approach or a tiny client helper. On the left is the wordmark:
  "DeepTsight" in Newsreader with "Consulting" in Plex Sans small (OPEN-01 and OPEN-02 still
  apply). Nav: About, Services, Credentials, Insights, Contact. The active item has a 2px accent
  underline plus `aria-current` (FR-03). The primary button "Discuss a challenge" goes on the
  right, with its label from `site.ts`. On mobile, a "Menu" button opens a full-screen paper panel
  with serif links, a focus trap, Escape to close, close on route change and focus restored to the
  trigger (FR-04). No drawer shadow.
- **Home:**
  - Hero: left-aligned H1 across 8 columns, lead, one primary CTA and one text link (FR-12),
    `SpecBlock` in the right 3 columns, then a full-bleed 21:9 `Figure` with parallax.
  - Trust strip: a ruled 4-column table on `paper-deep` showing verified items only (FR-13).
  - Capabilities: `IndexList` (FR-14).
  - Why DeepTsight: portrait `Figure`, then the "one practitioner" schematic, an inline SVG of four
    hairlines crossed by one accent line with text labels. Give the SVG a text alternative or
    `aria-hidden`, with the meaning also stated in the copy.
  - Problems addressed: `Ledger`.
  - Delivery approach: `ProcessSequence` on the single `ink-900` band.
  - Selected proof: `ProjectNote`s, with the whole section omitted if none are approved.
  - Perth context: `Figure` with parallax and sectors.
  - Final conversion.
- **Services overview:** alternating image/text feature blocks separated by rules, then a ruled
  "How the disciplines connect" table, then the conversion band.
- **Service template:** breadcrumb (FR-07), H1 with `SpecBlock`, full-bleed `Figure`, a sticky
  "Contents" rail listing the nine sections (the active section marked with an accent left rule and
  `aria-current="location"`), and a 68ch reading column. It must still be driven from one template
  and the `Service` model (FR-17, FR-19).
- **About:** sticky portrait beside a career record timeline (hairline plus square markers, and
  every date and employer placeholder-gated), then principles in a 2×2 ruled grid on `paper-deep`.
- **Credentials:** a register of real tables per category with caption, `th scope`, mono
  identifiers and status as text plus marker (never colour alone), plus citation-style
  publications and a sticky category index.
- **Insights:** an editorial list, not cards. The article template gets full prose styles (H2/H3,
  pull quote, table, standards block, footnotes, figure). Remove `@tailwindcss/typography`
  defaults that fight the scale.
- **Contact:** split layout with a white form panel, labels above fields, "required" written in
  text, 52px inputs, and an error summary that receives focus (FR-33). Add the operational-data
  warning next to the form ("Please do not include site names, network details or vulnerability
  information").
- **Thank-you, 404 and legal:** as in the Stitch screens. The 404 heading is "This page isn't on
  the drawing" with links to Home, Services and Contact (FR-08).

### Motion: subtle, CSS-first, no library

- **Parallax:** only on large `Figure`s flagged `parallax`. Use CSS scroll-driven animation
  (`animation-timeline: view()`) that translates the image 6–10% within an `overflow: hidden`
  frame, with the image oversized so no gap ever shows. Wrap it in
  `@supports (animation-timeline: view())` so unsupported browsers just see a static image.
- **Reveal:** content blocks fade in with a 12px upward shift over 400ms, once. Prefer CSS
  `animation-timeline: view()` with an `animation-range` of `entry`. If a JS fallback is truly
  needed, write one small client component using a single shared `IntersectionObserver`. Content
  must be visible without JS: add the hidden initial state only when JS runs, so an animation never
  gates content.
- **ProcessSequence fill:** scroll-driven width or height on the connector line.
- **Hover:** link underlines draw in (`text-decoration-thickness` and colour transition, 150ms),
  and IndexList rows get the accent rule and thumbnail. Apply these to `:focus-visible` as well,
  not just `:hover`.
- Easing `cubic-bezier(0.2, 0, 0, 1)`, durations 150–400ms, with no bounce, spring or stagger
  cascades longer than 3 items.
- `@media (prefers-reduced-motion: reduce)` disables all of the above (A11Y-16).
- Motion must cause zero layout shift (CLS ≤ 0.05) and must not animate anything above the fold
  before LCP. The hero H1 and hero image render immediately.
- Forbidden: scroll-jacking, smooth-scroll libraries, counters, marquees, cursor followers,
  typing effects, floating shapes and page transitions.

### Imagery: remove anything AI-generated

- Audit `public/images/`. Files that look AI-generated (for example the ones with numeric
  timestamp suffixes such as `hero_control_room_1789983347988.jpg`) or that lack a documented
  rights record must be removed or replaced. Do not generate new AI images. Where no approved photo
  exists, render a `Figure` in placeholder state: a `paper-deep` frame at the correct aspect ratio
  with `[PLACEHOLDER: image — subject]` in mono, and record `TODO(CLIENT): approved photography`.
- Photography direction for the client brief: documentary, natural light and muted grading. Show
  switchrooms, instrumentation, process plant, site work in PPE and WA industrial landscapes. No
  cyber clichés (padlocks, shields, globes, binary, hooded figures, blue glow).
- Serve AVIF/WebP through `next/image` with explicit aspect ratios, lazy-load below the fold, and
  `priority` only on the hero (PERF-10). No text in images.
- No image may show identifiable client sites, plant details or network equipment labels (CR-05).

### Remove every "AI tell"

Search the codebase and remove or rework each of these if present:

- Gradients, glows, blur and glassmorphism, coloured or any shadows, and `rounded-lg` or larger.
- Identical icon-card grids, icon circles, emoji, and decorative Lucide icons above headings.
- Uppercase letter-spaced mono eyebrows above section headings.
- Centred hero with a badge or pill above the H1.
- Stats counters, logo marquees, testimonial carousels and "trusted by" rows without real
  evidence.
- Hype words: world-class, cutting-edge, innovative, seamless, unlock, empower, next-generation,
  leverage, robust solutions and "in today's digital landscape". Flag any copy found; do not
  rewrite approved copy yourself. Mark it `TODO(CLIENT): copy review` and list it in `TASKS.md`.
- Evenly distributed, same-sized sections. Vary scale and density deliberately.
- Dot or grid backgrounds, circuit patterns and abstract tech illustrations.

## Documents you must update

1. **Rewrite `DESIGN.md`** as the new source of truth. Cover: §0 standard and anti-patterns (the
   list above, expanded), tokens, type scale, grid, components, motion budget, imagery and the
   contrast table. Keep the section numbering that `CLAUDE.md` refers to (§0.2 template test, §3–§6
   tokens and focus, §7 motion), or update those references.
2. **Update `CLAUDE.md` §4** only where it conflicts: the typeface list (Newsreader, IBM Plex Sans
   and IBM Plex Mono replace Archivo) and any token names. Keep every other rule.
3. **Update `TECH_STACK.md` §2.2** for the new font files and licences. Record Newsreader's OFL
   licence in `docs/LICENCES_SERVICES.md`.
4. **`TASKS.md`:** add a "Redesign" phase with the checklist below and log judgement calls in the
   decisions log (one line each).

## Suggested order of work (one TASKS.md item at a time, one small commit each)

1. Tokens, fonts and base styles in `globals.css`, then run `check:contrast`.
2. Primitives: Button, Link, Container, Figure, SectionHeader, SpecBlock, Placeholder, DrawingRule.
3. Header, mobile menu and TitleBlockFooter.
4. Home, section by section, in `PROJECT.md` §7 order.
5. Service template and services overview.
6. About and Credentials.
7. Insights index, article and prose styles.
8. Contact, thank-you, 404 and legal.
9. Motion layer and the reduced-motion pass.
10. Image audit and replacement with placeholders.
11. Full QA pass.

Use Conventional Commits (`feat:`, `a11y:`, `perf:`, `docs:`, `chore:`). Do not push. Do not refactor
unrelated code.

## Definition of done (per page and overall)

- [ ] `pnpm typecheck`, `pnpm lint` and `pnpm build` are clean, with `check:content` and
      `check:contrast` passing.
- [ ] `pnpm test:a11y`: zero axe violations on every route.
- [ ] Manual keyboard walkthrough: logical order, visible focus that the sticky header never
      obscures (A11Y-07), and a mobile menu that traps and restores focus.
- [ ] Checked at 360, 768, 1024, 1280 and 1920px, at 200% and 400% zoom, and in Windows High
      Contrast.
- [ ] Reduced-motion check: no motion at all with the setting on.
- [ ] Lighthouse mobile ≥ 95 performance and 100 for accessibility, best practices and SEO on
      Home, one service page, Credentials and Contact. JS ≤ 100kB per route and ≤ 5 font files.
- [ ] No unmarked placeholder content, and no AI-generated or unlicensed imagery.
- [ ] **Template test** (`DESIGN.md` §0.2): could this page have its logo swapped for a SaaS
      startup or another consultancy without anything feeling wrong? If yes, rework it. The figure
      captions, section numbering, title-block footer and ruled indexes should make it
      unmistakably this client.
- [ ] Visual match against the approved Stitch screens. Where Stitch conflicts with this prompt
      (for example by adding a shadow or a gradient), this prompt wins.

## When unsure

Stop and ask. Record the question in `TASKS.md` under "Open questions" and continue with
unblocked work. Open items that affect this redesign: OPEN-01 (name casing), OPEN-02
("Consulting" in the wordmark), OPEN-04 (CTA label), OPEN-06 (credentials), OPEN-10 (brand navy)
and approved photography.
