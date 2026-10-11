# Capability statement: content, brand and illustrations — plan

Date: 2026-10-11. Source: `docs/ref-pdf/DeepTsight Capability Statement.pdf` (8 pages, client-supplied),
logo pack (`Downloads/New Logo…/New Logo`), illustrations (`microicons-svg/`). Branch: the current
`feat/cms-infinite-scroll` (owner's choice). Nothing leaves this machine (no Claude Web, no artifacts).

## Owner decisions (2026-10-11)

| #   | Decision                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------- |
| B1  | Brand illustrations are used as approved client brand art: a documented exception to "no decorative illustrations / cyber clichés". |
| B2  | The site primary changes from `#0E50ED` to the logo blue `#005BAA`. Logo files are used unchanged.        |
| B3  | Illustrations are recoloured to `#005BAA` (white on the dark band). Shapes are not changed.               |
| B4  | Contact email becomes `deepak.pazhoor@deeptsight.com`; named contact Deepak Pazhoor, Principal Consultant. |
| B5  | Services are restructured to the PDF's four capabilities (new URLs, redirects from the old ones).         |
| B6  | Hero headline and tagline take the PDF's positioning lines.                                               |
| B7  | Add: How we work (replaces delivery approach) + three value points; See / Connect / Deliver + mission; industry experience timeline; project lifecycle Define → Sustain. |
| B8  | Static content and the CMS are both updated and kept in parity.                                           |

Content rule: only words from the PDF or from the site's existing approved copy. Where a new service
page needs text the PDF does not give, it reuses the matching existing approved paragraph; anything
still missing is a visible `[PLACEHOLDER]` (never invented filler).

## Phase 1 — Brand colour (B2)

- `src/styles/globals.css`: `--color-primary #005BAA`, `--color-primary-deep` (darker step, about
  `#00477F`), `--color-primary-on-dark` (light tint that passes 4.5:1 on ink-900 and ink-800),
  `--color-on-primary #FFFFFF`. Regenerate `tokens.generated.ts` (`pnpm tokens`).
- Hard-coded old blue to update: `src/components/content/power-plant-dither-paths.ts`,
  `plant-illu-dither-paths.ts`, `ascii-hero-power-plant.tsx`, `dot-globe.tsx`,
  `public/dither/globe-perth.svg`, `src/app/(payload)/admin-theme.css`. Dot-matrix devices stay;
  only their blue changes.
- `pnpm check:content` (contrast script) must pass; adjust the two derived tokens until it does.
- Docs: `DESIGN.md` §3.3/§3.4/§3.5, `CLAUDE.md` §4, `AGENTS.md` (same line).

## Phase 2 — Logo (OPEN-01, OPEN-02, OPEN-10)

- Copy SVGs into `public/brand/`: horizontal (colour), vertical (colour), black, white, favicon
  16/32/64. Logo files are not edited.
- `src/components/layout/wordmark.tsx`: renders the official horizontal logo (`<img>`, alt
  "DeepTsight", fixed aspect 400.62:78.87, height from a size token); `onDark` uses the white logo.
  Used by header, footer, mobile nav, 404. Remove the `TODO(CLIENT)` logo markers.
- Favicon: `src/app/icon.svg` (+ `apple-icon.png` from the 64px mark). Admin: `src/cms/graphics/logo.tsx`
  (`Logo` = horizontal logo + "CMS", `Icon` = the mark).
- Share image (`opengraph-image.tsx`): the logo mark drawn from the SVG file.

## Phase 3 — Illustrations (B1, B3)

- Recoloured copies (root `fill` set to the token value) in `public/illustrations/` with clean
  file names; white variant only where shown on the ink band. Rendered with `next/image`
  (`unoptimized` for SVG), explicit width/height, lazy, meaningful alt text (or `alt=""` where the
  words beside it already say everything). No animation.
- Placements (each explains something next to it, never a background pattern):
  - Why DeepTsight (Home) and About: **See / Connect / Deliver** with the three lines from the PDF.
  - Sectors (Home, Perth section): one illustration per sector — Oil and gas downstream, Oil and gas
    upstream (LNG & gas), Mining, Water, Power, Remote operations — as captioned tiles; globe stays.
  - Service pages: OT cybersecurity → zones-and-conduits diagram (`ZCR…`); Control systems → wave
    of transformation; OT governance → remote operations centre; E&I → micro graphics (plant).
  - How we work (dark band): wave of transformation (white) beside the four steps, dot ramp stays.
- `DESIGN.md` §10: new row "client brand illustrations" (owner decision 2026-10-11) and §8 component
  entry; `TASKS.md` decisions log line.

## Phase 4 — Services restructure (B5)

New services (sort order as in the PDF; titles and summaries from the PDF):

| New slug                         | Title                                  | Built from (existing approved copy)          |
| -------------------------------- | -------------------------------------- | -------------------------------------------- |
| `control-systems-engineering`    | Control systems engineering            | control-systems-ei-engineering (control part) |
| `electrical-instrumentation`     | Electrical and instrumentation         | control-systems-ei-engineering (E&I part)     |
| `ot-governance-asset-resilience` | OT governance and asset resilience     | plant-reliability                            |
| `ot-cybersecurity-iec-62443`     | OT cybersecurity and ISA/IEC 62443     | ot-cybersecurity + it-ot-segregation         |

- Redirects (308) in `next.config.ts`: old slug → new slug (it-ot-segregation → OT cybersecurity).
- Icons from the approved Lucide set; related services, figures, SEO per service; image-spot
  registry and sitemap follow the service list automatically.
- CMS: import the four new services; the four old ones are disabled (not deleted) so history stays.

## Phase 5 — Content (B4, B6, B7)

- Home: hero headline "Precision and innovation in control systems and operational technology";
  tagline "Precision. Resilience. Insight."; core capabilities title/intro from PDF p3; Why
  DeepTsight gets the About-us paragraph, See/Connect/Deliver and the mission; **How we work**
  replaces the delivery approach (Discover, Define, Engineer, Assure with PDF wording) plus three
  value points (Reliability, Cost optimisation, Specialist depth); sectors list from the PDF's sector
  exposure; final CTA "Let's build resilient industrial systems".
- About: founder title "Principal Consultant"; mission; See/Connect/Deliver; **industry experience**
  timeline 2011 / 2016 / 2020 / 2026 with the PDF's note that it includes work before the company was
  founded (the career record stays).
- Services index: **Where we support you** — five phases Define, Design, Deliver, Assure, Sustain with
  three activities each, "Engage at any phase" list and the tailoring sentence.
- Site: email → Deepak's address; contact names Deepak Pazhoor, Principal Consultant.
- Credentials already hold the PDF's four (MEng ECU, CPEng, ISA/IEC 62443 Expert, CAP); wording only.

## Phase 6 — Contract and CMS (B8, CLAUDE.md §10)

For each new field: `src/content/schema.ts` → Payload field (`src/cms/globals/index.ts`) → mapper
(`src/content/mappers`) → import (`scripts/cms/import-from-source.ts`) → migration
(`payload migrate:create`). New fields: `home.whyDeepTsight.pillars[]` + `mission`,
`home.deliveryApproach.values[]`, `about.experience[]` (+ note), `pages.services.lifecycle`
(phases, engage list, note), sector illustration key. Prove on the test database (`pnpm cms:test`),
then `pnpm cms:parity`; re-import into the Supabase test project.

## Phase 7 — Design pass and verification

- Impeccable critique of each changed section at 360/768/1280/1920 px and 200 % zoom; keyboard walk.
- Gates: `pnpm typecheck`, `pnpm lint`, `pnpm check:content`, unit tests, `pnpm build`,
  `pnpm test:a11y` (zero violations), Playwright e2e, `pnpm cms:test`, `pnpm cms:parity`. Builds need
  other apps closed (low memory on this machine).
- Docs: `TASKS.md` (decisions log, ticks), `pending_work.md`, `docs/CONTENT_PROVENANCE.md` (PDF as source).
- Commits per phase, Conventional Commits; nothing pushed.
