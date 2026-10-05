# CMS "Images on the website" page — design

Date: 2026-10-05. Status: approved in conversation, awaiting review of this written spec.

## 1. Purpose

Today an editor changes an image by finding the section that owns it (Home, About, Pages, each service,
each credential, Search results). The owner wants one admin page that shows every image the website uses,
says in plain words where each one appears, and lets the editor change, replace, re-frame or delete it
from there.

Success means: an editor who has never opened the CMS can find "the photo beside the three pillars on
Home", see what it looks like in its real frame on desktop and phone, swap it, preview the page and
publish, without opening any other section.

### Owner decisions (conversation, 2026-10-05)

| #   | Decision                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Build a new admin page (option 1), not a "used in" column on Media, not a restructured content model.                                                                        |
| D2  | "Change" offers both: pick a different image (library or upload) **and** replace the current image with a new record that copies the details and re-points every spot to it. |
| D3  | Section changes save as drafts on the owning section; Preview, then Publish. Focal point changes are drafts of the media record, published separately with Publish image.    |
| D4  | Framing is a **focal point** per image (not a fixed crop), with per-spot desktop and phone previews.                                                                         |
| D5  | Deleting an image that is in use is allowed after a warning listing every spot and a second confirmation.                                                                    |
| D6  | Connect the per-page share image (Open Graph) to the website and show share images on the page.                                                                              |
| D7  | Code-drawn graphics (dithered power plant, globe, dot numerals, dot ramp, typeset wordmark) are out of scope and say so.                                                     |

## 2. What the page shows

**Location:** a new admin view, sidebar group "Content", label **"Images on the website"**, path
`/admin/images`. The existing Media collection stays as it is.

**Tabs:** _Used on the website_ (default) and _Unused images_.

### 2.1 Used on the website

Grouped in site order. Each group heading names the page and links to it (opens the public page in a new tab).

| Group                         | Spots                                                                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home                          | Why DeepTsight (`home.media.why`) · Problems addressed (`home.media.problems`) · Closing band (`home.media.close`)                                    |
| About                         | Founder portrait (`about.media.portrait`) · Site image, lower left (`about.media.site`) · Desk image, lower right (`about.media.desk`)                |
| Services page                 | Wide image under the heading (`pages.services.figure`)                                                                                                |
| Each service (one group each) | Main image (`services.media.hero`) · Detail image beside "3.0 Capability" (`services.media.detail`) · Share image (`services.seo.ogImage`, new field) |
| Credentials page              | Image under the heading (`pages.credentials.figure`)                                                                                                  |
| Contact page                  | Image beside the form (`pages.contact.figure`)                                                                                                        |
| Credential badges             | One spot per credential that already has a badge (`credentials.badge`), optional                                                                      |
| Share images                  | One spot per fixed route (`seo.<route>.ogImage`), optional                                                                                            |

Credential badge spots are listed only for credentials that already have a badge; a badge is added from the credential's own record.

The exact field paths above are verified against `src/cms` during planning; the spot registry (§5.1) is
the authority.

**Each spot is a card** with:

- a thumbnail framed in the spot's real desktop shape (`wide`, `landscape`, `classic`, `portrait`, badge
  square, share card 1200×630), using the image's focal point;
- the location in words, e.g. "Home → Why DeepTsight section, beside the three pillars", and the frame shape;
- status in words, never colour alone: _Approved for public use_ / _Not approved — hidden on the live site_,
  _Draft change waiting_, _No image — shows a placeholder_ (required spots), or _No image — not shown_
  (optional spots, except badge spots which only appear if a badge exists);
- actions: _Change image_, _Replace file_, _Set focal point_, _Open section_; _Preview_ and _Publish_ when a
  section draft is waiting, or _Publish image_ when a focal point change is waiting.

**Toolbar:** text search (matches location, caption, file name), filter _Needs attention_ (empty spot, not
approved, draft waiting), filter by page.

**Footer note:** "Some graphics are drawn in code and cannot be changed here: the dotted power plant on
Home, the Perth globe, the dotted numbers and the dotted bar."

### 2.2 Unused images

Every media record not referenced by any spot (published or draft), with thumbnail, caption, file name,
upload date, approval status and _Delete_ (one confirmation).

## 3. Changing an image

### 3.1 Change image (put a different image in a spot)

- Opens the page's own accessible picker (a `<dialog>` listing library images with search, plus an upload
  form with the rights fields). Payload's upload drawer needs Payload's form context, which a custom admin
  view does not have. Uploads go through Payload REST (`POST /api/media`), so the existing sanitising,
  validation, hooks and audit apply. New uploads are created published and **not approved**; an approver
  approves them in the Media section. Badge spots show issuer badges only.
- Saves a **draft** of the owning document (global or collection document) with only that field changed.
- The card then shows _Draft change waiting_ with **Preview** (`/preview?path=<page>`) and **Publish**.
- **Publish publishes the whole owning document.** Before publishing, the page compares the draft with the
  published version; if anything other than this spot differs, the confirmation lists those other changes.
- Publishing goes through the existing publish guard, so validation, placeholder and approval rules apply
  unchanged. Errors are shown on the card in words.

### 3.2 Replace file (better photo of the same thing)

- Before upload, the dialog lists every spot that uses this image ("all of these will change").
- The upload creates a **new** media record (through `POST /api/media`) that copies caption, alt text,
  decorative flag, type, source, licence, usage rights, attribution and focal point, and then re-points every
  spot that used the old image to the new one as drafts. Approval is **not** copied: the new image is not
  approved until an approver approves it.
- The old image stays in the library as an unused image and can be deleted from the _Unused images_ tab.
- Decision: Payload keeps an upload's file with its document, so replacing a file in place cannot keep the
  old file live until publish. A new record is the safe design.

### 3.3 Set focal point

- Click the important point on the image; stored on the media record as `focalX`/`focalY` (percent, which
  Payload already provides on upload collections).
- Live previews: every spot the image uses, in its real frame shapes on desktop and phone (and the share
  card for share images).
- Saved as a **draft** of the media record. The card shows _Draft change waiting_ with Preview (previews read
  draft media) and **Publish image** (publishes the media record). Nothing about the live site changes until
  then.
- **Website:** add `focalX`/`focalY` to the figure contract (`src/content/schema.ts`, optional, default
  centre), map them in `src/content/mappers`, carry them in the static source and the import, and render
  them in `Figure`, index thumbnails and badges as `object-position`. Migration for any new columns.

### 3.4 Rules that do not change

- `approvedForPublic` stays approver-only and audited; the page never sets it. Unapproved images never
  appear on the live site (existing media read access).
- New uploads still require their rights fields.
- Every write is recorded in the audit log by the existing hooks.
- The page and every action require an MFA-verified admin (`isAdmin`). No anonymous access is added.

## 4. Deleting an image

**Unused image:** one confirmation, then delete.

**Image in use:**

1. First dialog lists every spot (published and draft) and says what will happen.
2. Second confirmation: a checkbox "I understand these spots will be left without an image", then _Delete_.

**Afterwards:**

- In the admin and in previews, required spots render a marked placeholder (dashed frame,
  `[PLACEHOLDER] image removed — choose a new one`); the page lists them under _Needs attention_.
- On the live site the image disappears immediately (the file is gone). The empty figure is omitted; no
  placeholder is ever shown on the live site. Affected pages are revalidated.
- Publishing an owning document with an empty **required** spot is refused by Payload's required-field check; the editor sees that error on the card or section.
- Optional spots: a deleted badge leaves the credential without a badge; a deleted share image falls back
  to the generated share card. Neither blocks publishing.

**Deleting from the Media section:** a `beforeDelete` hook refuses to delete an in-use image with "This image
is used in N places. Delete it from Images on the website, which shows where it is used." The two-step
delete on the new page calls an admin-only server action that re-checks `isAdmin`, requires the confirmation
flag, and deletes with a request-context flag the hook accepts. The context flag cannot be set through REST
or the admin UI (same pattern as `IMPORT_PUBLISH`).

## 5. How it is built

### 5.1 Spot registry — `src/cms/images/spots.ts`

One declaration per spot: owner (`global` slug or `collection` slug), field path, plain-words location,
page path (or a function of the document, for services), frame shapes (desktop and phone), required or
optional. Functions built on it:

- `listSpots(payload)` — expands collection spots per document (each service, each credential).
- `usagesOf(payload, mediaId)` — every spot using an image, in published and draft versions.
- `unusedMedia(payload)`.

A test walks the Payload config and fails if any `upload` field to `media` is missing from the registry.

### 5.2 Admin view

- `src/cms/views/images.tsx` — server component; `isAdmin` check, loads spots, renders groups (pattern of
  `dashboard.tsx`). Registered in `payload.config.ts` under `admin.components.views` and added to the
  sidebar in `src/cms/nav/nav-groups.ts`.
- Small client components for: the change/replace dialogs and picker, focal-point picker with previews, publish
  confirmation with diff summary, two-step delete dialog, search and filters.
- Writes go through Payload's normal APIs from the admin session (drafts via the REST API with the
  existing CSRF origin rules), so access, hooks, audit and revalidation run unchanged. The in-use delete is
  the one server action (§4).
- Styles in `src/app/(payload)/admin-theme.css`, following the existing admin theme. Keyboard operable,
  visible focus, 44 px targets, dialogs with focus management, status in words.

### 5.3 Website changes

- Focal point through the contract (§3.3).
- Share image: `SeoEntry.ogImage` used by each page's `generateMetadata` as an absolute URL (via
  `src/lib/site-url.ts`), only when the image is approved for public use; otherwise the generated card.
  Service pages get the same `ogImage` field in their SEO group (new field, migration, mapper).
- Empty required spot: `Figure` renders the marked placeholder outside production and nothing in
  production; publishing is refused by Payload's required-field check.

## 6. Testing and verification

- Registry completeness test (§5.1).
- CMS admin tests (Playwright, `playwright.cms.config.ts`) on the **test database only**
  (`DATABASE_URI_TEST`, name ending `_test`): page lists every spot; change creates a draft and leaves the
  live page unchanged; preview shows it; publish makes it live; publish warning lists other draft changes;
  replace file; focal point reaches the website; unused delete; in-use two-step delete and placeholder;
  Media-section delete refused; publish refused (Payload's own required-field check) on an empty required spot; non-admin and password-only
  sessions get nothing.
- Existing gates: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:a11y`, `pnpm cms:test`,
  `pnpm cms:parity`.
- Migration created with `payload migrate:create`, proven on the test database; `pnpm cms:backup` of the
  dev database before applying it there.
- Screenshots of the page at 1280 px and 768 px, reviewed against the admin theme.

## 7. Out of scope

Code-drawn graphics (D7); a crop editor; images inside articles (articles stay text-only); business hours
and office address; bulk upload or bulk change.

## 8. Risks and open checks

- Replace-file behaviour (§3.2): confirmed that Payload keeps an upload's file with its document, so a new record is the safe design.
- Payload's FK behaviour on deleting a referenced upload (set null vs error) — verified before building §4.
- Memory on this machine: `pnpm build` has failed for lack of free RAM; builds and tests need other apps closed.
