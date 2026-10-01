# Morning report: CMS overnight build
Branch: `cms/phase-2` · Start commit: ___ · Final commit: ___ · Started/finished: ___

## 1. Summary
Three to five sentences: what works now, what does not, the one most important thing to do next.

## 2. Phase status
| Phase | Status (done / partial / reverted / skipped) | Commit | Notes |
|---|---|---|---|

## 3. Test results
| Check | Baseline | Final (static) | Final (cms) |
|---|---|---|---|
Rows: typecheck, lint, build, E2E, axe, parity differences, new CMS tests, pnpm audit.

## 4. Needs your decision (most urgent first)
For each: what it is, why it matters, the default used tonight, your options.

## 5. Needs your action
Accounts, URLs, keys, wording from the adviser, the production database, media storage.

## 6. Decisions I made
D-16 onwards, one line each, with how to reverse.

## 7. Problems and reverted work
Exact error, what was tried, current state.

## 8. Security checks
Each check from 03 with pass or fail: REST lockdown, GraphQL off, MFA, lockout, admin CSP,
public CSP unchanged, EXIF stripping, SVG rejected, enquiry data minimal, audit log, no telemetry.

## 9. New dependencies
| Package | Version | Purpose | Licence |

## 10. How to try it
Commands to start in cms mode, the admin URL, where the dev login is (`.data/dev-admin.txt`;
do not copy values here), how to add TOTP to an authenticator app, how to switch `CONTENT_SOURCE`.

## 11. Undo and clean-up
- Restore the push URL: `git remote set-url --push origin <original-url>`
- Merge your keys from `.env.local.bak` into the new `.env.local`
- Discard everything: `git switch <previous-branch> && git branch -D cms/phase-2`
- Notes on `package-lock.json`