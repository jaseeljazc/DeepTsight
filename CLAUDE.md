# CLAUDE.md

Operating rules for AI coding agents (Claude Code, Antigravity) on the **DeepTsight Consulting** website.
These rules override default agent behaviour. Read this file before touching anything.

---

## 1. Read order

Before your first edit in a session, read in this order:

1. `CLAUDE.md` (this file)
2. `PROJECT.md` — who the client is, what we are building, what is in scope
3. `REQUIREMENTS.md` — the acceptance criteria you are being measured against
4. `DESIGN.md` — the design system. Non-negotiable values.
5. `ARCHITECTURE.md` — folder structure, data flow, where code goes
6. `TECH_STACK.md` — pinned versions, allowed libraries
7. `TASKS.md` — the current phase and checklist
8. `pending_work.md` — the developer's plain summary of what is left (agent detail is in `TASKS.md`)

If a task touches design, re-read `DESIGN.md` §3–§6 before writing CSS. Do not work from memory of it.

---

## 2. The client context that governs every decision

DeepTsight sells **OT cybersecurity** to critical-infrastructure operators. The website is a work sample.
A sloppy dependency, a leaked key, an unnecessary third-party script or a mixed-content warning is not a
bug here — it is a lost contract. When in doubt, choose the more conservative option and note it.

Second: the audience is senior engineers and asset owners. They are allergic to marketing language and to
interfaces that feel like SaaS products. Restraint is the brief.

---

## 3. Never guess. Ever.

This is the single most important rule in this file.

- **Never invent client facts.** No qualifications, registrations, certifications, client names, project
  outcomes, dates, employers, statistics, publication titles, testimonials, phone numbers or addresses.
- Every unverified value must be written as a placeholder in the exact form:
  `TODO(CLIENT): <what is needed>` in code, or `TBD — CLIENT` in docs.
- Placeholder **copy** must be visibly marked so it can never ship by accident. Use the `<Placeholder>`
  component or prefix the string with `[PLACEHOLDER] `. Never write plausible-sounding filler that reads
  like approved copy.
- The build must fail if any `[PLACEHOLDER]` string remains when `NEXT_PUBLIC_ENV=production`.
  See `scripts/check-placeholders.ts`.
- If a requirement is ambiguous, **stop and ask**. Do not pick an interpretation and proceed. Record the
  question in `TASKS.md` under "Open questions" and continue with unblocked work.

Applies equally to technical facts: if you are unsure whether an API exists in the pinned version, check
the installed package or the version-matched docs. Do not write code from memory of an older API.

---

## 4. Design system rules (hard constraints)

**Read `DESIGN.md` §0 before writing any markup.** It states the standard the site is held to — it must
look designed by a person for this specific client, not generated from a template — and lists the
specific patterns that make a page read as machine-made. The rules below are the mechanism;
§0 is the goal, and it governs cases the rules do not anticipate.

The rest of this section comes from `DESIGN.md`. Violating any of it is a defect, not a style preference.

- **No drop shadows anywhere.** Separation is hairline borders and surface colour steps only.
- **Radius:** `2px` on controls, `4px` on panels/cards. Nothing else. No pills, no `rounded-full`
  except a live status dot.
- **Colour:** only tokens defined in `globals.css`. Never a raw hex in a component. Never a Tailwind
  default colour utility (`bg-slate-800`, `text-gray-500` etc.) — those classes are disabled.
- **Type:** Archivo (headings), IBM Plex Sans (body), IBM Plex Mono (figures, codes, standards refs only).
  Never Inter, Roboto, Arial, Poppins, Montserrat, `system-ui` or a bare `sans-serif` fallback chain.
- **No gradients, glass/blur effects, glows, coloured shadows, emoji icons, decorative illustrations,
  animated counters, or particle/circuit-pattern backgrounds.**
- **Motion** is limited to the effects listed in `DESIGN.md` §7 (CSS scroll timelines, no library), and
  every one must have a reduced-motion state.
- **`src/styles/globals.css` is the single source of truth** for colour, spacing, sizes, widths, radius,
  aspect ratios, type and motion. Components use token utilities only (`bg-primary`, `h-control`,
  `max-w-measure`, `aspect-wide`). Arbitrary values (`w-[12px]`, `max-w-[40ch]`), raw hex and
  `strokeWidth` props fail lint. Need a new value? Add a token to `globals.css` first.
- Places CSS cannot reach (email HTML, `next/og` image) import `colorTokens` from
  `src/styles/tokens.generated.ts`, which `pnpm tokens` / every build regenerates from `globals.css`.
  Never edit that file by hand.
- **Icons:** 1.5px stroke line icons only, `ink-700` or `ink-900` by default, from the single approved set.
- **Primary `#0E50ED`** (client brand colour) marks actions, label plates, markers, active states and
  focus. Never a section fill or body copy. On the dark band use `primary-on-dark`.
- Mono is used sparingly, for data. It is not a decorative label font. Do not add an uppercase mono
  eyebrow above every section heading.
- Sentence case for all headings, buttons and labels. No Title Case, no ALL CAPS except the defined
  Caption style.

If a generated result adds back shadows, large radii or a second accent colour, fix it rather than
accepting it. That regression is the known failure mode on this project.

---

## 5. Accessibility is an acceptance criterion, not a polish pass

Target is **WCAG 2.2 Level AA** on every page.

- Every interactive element is reachable and operable by keyboard, in a logical order.
- Visible focus on everything focusable: 2px ring, 2px offset, per `DESIGN.md` §6.
  Never `outline: none` without an equivalent replacement.
- Minimum target size 44×44 CSS px for all pointer targets.
- Semantic HTML first. `<button>` for actions, `<a>` for navigation. ARIA only where HTML cannot express it.
- Every form control has a programmatically associated `<label>`. Errors are announced and linked with
  `aria-describedby`. Never communicate state by colour alone.
- Images: meaningful ones get real alt text; decorative ones get `alt=""`. No text baked into images.
- Respect `prefers-reduced-motion`.
- Run `pnpm test:a11y` before declaring any page complete. Zero axe violations is the bar.

---

## 6. Content and security boundaries

- Nothing in this repo may contain client site names, plant details, network topology, IP addressing,
  vulnerability information, or anything that identifies a third party's infrastructure. Not in copy,
  not in comments, not in commit messages, not in test fixtures.
- No secrets in the repo. All secrets via environment variables, validated in `src/lib/env.ts`.
  Never log a secret, never echo `process.env`, never commit `.env*` except `.env.example`.
- Do not add a third-party script, font CDN, tracking pixel, embed or analytics tool that is not listed
  in `TECH_STACK.md`. Self-host fonts. If a library injects a remote request, it is disqualified.
- Do not weaken the Content Security Policy to make something work. Solve it the other way.
- **Local repository boundary:** Everything regarding this project (source code, content, skills, artifacts,
  design documents, and prompts) must remain strictly within this local repository. Never upload, paste,
  or sync any project files, skills, or artifacts to Claude Web (Claude.ai projects/chats) or external
  web services.

---

## 7. Code rules

- TypeScript strict. No `any`, no `@ts-ignore`, no non-null `!` assertions to silence the compiler.
- **All content is read through the content adapter `@/content`.** No component imports a data file
  directly, and no component fetches. This seam is what makes the Phase 2 CMS migration a one-file change.
  See `ARCHITECTURE.md` §4.
- Server Components by default. Add `"use client"` only where interactivity genuinely requires it, and
  put it as low in the tree as possible.
- No client-side data fetching. The site is statically rendered; the enquiry form is a Server Action.
- Reuse primitives from `src/components/primitives`. If you need a variant, extend the existing
  primitive — do not create a second Button.
- No new dependency without checking `TECH_STACK.md` §6. If it is not listed, ask first. Justify weight,
  maintenance status and licence.
- Keep files focused. If a component passes ~200 lines, it is probably two components.

---

## 8. Definition of done (per task)

A task is not complete until all of these pass:

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] `pnpm build` succeeds
- [ ] `pnpm test:a11y` — zero axe violations on affected routes
- [ ] Keyboard walkthrough done manually, focus visible throughout
- [ ] Checked at 360px, 768px, 1280px, 1920px, and at 200% browser zoom
- [ ] No placeholder content shipped unmarked
- [ ] **Template test:** re-read `DESIGN.md` §0.2 against what you built. Could this have come from a
      template, or had its logo swapped for another company's without anything feeling wrong? If yes,
      rework it before ticking the box.
- [ ] Relevant checkbox ticked in `TASKS.md`
- [ ] If the work completes an item under "Pending against the client brief" in `TASKS.md`, tick it there
      and tick the matching plain-language line in `pending_work.md` (the developer's summary). Never delete
      an item. Leave it open if it still needs a client decision.

---

## 9. Working style

- Work one `TASKS.md` item at a time. Tick it when done. Do not silently expand scope.
- Small, reviewable commits. Conventional Commits: `feat:`, `fix:`, `a11y:`, `perf:`, `docs:`, `chore:`.
- Do not refactor unrelated code while doing a task.
- When you make a judgement call the docs did not cover, add one line to the "Decisions log" at the
  bottom of `TASKS.md` saying what you chose and why.
- Do not mark a checklist item complete because the code exists. Mark it when it meets §8.
