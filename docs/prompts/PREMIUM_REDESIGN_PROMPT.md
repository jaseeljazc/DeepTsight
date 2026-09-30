# Premium redesign prompt: DeepTsight Consulting website (Home first)

This prompt is for a coding agent (Claude Code or Antigravity) working in this repository.
Paste everything below the line as the task. It **supersedes** `docs/prompts/REDESIGN_PROMPT.md`
(the restraint-first brief behind the current "switchroom" look) for visual direction. It does not
supersede `CLAUDE.md`, except for the named exceptions in "Sanctioned exceptions".

Scope of this prompt: **the Home page as the design benchmark**, plus the shared system (tokens,
primitives, header, footer, motion) it needs. Other pages are rolled out in a later, separate
step, only after the Home page is approved (see "Phase E").

---

## Role

You are a senior art director and a senior frontend engineer working as one person. You care about
typography, rhythm, pacing and accessibility at the same time. You are transforming the UI and UX
of the DeepTsight Consulting website, a founder-led OT cybersecurity, control systems and
reliability consultancy in Perth, WA. The audience is senior engineers, plant leaders and asset
owners: people who distrust marketing and notice imprecision.

## The brief in one paragraph

The current site is correct, accessible and restrained, but it is quiet to the point of being
forgettable. Transform it into something that feels **premium, unique and unmistakably this
client**, with a scroll experience that makes a visitor want to keep going. The wow comes from
**scale, pacing, precision and a few purposeful scroll-linked moments**, not from heavy animation,
effects or decoration. It must stay smooth: native scrolling, no jank, nothing that delays
reading. It must also convey the services and the core message ("one practitioner across four
disciplines, so each recommendation accounts for the other three") more clearly than it does today.

## What "premium" means here (the measurable version)

Apply these as checks, not as mood words:

- **Scale contrast.** Display type at least 6x the body size on desktop, set against small, quiet
  supporting text. Most amateur sites are uniformly mid-sized; this one must not be.
- **Whitespace as a material.** Fewer elements per screen, each given room. One idea per viewport
  on desktop.
- **One accent, used sparingly.** Client primary `#0E50ED` (and its on-dark variant) only.
  Everything else is neutral. A second accent colour is a defect.
- **Typographic finish.** `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs,
  tabular numerals for data, hanging punctuation where supported, correct dashes and
  non-breaking spaces in standards references (for example "ISA/IEC 62443"), optical alignment of
  large type to the grid edge.
- **Hairline precision.** 1px rules, consistent 8px baseline, every element on the grid. Nothing
  "roughly" aligned.
- **Rhythm.** Alternate light and dark bands, dense and airy sections, full-bleed and contained
  layouts. No two adjacent sections share the same layout.
- **Restraint in motion.** See "Motion budget". If a motion does not explain something or guide the
  eye, remove it.

## Read first, in this order

1. `CLAUDE.md`: all rules apply except where "Sanctioned exceptions" below says otherwise.
2. `PROJECT.md`: client, audiences, services, tone (§8), Home section order (§7).
3. `REQUIREMENTS.md`: every FR, A11Y, PERF, SEC and SEO requirement is still the acceptance bar,
   including the Home nine-section order (FR-11).
4. `DESIGN.md`, `ARCHITECTURE.md`, `TECH_STACK.md`, `TASKS.md`, `pending_work.md`.
5. `src/styles/globals.css`, `src/content/source/home.ts`, `src/content/source/media.ts`, and the
   components under `src/components/sections`, `primitives`, `layout` and `content`.

Do not work from memory of these files. Read them.

## What must not change

- The content adapter `@/content`, the Zod schemas, routes, slugs, metadata, JSON-LD, sitemap and
  robots.
- The enquiry form's Server Action, validation, spam protection, rate limiting and progressive
  enhancement. Only presentation changes.
- Server Components by default. `"use client"` only where genuinely required (mobile menu, form,
  and at most one tiny motion helper, only if CSS scroll timelines cannot do the job).
- CSP: no inline scripts, no `unsafe-inline`, no third-party requests, self-hosted fonts.
- No new dependency without asking. Animation libraries (Framer Motion, GSAP, Lenis, Locomotive,
  any smooth-scroll or scroll-jacking library) are **rejected**.
- Budgets: LCP <= 2.0s, CLS <= 0.05, JS <= 100kB per route, font files within the budget in
  `TECH_STACK.md`.
- WCAG 2.2 AA, 44x44px targets, visible focus, reduced-motion support, keyboard operability.

## Never guess

`CLAUDE.md` §3 applies in full.

- Do not invent client facts: credentials, employers, dates, client names, project outcomes,
  statistics, testimonials, phone numbers, addresses, publication titles.
- Do not invent numbers to make a section look impressive. **No stats, counters or metrics
  unless verified and present in content data.**
- Diagrams must be **generic standards concepts only** (for example zones and conduits from
  ISA/IEC 62443, or the boundary between enterprise and operational networks). They must never
  depict, imply or resemble a real client site, network topology, IP addressing or vulnerability
  (`CLAUDE.md` §6). Label text in diagrams goes through the content adapter and is listed for
  client review.
- New or improved copy may be drafted only as **clearly flagged proposals**: mark it
  `TODO(CLIENT): copy review` and list every changed string in `TASKS.md`. Approved copy stays
  unchanged. Follow the tone rules in `PROJECT.md` §8. No hype words ("world-class",
  "cutting-edge", "seamless", "unlock", "empower", "next-generation", "leverage").
- If something is ambiguous, stop and ask. Record it in `TASKS.md` under "Open questions" and
  continue with unblocked work.

## Sanctioned exceptions to `CLAUDE.md` §4

The owner has approved **selective** relaxation. Only the exceptions in this table are permitted.
Everything else in `CLAUDE.md` §4 still applies. Anything not listed here stays banned.

| #   | Exception                      | Allowed                                                                                                                                                                        | Still banned                                                                                                            |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| E1  | Tonal depth on dark bands      | A single-hue, low-contrast tonal gradient built from existing ink tokens, on the dark hero and dark bands only                                                                 | Gradients on buttons, text, cards or light sections. Rainbow, purple, or blue-to-purple gradients. Mesh gradients. Glow |
| E2  | Scroll-pinned sequences        | One CSS `position: sticky` section per page where a diagram builds as the user scrolls (native scroll, `animation-timeline`)                                                   | Scroll-jacking, snap-scroll takeover, horizontal hijack, any JS-driven scroll                                           |
| E3  | Functional inline-SVG diagrams | Diagrams that explain the work (convergence of four disciplines, zones and conduits). 1.5px line style, token colours, text alternative or `aria-hidden` plus prose equivalent | Decorative illustration, abstract tech art, circuit patterns, globes, padlocks, shields, hooded figures                 |
| E4  | Image grading                  | A consistent CSS treatment (`filter`, tone overlay from tokens, art-directed crops) so mixed imagery feels like one set                                                        | Blur, glassmorphism, colour glows, image text                                                                           |
| E5  | Display typography             | Much larger display sizes, variable weight or optical size, and, if the direction needs it, one new self-hosted OFL display face                                               | System fonts, Inter, Roboto, Arial, Poppins, Montserrat. Exceeding the font-file budget without asking                  |
| E6  | Radius                         | 0px, 2px or 4px only, as today                                                                                                                                                 | Anything larger, pills (except the live status dot)                                                                     |

Still banned regardless: drop shadows, glass or blur effects, glows, emoji icons, animated
counters, particle or circuit backgrounds, decorative illustration, stock-cyber clichés,
raw hex in components, Tailwind default colour utilities, arbitrary Tailwind values.

Every exception you use must be added to `DESIGN.md` §0 and to `CLAUDE.md` §4 as a
"Sanctioned exceptions" table (mirror the table above), and logged in the `TASKS.md` decisions
log. If you need an exception that is not in the table, stop and ask.

## Imagery

Use the AI-generated mock images that already exist in `public/images/` and are registered in
`src/content/source/media.ts`. The owner has approved this for the design phase.

- Keep every image flagged and captioned as "Representative image" (and the founder portrait as a
  mock, "not a photograph of the founder"). Do not caption AI images as real. Do not present the
  portrait as Deepak.
- Do not generate new images and do not add new image files.
- Make them feel like one set with E4: consistent grade, considered crops, per-image focal point,
  and correct aspect-ratio tokens.
- Every frame must be built so a real photograph can replace the file in `media.ts` with **zero
  layout change** and no other code edit.
- The unresolved items stay open in `TASKS.md`: approved photography, and the portrait not being
  the founder.
- The main visual interest comes from typography and the diagrams (E3), not from photos. If a
  section looks weak without a photo, fix the layout, not the photo.

## Phase A: direction proposal (STOP after this phase)

The owner has asked you to **propose the visual direction**. Do not start building yet.

1. Read the files above and audit the current Home page at 360, 768, 1280 and 1920px (run the
   app, take screenshots, scroll it). List, in plain terms, what makes it forgettable.
2. Propose **three** distinct directions, each in one short written block:
   - Name and one-sentence idea (must be specific to an OT/critical-infrastructure consultancy,
     not generic "modern tech").
   - Palette: which mix of light and dark bands, and how `#0E50ED` is used. Every pair must pass
     `scripts/check-contrast.ts`.
   - Type: display face and pairing (existing Archivo and IBM Plex, or one new OFL face) with sizes
     for display, H2, lead and body.
   - Hero composition: layout, what carries the image, what the first scroll reveals.
   - The scroll story: the ordered list of signature moments (see "Home scroll story").
   - How it passes the template test in `DESIGN.md` §0.2.
   - Risks: performance, accessibility, contrast.
3. Recommend one direction and say why.
4. If useful, build **local, static** preview pages under `docs/design-options/` (plain HTML and
   CSS, no external requests, not linked from the site) so the owner can compare them. Nothing
   from this repository is uploaded anywhere.
5. **Stop and wait for the owner to pick a direction.** Do not begin Phase B until they have.

## Phase B: system

After approval, in this order, one `TASKS.md` item at a time, one small commit each:

1. Tokens, type scale and motion tokens in `globals.css` (single source of truth). Then run
   `pnpm tokens` and `check:contrast`.
2. Fonts, if a new face was approved (self-hosted `next/font/local`, `adjustFontFallback`, no CLS).
3. Primitives: extend the existing Button, Link, Container, Figure, SectionHeader, SpecBlock,
   IndexList, ProcessSequence. Do not create a second Button or Link. Add only what the approved
   direction needs (for example a `PinnedSequence` wrapper and a `Diagram` figure wrapper).
4. Header (sticky, persistent contact action, scroll-state hairline, scroll-progress rule) and
   footer, restyled to the direction.

## Phase C: Home scroll story

Keep the nine sections and their order from `PROJECT.md` §7 / FR-11. Change how each one looks,
paces and behaves. Use the approved direction to decide the exact composition. The intent for
each section:

1. **Hero.** The strongest typographic moment on the site: the positioning statement set very
   large, left-aligned on the grid, with the `SpecBlock` facts (Based, Disciplines, Standards,
   Engagement) as quiet supporting detail. One primary and one secondary action (FR-12). The
   image is graded and art-directed. Above the fold nothing animates before LCP; the H1 and hero
   image render immediately. A subtle "continue" cue is allowed only if it is static or reduced-motion safe.
2. **Trust strip.** Verified items only (FR-13). Render as a precise ruled register. While items
   are unverified, they stay clearly marked placeholders in non-production builds. Never make it
   look complete when it is not.
3. **Core capabilities.** The four disciplines as a large ruled index, not a card grid. Big
   numbered titles, one-line outcomes, whole row is one link with a meaningful accessible name.
   Hover and focus-visible reveal the related image.
4. **Why DeepTsight: the convergence moment (E2 + E3).** This is the signature scroll moment. A
   pinned sequence in which four lines (the four disciplines) converge into one as the user
   scrolls, paired with the "one accountable practitioner" copy and the three pillars. Static,
   fully readable layout when JS, scroll timelines or motion are unavailable. On mobile, stack it.
5. **Problems addressed.** A ruled situation-to-approach ledger (real `<table>` with `<caption>`
   and `<th scope>`), with the generic zones-and-conduits diagram (E3) that draws in as it enters
   view. Diagram is generic and needs client review of its labels.
6. **Delivery approach.** The dark band. Assess, Architect, Implement, Assure as a large
   `<ol>` with a connecting line that fills on scroll. This is where E1 tonal depth is used.
7. **Selected proof.** Anonymised `ProjectNote`s only when `disclosureApproved` is true (FR-15).
   If none, the section is omitted, not padded.
8. **Perth and sector context.** A full-bleed graded image with a large statement and the sector
   list. Restrained and calm.
9. **Final conversion.** Very large invitation to discuss an operational challenge, one primary
   action, the email alternative, and the operational-data warning. The pacing should slow here.

### Pacing rules for the whole page

- No two adjacent sections use the same layout or the same background.
- Alternate: dark hero, light, light, **dark convergence or dark delivery**, light, image, dark
  or ink close. Decide the exact pattern in Phase A.
- Every section has a scannable claim first and substantiating detail underneath (`PROJECT.md` §4).
- Lead with client problems and outcomes. Credentials are evidence, not the opening message.
- Section numbering, if used, is a small mono number beside the H2, never an uppercase mono
  eyebrow above the heading.

## Motion budget

CSS-first, no library, native scroll. Total signature moments on the Home page: **at most five**.

- Allowed: CSS scroll-driven animation (`animation-timeline: view()` and `scroll()`) inside
  `@supports`, opacity and translate reveals (12-16px, once), line-draw on hairlines and
  diagrams, one pinned sequence (E2), gentle image parallax (6-8%, oversized image, no gaps),
  hover and focus underline and rule draws.
- Timing: 150-400ms for interactions, `cubic-bezier(0.2, 0, 0, 1)` or the existing
  `--ease-out-quint`. No bounce, spring or stagger longer than three items.
- Content must be fully visible and readable **without** motion, without JS and in unsupported
  browsers. An animation may enhance but never gate content.
- `@media (prefers-reduced-motion: reduce)` gives a fully static page, no exceptions (A11Y-16).
- Zero layout shift. Animate only `transform` and `opacity` (and clip or `stroke-dashoffset` for
  line draws). Nothing above the fold animates before LCP.
- Forbidden: scroll-jacking, smooth-scroll libraries, custom cursors, marquees, counters, typing
  effects, floating shapes, page transitions, autoplay video, parallax on text.

## UX requirements

- **Navigation.** Predictable nav (About, Services, Credentials, Insights, Contact) and a
  persistent visible contact action. Nothing reachable only by hover. Mobile full-screen menu
  keeps its focus trap, Escape to close and focus restoration (FR-04).
- **Conversion path.** Primary action appears in the header, hero, after the capabilities and in
  the final section. Secondary and supporting actions follow `PROJECT.md` §3. Labels come from
  `site.ts`.
- **Two readers on one page.** A skim-reading executive must get the whole story from headings
  and first lines alone. A sceptical principal engineer must find depth (standards, scope,
  method) one step deeper, without hunting.
- **Orientation.** The scroll-progress rule in the header, clear section rhythm, and an anchor
  rail only where a page is long enough to need one. Do not add it to Home unless it helps.
- **Mobile first-class.** Pinned sequences become stacked and readable. Thumb-reach primary
  action. Type scales fluidly with `clamp()`. No horizontal scroll at 360px or 400% zoom.
- **Forms.** Presentation only. Labels above fields, "required" in text, linked errors, error
  summary receives focus.
- **Performance is UX.** `priority` only on the hero image. Lazy-load the rest. AVIF/WebP with
  explicit aspect ratios. No layout shift from images or fonts.

## Accessibility

Target WCAG 2.2 AA on every route.

- Pinned and scroll-linked content is fully operable by keyboard and screen reader. Nothing
  depends on scroll position to be perceivable. Reading order in the DOM matches the visual order.
- Diagrams have a text alternative or are `aria-hidden` with the same meaning stated in the copy.
- Contrast: run `scripts/check-contrast.ts` on every text and non-text pair, including on-dark
  text over the tonal gradient at its **lightest** point.
- Focus ring: 2px, 2px offset, never hidden under the sticky header (A11Y-07).
- Not colour alone for any state. Check Windows High Contrast and forced-colors.

## Phase D: verification (evidence before claims)

Do not say it is done until you have run these and read the output:

- `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:a11y` (zero axe violations on every
  affected route, desktop and mobile).
- Screenshots of Home at 360, 768, 1024, 1280 and 1920px, at 200% and 400% zoom, with reduced
  motion on and off. Actually scroll the page and check each signature moment.
- Keyboard walkthrough of the whole page, and the mobile menu focus trap.
- Lighthouse mobile on Home: performance >= 95, accessibility, best practices and SEO at 100.
  Record the numbers. Confirm LCP, CLS, JS size and font-file count against budget.
- Independent review: run the **UI Finish-Gate Reviewer** and **Persona Walkthrough Specialist**
  agents against the built Home page (personas: a plant operations manager, an OT security lead,
  an asset-owner executive) and fix what they find, or record why you did not.
- **Template test** (`DESIGN.md` §0.2): could this page have its logo swapped for another
  company's, or be mistaken for a SaaS landing page, without anything feeling wrong? If yes,
  rework it.
- **De-slop pass:** run the `deslop` skill in audit mode over the Home page copy and UI and fix
  the findings that are UI-only. Copy findings go to the client-review list, not silent edits.

## Documents you must update

1. `DESIGN.md`: new direction, tokens, type scale, motion budget, sanctioned exceptions (§0),
   imagery rules, contrast table. Keep the section numbers `CLAUDE.md` refers to, or update the
   references.
2. `CLAUDE.md` §4: add the "Sanctioned exceptions" table and any changed typeface or token names.
   Change nothing else.
3. `TECH_STACK.md` §2.2 and `docs/LICENCES_SERVICES.md` if a font is added.
4. `TASKS.md`: add a "Premium redesign, Home" phase with the checklist below, list every proposed
   copy change, and add one decisions-log line per judgement call.
5. `pending_work.md`: keep it accurate. Do not delete items.

## Phase E: rollout (do not start without approval)

When the owner approves the Home page, propose, do not execute, the rollout order: services
overview and the four service pages (one template), About, Credentials, Contact and thank-you,
Insights, legal, 404. For each, list which Home patterns are reused and what new pattern is
needed. Wait for approval before touching them.

## Working style

- One `TASKS.md` item at a time. Small commits in Conventional Commits form. Do not push.
- Do not refactor unrelated code. Keep files under about 200 lines.
- Say plainly what passed and what did not. Do not tick a box because the code exists.

## Definition of done (Home)

- [ ] Owner approved the Phase A direction in writing before any build work
- [ ] Only the sanctioned exceptions were used, and they are recorded in `DESIGN.md` and
      `CLAUDE.md`
- [ ] Home keeps all nine sections in FR-11 order, with at most five signature motion moments
- [ ] Fully readable and complete with reduced motion on, JS off and no scroll-timeline support
- [ ] `typecheck`, `lint`, `build`, `test:a11y` clean
- [ ] Screenshots and Lighthouse numbers recorded, and budgets met
- [ ] Independent reviewers run, findings resolved or recorded
- [ ] Template test and de-slop pass done
- [ ] No invented facts, no unmarked placeholders, all AI images still marked as representative,
      all changed copy listed for client review
- [ ] Every image swappable through `media.ts` alone
- [ ] `TASKS.md` and `pending_work.md` updated

## Open items to raise with the owner (do not guess)

Logo file still missing (OPEN-10 brand navy depends on it), name casing (OPEN-01), whether
"Consulting" appears in the wordmark (OPEN-02), primary CTA label (OPEN-04), approved photography,
and the correct About story (ATCO Power vs ATCO Australia). Ask when the work reaches them.
