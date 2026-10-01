# DESIGN.md

The design system for DeepTsight Consulting. Values here are binding. If an implementation
disagrees with this file, the implementation is wrong.

**Design intent: "the engineering record", set in a switchroom.** The site should read like a
well-made engineering deliverable, such as a design report, a drawing sheet or a commissioning
dossier. Its materials come from the place the work happens: the light grey of an enclosure
panel and anthracite ink, with one confident brand blue (`#0E50ED`, supplied by the client) marking every action and label. It should feel expensive
through precision, never through decoration.

Replaced on 24 September 2026. The previous system (navy grounds, signal amber and card grids)
was rejected as generic. See the TASKS.md decisions log.

> **Restored to this repository on 1 October 2026** from the copy in `../deeptsight-website/`, the
> latest known version (audit M-09). The site has since moved on in places, some of them by owner
> decision. Those departures are listed in §10. Until the owner resolves each one, read §10 alongside
> the section it names: it records what is built, not a change to the rules.

---

## 0. The standard this site is held to

**This site must look like it was designed by a person for this specific client.** A senior
engineer landing on it should register within about two seconds that a competent professional
built it deliberately. If the logo could be swapped for any other B2B company's without anything
feeling wrong, the design has failed, however many rules below it satisfies.

DeepTsight is one person selling judgement to asset owners, and the website is the first work
sample a prospect sees. A templated site implies a templated consultancy.

### 0.1 What makes it this client's site

These four signature devices carry the identity. Use them consistently and do not invent new ones:

1. **Figure captions.** Every image is a numbered figure ("Fig. 03 Control system enclosure...")
   in the manner of a technical report. Numbers are generated per page by a CSS counter.
2. **Label plates.** Small primary-blue plates with white mono text hold numbers that carry real
   sequence: service parts (1.0 to 9.0), the capability index (01 to 04), register categories and
   principles. They sit beside a heading, never stacked above it.
3. **Ruled schedules instead of cards.** Specification blocks, ledgers, the capability index and
   the credentials register are hairline-ruled lists and tables, set like drawing schedules.
4. **The title-block footer and drawing rule.** The footer ends in a ruled strip of issue details
   (entity, ABN, location, document, revision, copyright). A 1px rule with column tick marks opens
   the hero and each interior page header.

### 0.2 Specific tells that are forbidden

These are the patterns that make a page read as machine-made. Each one is a defect.

**Visual**

1. Drop shadows of any kind. Depth comes from surface steps and 1px rules only.
2. Radii above 4px, or pill buttons. The only exceptions are radio controls and native form
   affordances.
3. Gradients of any kind, gradient text, glass, blur, glow and coloured shadows.
4. Identical rounded cards in a grid as a page structure. Icon-plus-heading-plus-text tiles.
5. Decorative background patterns: circuits, grids, dots, mesh and blurred blobs.
6. Cyber clichés in imagery: padlocks, shields, globes, binary, hooded figures and blue glow.
7. The primary blue used as a section background or large fill, or a second accent colour added beside it.

**Typographic**

8. An uppercase tracked eyebrow above a heading. Section numbers go on a label plate beside the
   heading, and only where the sequence means something.
9. One word in a heading picked out in a different colour or weight.
10. Three-word alliterative headings, Title Case and ALL CAPS.
11. Meta strings joined with middle dots (`Perth · Control systems · 2026`).
12. `→` typed into link or button text. Arrows are 1.5px line icons, used on primary actions only.
13. Mono used as a costume. Mono is for data: standards references, identifiers, dates, figure
    numbers and step codes.

**Content-shaped**

14. Stat blocks of round invented numbers, and any unverified claim presented as fact (CLAUDE.md
    §3).
15. "Trusted by" logo walls, testimonial components with no testimonials, and filler FAQs.
16. Copy that hedges without saying anything. Every sentence must survive the question: _would a
    principal engineer say this out loud?_

**Motion**

17. The same fade-and-rise entrance on every section.
18. Counters, typing effects, marquees, carousels, cursor effects, scroll-jacking and page
    transitions.
19. Any motion that hides content by default, delays the hero, or shifts layout.

### 0.3 How to use this list

It is calibration, not a checklist. If you reach for a device because pages like this usually
have one, rather than because this content needs it, treat it as forbidden. Before calling any
page done, ask: **could this have come from a template?**

---

## 0.4 Where the values live

**`src/styles/globals.css` is the single source of truth.** Every colour, spacing step, size,
width, radius, aspect ratio, type step, easing and motion distance is a token there, and editing a
token changes the whole app:

| Group         | Examples                                                                                          | Utilities                                                    |
| ------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Colour        | `--color-primary`, `--color-ink-900`                                                              | `bg-primary`, `text-ink-900`, `border-rule`                  |
| Spacing base  | `--spacing` (0.25rem)                                                                             | every `p-*`, `m-*`, `gap-*`, `inset-*` step                  |
| Named sizes   | `--spacing-control`, `--spacing-target`, `--spacing-header`, `--spacing-marker`                   | `h-control`, `min-h-target`, `h-header`, `size-marker`       |
| Widths        | `--container-page`, `--container-measure`, `--container-headline*`, `--container-prose-*`         | `max-w-page`, `measure`, `max-w-headline`                    |
| Radius        | `--radius-control`, `--radius-panel`                                                              | `rounded-control`, `rounded-panel`                           |
| Aspect        | `--aspect-wide`, `--aspect-landscape`, `--aspect-classic`, `--aspect-portrait`                    | `aspect-wide` ...                                            |
| Type          | `--text-display` … `--text-caption`, `--tracking-heading`                                         | `text-h2`, `tracking-heading`                                |
| System values | `--icon-stroke`, `--photo-saturation`, `--section-space`, `--focus-width`, `--schematic-junction` | used by the utilities and component classes in the same file |

Components never carry raw values. ESLint rejects arbitrary Tailwind values, raw hex colours and
`strokeWidth` props. The enquiry email and the share image, which CSS variables cannot reach,
use `colorTokens` generated from `globals.css` into `src/styles/tokens.generated.ts` on every
build. The contrast check reads `globals.css` directly.

---

## 1. Status of this system

> **Proposed, pending brand confirmation.** The client supplied a logo file with no guidelines,
> and the logo is not yet in the repository. The wordmark is typeset (`Wordmark` component) and
> `ink-900` stands in for the brand navy.

**Blocking action (OPEN-10):** when the logo file is added, sample its darkest colour. If it
reads as navy rather than anthracite, move `ink-900` towards it, keeping the same lightness, and
re-run `pnpm check:content`. The rest of the palette does not change.

---

## 2. Typography

Three families, self-hosted as WOFF2 via `next/font/local` (SEC-06, PERF-09, PERF-11). There are
five files in total.

| Role                 | Family        | Weights loaded | Use                                                                  |
| -------------------- | ------------- | -------------- | -------------------------------------------------------------------- |
| Display and headings | Archivo       | 500, 600       | H1, H2, index titles, the wordmark                                   |
| Body and UI          | IBM Plex Sans | 400, 500       | Body, lead, H3, navigation, labels, buttons                          |
| Data                 | IBM Plex Mono | 400            | Standards, identifiers, dates, figure and step numbers, label plates |

Archivo is set large, at weight 500, with tight negative tracking. At display size it reads as a
technical grotesk, not a SaaS sans. Fallbacks are metric-adjusted (`adjustFontFallback`).

**Forbidden:** Inter, Roboto, Arial as a design choice, Poppins, Montserrat, Newsreader or any
editorial serif, `system-ui`, and a bare `sans-serif` chain.

### 2.1 Type scale

Defined in `src/styles/globals.css` as `--text-*` tokens and used as `text-display`, `text-h1`
and so on. Sizes are fluid with `clamp()`.

| Token     | Mobile to desktop | Line height | Tracking | Family                                   |
| --------- | ----------------- | ----------- | -------- | ---------------------------------------- |
| `display` | 40 → 84px         | 1.02        | −0.032em | Archivo 500                              |
| `h1`      | 36 → 64px         | 1.04        | −0.028em | Archivo 500                              |
| `h2`      | 30 → 50px         | 1.08        | −0.022em | Archivo 500                              |
| `h3`      | 20 → 24px         | 1.3         | 0        | Plex Sans 500, or Archivo 500 in indexes |
| `lead`    | 18 → 21px         | 1.55        | 0        | Plex Sans 400                            |
| `body`    | 17 → 18px         | 1.65        | 0        | Plex Sans 400                            |
| `small`   | 15px              | 1.5         | 0        | Plex Sans                                |
| `caption` | 13px              | 1.5         | 0        | Plex Mono                                |

- Measure: prose containers use the `measure` utility (`max-width: 68ch`).
- Headings use `text-wrap: balance` and body copy uses `text-wrap: pretty`.
- Use sentence case everywhere.
- Tabular figures (`tabular`) in tables and data.

> **Implementation note.** `cn()` registers these size names with tailwind-merge from the generated
> `fontSizeTokens`, so a new `--text-*` token in `globals.css` is picked up automatically.

---

## 3. Colour

**Strategy: restrained.** A neutral world with one brand colour, the client primary `#0E50ED`. Light theme only.

### 3.1 Grounds

| Token         | Hex       | Use                                                                |
| ------------- | --------- | ------------------------------------------------------------------ |
| `ground`      | `#ECEEEC` | Page background. An enclosure-panel grey, cool and slightly green. |
| `ground-deep` | `#DFE2DF` | Alternate sections, trust strip, closing band, image frames        |
| `panel`       | `#F6F7F6` | Lifted sections (Why DeepTsight), hovered index rows               |
| `white`       | `#FFFFFF` | Form panel, project notes, form fields                             |

### 3.2 Ink

| Token       | Hex       | Use                                                                                              |
| ----------- | --------- | ------------------------------------------------------------------------------------------------ |
| `ink-900`   | `#1B2124` | Headings, primary button, the one dark band, footer. Anthracite, standing in for the brand navy. |
| `ink-800`   | `#262E32` | Primary button hover, surfaces on the dark band                                                  |
| `ink-700`   | `#3A4448` | Body text                                                                                        |
| `steel-600` | `#555F63` | Meta text, captions, helper text, table headers                                                  |
| `control`   | `#737C80` | Input borders, dashed placeholder outlines, lamp outlines (≥ 3:1 on every ground)                |
| `rule`      | `#C9CECB` | Decorative hairlines only                                                                        |
| `rule-dark` | `#3D474B` | Hairlines on the dark band and footer                                                            |

### 3.3 Primary and states

| Token             | Hex       | Use                                                                                                                                                                                                       |
| ----------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primary`         | `#0E50ED` | Client brand primary. Primary buttons, label plates (white text), terminal markers, active nav and contents rules, checked controls, link-underline hover, focus ring on light grounds, the sequence fill |
| `primary-deep`    | `#0A3FC2` | Primary button hover                                                                                                                                                                                      |
| `primary-on-dark` | `#7AA2FF` | Tint of the primary for the dark band and footer: focus ring, sequence lamps, link-underline hover, on-dark button fill (ink text)                                                                        |
| `on-primary`      | `#FFFFFF` | Text on primary                                                                                                                                                                                           |
| `on-dark`         | `#E6E9E8` | Text on ink                                                                                                                                                                                               |
| `on-dark-muted`   | `#A3ADB1` | Secondary text on ink                                                                                                                                                                                     |
| `error`           | `#A4271B` | Error text and borders, always paired with an icon and words                                                                                                                                              |
| `status`          | `#2F6B3A` | "Current" status marker, always paired with the word                                                                                                                                                      |

**Primary rule:** the primary marks actions, states and the few signature devices. It never fills a
section or band, never sets body copy, and is never the only cue for a state. On `ink-900` use
`primary-on-dark`, because `#0E50ED` itself is only 2.6:1 there.

Tailwind's default palette is removed (`--color-*: initial`). Any class outside this table does
not compile.

### 3.4 Changing the primary

The client supplied `#0E50ED` as the primary on 24 September 2026. If it changes, update the four
`primary*` tokens together and re-run `pnpm check:content`.

### 3.5 Contrast

`scripts/check-contrast.ts` checks every pair below and fails the build under threshold. All
pairs pass.

| Pair                                                                    | Minimum | Notes                                                 |
| ----------------------------------------------------------------------- | ------- | ----------------------------------------------------- |
| `ink-900`, `ink-700`, `steel-600`, `error` on every ground and on white | 4.5:1   | lowest is `steel-600` on `ground-deep` at about 5.2:1 |
| `control` on every ground                                               | 3:1     | lowest is `ground-deep` at about 3.2:1                |
| `ink-900` focus ring on every ground                                    | 3:1     |                                                       |
| `on-dark` and `on-dark-muted` on `ink-900` and `ink-800`                | 4.5:1   |                                                       |
| `primary` on every ground and on white                                  | 4.5:1   | lowest is `ground-deep` at 4.75:1                     |
| `on-primary` on `primary` and `primary-deep`                            | 4.5:1   | 6.2:1 and 8.4:1                                       |
| `primary-on-dark` on `ink-900` and `ink-800`                            | 4.5:1   | 6.5:1 and 5.6:1                                       |
| `ink-900` on `primary-on-dark`                                          | 4.5:1   | on-dark button label                                  |

---

## 4. Space and grid

- 12 columns, a 1280px content width (`Container`: `max-w-[1344px]` including 32px gutters), and
  20px side margins on phones.
- Section rhythm: `section-y` = `clamp(5rem, 9vw, 9.5rem)`, with `section-y-tight` for dense
  bands. There is more space above a heading than below it.
- The default composition is a title column (4 of 12) beside a content column (8 of 12). Break
  it deliberately for full-bleed figures, the dark band and alternating feature blocks.
- Vary density on purpose. A dense ledger is followed by a quiet section, and the page ends on a
  real close.

---

## 5. Shape and depth

- Radius is `rounded-control` (2px) for buttons, inputs and plates, and `rounded-panel` (4px) for
  the form panel, project notes and placeholders. Nothing else is rounded.
- No shadows. Tailwind's shadow scales are removed in `@theme`.
- Depth comes from ground steps (`ground`, `ground-deep`, `panel`, `white`) and 1px rules.
- Hairline conventions: `ink-900` 1px for the top rule of a schedule, `rule` 1px between rows.

---

## 6. Interaction and focus

### 6.1 Controls

- **Primary button:** `primary` fill, white text, 52px tall and 2px radius. It darkens to
  `primary-deep` on hover, and a 3px ink bar draws along its base on hover and focus. The arrow icon appears on primary actions only.
- **Secondary button:** 1px ink outline that inverts on hover.
- **On-dark primary** (`buttonPrimaryOnDark`): `primary-on-dark` fill with ink text, for the dark band.
- **Text link:** `link-rule` utility, a 1px `control` underline that thickens to 2px and turns
  primary on hover and focus.
- **Inputs:** 52px tall, white, 1px `control` border that turns ink on focus. Errors get a 2px
  `error` border, inline error text with an icon, and `aria-describedby`.

### 6.2 Focus

A 2px outline with a 2px offset on everything focusable. It is `primary` on light grounds and
`primary-on-dark` inside `.on-dark` regions. Never remove it without a replacement. Anchor targets clear
the sticky header (`scroll-margin-top`).

### 6.3 Targets

At least 44×44px everywhere (project standard, A11Y-09). Footer links, breadcrumbs and contents
links carry `min-h-[44px]`.

---

## 7. Motion

The motion budget is CSS-sized: no library, no JavaScript scroll listeners. Scroll-driven effects
use CSS scroll timelines as progressive enhancement. Browsers without support, and anyone with
`prefers-reduced-motion: reduce`, get the finished state. Nothing animates above the fold before
LCP.

| Effect                                     | Where                                                        | Mechanism                                                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Energising sequence** (the focal moment) | Delivery approach band, service part 5.0                     | The conductor fills with the primary (its light tint on the dark band) and each stage lamp lights in turn as the list scrolls through (`.sequence`, `view-timeline`) |
| Parallax drift                             | Large figures flagged `parallax` (hero, Perth, page headers) | Image layer oversized by 8% and translated ±6% on the frame's view timeline                                                                                          |
| Figure wipe                                | Below-the-fold figures flagged `reveal`                      | `clip-path` inset from the top, scrubbed over the first 75% of entry                                                                                                 |
| Schematic draw                             | Convergence schematic                                        | Discipline lines scale in from the left                                                                                                                              |
| Header hairline                            | Site header                                                  | Border fades in over the first 96px of scroll (`scroll(root)`)                                                                                                       |
| Index row                                  | Capability and related-service indexes                       | Panel ground, arrow nudge and a 4:3 thumbnail clip-reveal on hover and `:focus-visible` (≥ lg)                                                                       |
| Link underline and button bar              | Everywhere                                                   | 150–200ms transitions                                                                                                                                                |

- Easing is `--ease-standard` `cubic-bezier(0.2, 0, 0, 1)` for state changes and
  `--ease-out-quint` for reveals. There is no bounce.
- Only transforms, opacity and clip-path animate. Layout properties never do.
- Adding any new motion requires a matching reduced-motion state and a reason from the list in
  §0.2.

---

## 8. Components

Primitives live in `src/components/primitives`, composed parts in `src/components/content`, and
page sections in `src/components/sections`.

| Component                                    | Purpose                                                                                                                                                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Figure`                                     | Image or reserved slot with a numbered caption. Props: `aspect` (`wide` 21:9 relaxing to 4:3 on phones, `landscape` 3:2, `classic` 4:3, `portrait` 4:5), `parallax`, `reveal`. Mock images and slots show a `[PLACEHOLDER]` marker in the caption. |
| `SectionHeader`                              | Heading plus optional label-plate number and intro. Sizes: `display`, `h1`, `h2`, `part` (numbered parts in narrow columns).                                                                                                                       |
| `SpecBlock`                                  | Ruled `<dl>` schedule. Items may set `mono` for data values.                                                                                                                                                                                       |
| `DrawingRule`                                | 1px rule with 12-column ticks. At most once per page, plus the footer.                                                                                                                                                                             |
| `IndexList`                                  | Ruled, numbered index of links with a hover thumbnail. Replaces card grids.                                                                                                                                                                        |
| `ProcessSequence`                            | Ordered stages with the energising conductor. `orientation`: `responsive` or `vertical`.                                                                                                                                                           |
| `ProjectNote`                                | Report-extract panel for anonymised proof. Rendered only when approved in production.                                                                                                                                                              |
| `ConvergenceSchematic`                       | Single-line diagram of four disciplines through one practitioner.                                                                                                                                                                                  |
| `Table` family                               | Ruled schedule with `<caption>` and `th scope`, and horizontal scroll inside its own focusable region.                                                                                                                                             |
| `Placeholder`, `MarkedText`, `isPlaceholder` | Visibly unfinished content (dashed outline, `[PLACEHOLDER]`). `MarkedText` marks any content string carrying a marker.                                                                                                                             |
| `PageHeader`                                 | Interior page opening: breadcrumb, drawing rule, H1, lead and optional aside.                                                                                                                                                                      |
| `AnchorNav`                                  | Sticky contents rail with numbered entries and `aria-current="location"`.                                                                                                                                                                          |
| `Wordmark`                                   | Typeset wordmark with a primary terminal marker. Stands in for the logo.                                                                                                                                                                           |

---

## 9. Imagery

- **Documentary industrial photography only:** switchrooms, marshalling cabinets,
  instrumentation, process plant, site work in PPE and Western Australian industrial landscapes.
  Natural light and muted, cool-neutral grading. Images are rendered at `saturate(.82)` so mixed
  sources sit together.
- Large and deliberate: full-bleed or spanning 5 or more columns, square corners and a caption
  every time.
- **No cyber clichés, no legible labels, and nothing that identifies a real site (CR-05).**
- **Current state:** every photograph in `public/images/` is an AI-generated development mock.
  All are marked as such in `media.ts` and in their captions, and **the founder portrait is not
  the founder**. All must be replaced before launch. Reserved positions with no image render as
  dashed slot frames. Their briefs are in `docs/image-prompts/`.
- Serve through `next/image` with explicit aspect ratios, `priority` only on the first above-the-
  fold figure, and lazy loading elsewhere (PERF-10).

---

## 10. Departures from this document (to resolve with the owner)

Recorded 1 October 2026, when this file was restored. Each item says what the site does today and
which part of this document it departs from. The owner decides, for each one, whether this document
changes or the site does. Owner decisions are in the `TASKS.md` decisions log.

| #   | What the site does                                                                                                                                                                                             | Departs from                                                                                               | Status                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | `--color-ground` is `#F2F2F2` in `globals.css`                                                                                                                                                                 | §3.1 (`#ECEEEC`)                                                                                           | Unrecorded change. Contrast still passes (`pnpm check:content`)                                      |
| 2   | `--text-display` tops out at 4.75rem (76px)                                                                                                                                                                    | §2.1 (84px)                                                                                                | Decision log 2026-09-30: the hero headline wrapped to six lines                                      |
| 3   | Home uses dot-matrix devices: the dithered power-plant hero, dot numerals 01–04, a dot ramp in the delivery band, and new `--color-dot-*` tokens                                                               | §0.2 #5 (no decorative dot patterns), §0.1 ("do not invent new" devices)                                   | Owner decisions 2026-10-01                                                                           |
| 4   | The Perth section is a rotating, draggable dot-matrix globe drawn with JavaScript on a canvas, with raw hex colours                                                                                            | §0.2 #6 (no globes), §7 (CSS-only motion), §3 (colours from tokens)                                        | Owner decision 2026-10-01. Also an accessibility failure: no pause control (audit H-04)              |
| 5   | Home is built as a "marshalling rail": a hairline down every section, numbered terminal tags (T01, T02 …) and wiring between the service cards, with scroll-driven fill and a fade-up entrance on each section | §0.1 (four signature devices), §0.2 #17 (same entrance on every section), §7 (effect list)                 | Owner decisions 2026-09-30                                                                           |
| 6   | Rail tags and the capability cards join strings with " · "                                                                                                                                                     | §0.2 #11                                                                                                   | Not decided                                                                                          |
| 7   | Panel labels such as "Practice particulars" and the rail tags are set in mono                                                                                                                                  | §0.2 #13 (mono for data only)                                                                              | Not decided                                                                                          |
| 8   | Each service has a 1.5px Lucide line icon beside its title (home cards, services list and table, service page heading, related services)                                                                       | Not covered here. `CLAUDE.md` §4 allows line icons; they sit beside the title, not in icon tiles (§0.2 #4) | Owner decision 2026-10-01 (`REQUIREMENTS.md` FR-45). Icons are placeholders until the client chooses |
| 9   | Generated photographs are approved for public use as captioned "Representative image"; only the founder portrait stays a marked mock                                                                           | §9 ("all must be replaced before launch")                                                                  | Owner decision 2026-10-01 (Q-05)                                                                     |
| 10  | Components in use but not listed: `RailTag`, `DotNumeral`, `DotRamp`, `DotGlobe`, `AsciiHeroPowerPlant`, `ServiceIcon`, `Part`. `ConvergenceSchematic` is listed but no longer used                            | §8                                                                                                         | Update §8 once items 3–5 are settled                                                                 |
| 11  | Targets use the `min-h-target` token and the container uses `max-w-page` (84rem)                                                                                                                               | §6.3 (`min-h-[44px]`) and §4 (`max-w-[1344px]`) name arbitrary values, which lint now forbids              | Wording only; values unchanged                                                                       |
