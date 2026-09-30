# Product

<!-- impeccable:product-schema 1 -->

Derived from `PROJECT.md` (source of truth). If the two disagree, `PROJECT.md` wins.

## Platform

web

## Users

Senior people who commission or scrutinise industrial engineering and OT cybersecurity work, reading
on a desktop or phone, sceptical of marketing language:

- Plant and operations leaders: delivery capability, operational risk, plant availability.
- Engineering and technical leaders: technical depth, suitability for complex upgrades.
- OT cybersecurity and risk leaders: standards alignment (ISA/IEC 62443), architecture, real plant experience.
- Asset owners and executives: business value, risk reduction, a short enquiry path.
- Partners and recruiters: specialist expertise, location, professional standing.

The same page is read by a skim-reading executive and a sceptical principal engineer. Every section needs a
scannable claim and a substantiating detail underneath.

## Product Purpose

A credibility platform and lead-generation channel for DeepTsight Consulting (DeepTsight Pty Ltd), a
founder-led industrial engineering consultancy in Perth, Western Australia. Success is a qualified visitor
who trusts the practitioner quickly and sends a low-friction professional enquiry.

## Positioning

One practitioner covers control systems and E&I engineering, OT cybersecurity, IT/OT segregation and plant
reliability, with hands-on site experience, so each recommendation accounts for plant availability and
implementation reality rather than being theoretical security or reliability advice. Positioning statement:
"Deep technical insight for safer, more reliable and more secure industrial operations."

## Operating Context

Enterprise and operational-technology environments in heavy industry and critical infrastructure. Visitors
evaluate a consultant's judgement before a first conversation. Enquiries must never carry site names, network
details or vulnerability information.

## Capabilities and Constraints

- Four services, each a child page under `/services`: control systems and E&I engineering, OT cybersecurity
  and network architecture, IT/OT segregation, plant reliability and asset lifecycle.
- Home section order is fixed (FR-11): hero, trust strip, core capabilities, why DeepTsight, problems
  addressed, delivery approach, selected proof, Perth and sector context, final conversion.
- Statically rendered Next.js site; content read only through the `@/content` adapter; enquiry form is a
  Server Action. WCAG 2.2 AA, strict CSP, no third-party scripts, self-hosted fonts, performance budgets in
  `REQUIREMENTS.md`.
- Never invent client facts. Unverified values are marked placeholders (`TODO(CLIENT)` / `[PLACEHOLDER]`).
  Nothing may identify a third party's infrastructure.
- Undecided: name casing (OPEN-01), "Consulting" in the wordmark (OPEN-02), primary CTA label (OPEN-04),
  approved credentials and projects (OPEN-06), brand navy from the logo (OPEN-10), service area, response time.

## Brand Commitments

- Client primary colour `#0E50ED`, used for actions, markers, active states and focus.
- Tone: technical and direct, calm and assured, specific and credible. No hype words, no fear-based
  cybersecurity messaging, no exaggerated claims.
- Sentence case for headings, buttons and labels.

## Evidence on Hand

- Standards knowledge and service scope are described in `src/content/source/*`.
- Credentials, publications, project examples and client references are **not yet verified**; they render as
  marked placeholders and must not be fabricated.
- No real photography and no photograph of the founder. All current images are AI-generated mocks, captioned
  as representative (`src/content/source/media.ts`); the founder portrait is not the founder.
- Logo file not yet received.

## Product Principles

1. Lead with the client's operational problem and outcome; credentials are evidence, not the opening message.
2. Precision over persuasion: every claim is specific, verifiable and calm.
3. One practitioner, four disciplines: the site's structure should make that convergence visible.
4. Accessibility, performance and security are part of the credibility, not a later pass.
5. Nothing unverified is presented as fact.

## Accessibility & Inclusion

WCAG 2.2 Level AA on every page: keyboard operable, visible focus, 44x44px targets, reduced-motion support,
zero axe violations.
