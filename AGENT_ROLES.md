# AGENT_ROLES.md

Nine `agency-*` skills are installed on this project. They are specialists invoked for a defined job, not a committee
consulted on everything. Using all nine on every task produces slower, worse and less coherent output
than using two well.

## 1. Precedence — read this before invoking any agent

**The project documents outrank every agent skill.** These skills carry generic agency defaults, and
generic agency defaults are the exact source of the patterns `DESIGN.md` §0.2 forbids. When an agent's
guidance conflicts with `DESIGN.md`, `ARCHITECTURE.md` or `TECH_STACK.md`, the document wins and the
agent's suggestion is discarded without discussion.

Order of authority, highest first:

1. `DESIGN.md`, `ARCHITECTURE.md`, `TECH_STACK.md`, `REQUIREMENTS.md`
2. `AGENTS.md`
3. Agent skill guidance
4. Model defaults

When invoking any agent whose output touches visual design, markup or CSS, state in the prompt:
_"`DESIGN.md` governs. Do not propose shadows, radii above 4px, a second accent, gradients, or any
pattern in §0.2, and do not re-decide anything already specified there."_

An agent that proposes a settled decision again — a colour, a radius, a typeface, a component API — is
malfunctioning for this project. Reject the output rather than negotiating with it.

## 2. Roles

**One implementer.** `agency-frontend-developer` writes the code. Do not have a second agent write code
in parallel; merge conflicts and inconsistent component APIs cost more than the speed gained.

**Three gates.** These review work that already exists. They do not write code, and they run _after_ the
implementer has finished a unit of work, never alongside it.

| Gate                                    | Checks                                                                                                                                                  | Veto authority       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `agency-code-reviewer`                  | `AGENTS.md` §6, §7, §8; the `@/content` import boundary; Server Action validation, rate limiting and spam controls; no secrets or client-sensitive data | Blocks merge         |
| `agency-ui-finish-gate-reviewer`        | `DESIGN.md` §0.2 in full, §3.5 contrast, §6 component states                                                                                            | Blocks merge         |
| `agency-persona-walkthrough-specialist` | `DESIGN.md` §0.2 items 14–18 and `PROJECT.md` §8; five-second test on each page; CTA reachability for each of the five audiences                        | Blocks merge on copy |

A gate's finding is a defect. Fix it. Do not argue the finding down, and do not accept it with a note
to clean up later.

**Five advisors.** Invoked only when the named question is actually open, then not again:

- `agency-brand-guardian` — Phase 0 only, for OPEN-10 (sampling the navy from the logo) and OPEN-11
  (amber vs teal). Once the palette is confirmed, this agent has no further role.
- `agency-ui-designer` — Phase 2 only, to specify states for the hand-written primitives before they
  are built. Constrained to `DESIGN.md` §6; it specifies within the system, it does not design one.
- `agency-ux-architect` — Phase 2 only, for the mobile-nav focus trap, sticky-header and anchor-nav
  coordination, and the 12-column grid. **Must not** propose a dark-mode toggle, a theme switcher, or
  semantic surface tokens; this site is a light document with deliberate dark sections (`DESIGN.md` §5).
- `agency-ux-researcher` — Phase 0 only, to pressure-test the sitemap and credentials hierarchy before
  routes exist. After Phase 0 sign-off the sitemap is frozen; changing it later means redirects.
- `agency-inclusive-visuals-specialist` — **advisory on selection only.** See §4.

## 3. Sequence

For any unit of work:

```
implement (agency-frontend-developer)
   → self-check against `AGENTS.md` §8
   → agency-code-reviewer
   → agency-ui-finish-gate-reviewer   (only if the work touches UI)
   → agency-persona-walkthrough-specialist  (only if the work touches copy)
   → fix findings
   → commit
```

Advisors run _before_ implementation, at the start of their phase, and produce a written decision that
goes into the relevant document. They do not review.

## 4. Hard limit on generated imagery

`agency-inclusive-visuals-specialist` advises on **selecting and briefing** photography. It must not be
used to generate industrial, plant, control-room or Perth imagery, and no generated image ships on this
site.

The reason is not stylistic. The brief requires authentic imagery with documented source, licence and
usage rights (`REQUIREMENTS.md` CR-04), and the client sells engineering credibility to people who work
in these environments every day. A synthetic control room with impossible instrumentation, seen by a
principal control systems engineer, destroys the credibility the entire site exists to build. A
photograph the client owns, or no image at all, is always the better answer.

Permitted uses: writing a photography brief for the client, screening supplied images against
`DESIGN.md` §7, and checking alt text quality.

## 5. When not to use an agent

Do not invoke a gate on a one-line change, a typo fix, or a dependency bump. Do not invoke an advisor
on a question the documents already answer — look it up instead. If you find yourself running four
agents on a single component, stop: the work is small and the orchestration is now the expensive part.
