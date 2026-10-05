# CMS "Images on the website" page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One admin page, "Images on the website", that lists every image spot on the site by page and section and lets an editor change, replace, re-frame (focal point), preview, publish and delete images from there.

**Architecture:** A spot registry (`src/cms/images/`) declares every image field the site uses. A server-rendered admin view reads the owning documents through Payload's Local API and builds one card per spot; small client components handle dialogs. All writes are server actions (after an `isAdmin` check) or Payload REST (uploads), so the existing hooks, publish guard, audit log and revalidation run unchanged. The website gains a focal point on images, a share image on every page, and "empty spot" behaviour.

**Tech Stack:** Next.js 16.3 App Router, Payload 3.90.2 (Local API, Postgres adapter), Zod 3, TypeScript strict, Playwright (`playwright.cms.config.ts`), `node:test` via `tsx --test` for unit tests, plain CSS in `src/app/(payload)/admin-theme.css`.

**Spec:** `docs/superpowers/specs/2026-10-05-cms-images-page-design.md` (amended in Task 1).

## Global Constraints

- `CLAUDE.md` §10: default deny; every action requires `isAdmin` (signed in **and** valid MFA cookie); approval flags (`approvedForPublic`) are never set by this feature.
- Zod is the contract: add a field to `src/content/schema.ts` first, then the Payload field, the mapper, the import, and a migration. `push` stays off.
- Schema changes are migrations: back up dev (`pnpm cms:backup`), `node node_modules/payload/bin.js migrate:create <name>`, commit it, prove the chain on a reset test database (`pnpm cms:test`).
- Databases: tests use `DATABASE_URI_TEST` only (name ends `_test`). Never connect as `postgres`, never create databases or roles, never print a connection string.
- No real data in fixtures: `example.com` addresses and "Test" names only; no client, site, plant or network detail anywhere (CLAUDE.md §6).
- Design rules (CLAUDE.md §4–§5): no shadows, radius 2px/4px only, tokens only in the public site; the admin uses `--dts-*` variables in `admin-theme.css`. Target size 44×44, visible focus, state never by colour alone, `prefers-reduced-motion` respected.
- Pages and components read content only through `@/content`; client components never import `@/content` (it can load Payload). Payload is imported only from `src/content`, `src/cms`, `src/app/(payload)`, `src/payload.config.ts`, `scripts/cms` and `tests` (ESLint enforces it).
- Unit tests live in `tests/cms/unit/*.test.ts` and run with `npx tsx --test tests/cms/unit/<file>`; the whole set with `pnpm test:cms-unit`.
- A `'use server'` file may export **only async functions**; constants and types live in separate files.
- This machine runs out of memory during `pnpm build` when other apps are open (Windows error 1450). Close other apps before any build or Playwright run.
- Conventional Commits; end each commit message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

Failure modes the spec implies but no obvious test covers; each is pinned by a test in the task named.

1. **Image deleted while a spot still uses it:** the live page must not crash on the now-empty field, and the page must show the spot as "No image" (Task 3 unit test for `assertFigures`; Task 11 e2e).
2. **Owner section has other unpublished edits:** Publish on one image must list them before it publishes everything (Task 5 `changedPaths` test; Task 11 e2e).
3. **Bad upload (not an image, wrong type, over 10 MB):** nothing is saved and the editor sees a plain-words message (Task 11 e2e uses REST with a text file).
4. **Focal point unset, null or outside 0–100:** the image stays centred / clamped, never `NaN%` (Task 2 `objectPositionOf` test).
5. **Stale card (another tab changed the section):** actions re-read the latest draft at call time and change only one path, never overwrite siblings (Task 5 `setPath` test; Task 8 reads the latest draft inside each action).

---

## File Structure

New:

| File                                                                                                                                             | Responsibility                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `src/lib/focal.ts`                                                                                                                               | `objectPositionOf(focal)` → CSS `object-position` or `undefined`. Shared by site and CMS previews.                   |
| `src/lib/seo-metadata.ts`                                                                                                                        | `seoMetadata(seo)` → Next `Metadata` including the share image.                                                      |
| `src/cms/images/frames.ts`                                                                                                                       | Frame shapes, ratios and words.                                                                                      |
| `src/cms/images/doc-paths.ts`                                                                                                                    | `getPath`, `setPath`, `changedPaths` on plain documents.                                                             |
| `src/cms/images/spots.ts`                                                                                                                        | The spot registry and `instantiate*` functions; `isRegisteredPath`.                                                  |
| `src/cms/images/types.ts`                                                                                                                        | Types shared by server and client (`OwnerRef`, `SpotCard`, `ImageView`, `ActionResult`, …).                          |
| `src/cms/images/cards.ts`                                                                                                                        | Pure: `buildCard`, `cardStatus`, `needsAttention`.                                                                   |
| `src/cms/images/local-api.ts`                                                                                                                    | `localApi(payload)` typed wrapper over the Local API; `asDoc`.                                                       |
| `src/cms/images/data.ts`                                                                                                                         | `loadImagesPage(payload)`, `findUsages(payload, mediaId)`.                                                           |
| `src/cms/images/in-use.ts`                                                                                                                       | `ALLOW_IN_USE_DELETE` context key and `refuseInUseDelete` Media hook.                                                |
| `src/cms/images/actions.ts`                                                                                                                      | `'use server'` actions: `setSpotImage`, `publishSpot`, `saveFocalPoint`, `publishImage`, `swapImage`, `deleteImage`. |
| `src/cms/views/images.tsx`                                                                                                                       | Server view `ImagesView`.                                                                                            |
| `src/cms/views/images/*.tsx`                                                                                                                     | Client components: `images-client`, `spot-card`, `dialog`, `picker`, `replace`, `focal`, `publish`, `delete`.        |
| `tests/cms/unit/focal.test.ts`, `rules.test.ts`, `doc-paths.test.ts`, `frames.test.ts`, `spots.test.ts`, `cards.test.ts`, `seo-metadata.test.ts` | Unit tests.                                                                                                          |
| `tests/cms/images.spec.ts`                                                                                                                       | Playwright admin tests.                                                                                              |

Modified: `src/content/schema.ts`, `src/content/mappers/index.ts`, `src/content/rules.ts`, `src/content/cms-source.ts`, `src/components/primitives/figure.tsx`, `src/components/content/index-list.tsx`, `src/cms/fields/index.ts`, `src/cms/collections/services.ts`, `src/cms/collections/media.ts`, `src/cms/nav/nav-groups.ts`, `src/cms/nav/admin-nav.tsx`, `src/cms/nav/nav-client.tsx`, `src/payload.config.ts`, `src/app/(payload)/admin-theme.css`, the public pages' `generateMetadata`, `scripts/cms/prepare-test-db.ts`, `tests/cms/global-setup.ts`, plus a new migration and `src/cms/payload-types.ts`.

---

### Task 1: Housekeeping and spec amendments

**Files:**

- Modify: `package.json`, `pnpm-lock.yaml` (already changed in the working tree)
- Modify: `docs/superpowers/specs/2026-10-05-cms-images-page-design.md`

- [ ] **Step 1: Verify the working tree is only the `@next/env` change**

Run: `git status --short`
Expected: only ` M package.json` and ` M pnpm-lock.yaml`.

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 3: Commit the dependency fix**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: list @next/env as a dev dependency

Four scripts import it; it only resolved by accident under the old install.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Amend the spec with four decisions made while planning**

In `docs/superpowers/specs/2026-10-05-cms-images-page-design.md`:

Replace the paragraph under **"### 3.1 Change image"** first bullet (`Opens the CMS's standard upload drawer…`) with:

```markdown
- Opens the page's own accessible picker (a `<dialog>` listing library images with search, plus an upload
  form with the rights fields). Payload's upload drawer needs Payload's form context, which a custom admin
  view does not have. Uploads go through Payload REST (`POST /api/media`), so the existing sanitising,
  validation, hooks and audit apply. New uploads are created published and **not approved**; an approver
  approves them in the Media section. Badge spots show issuer badges only.
```

Replace the whole of **"### 3.2 Replace file"** with:

```markdown
### 3.2 Replace file (better photo of the same thing)

- Before upload, the dialog lists every spot that uses this image ("all of these will change").
- The upload creates a **new** media record (through `POST /api/media`) that copies caption, alt text,
  decorative flag, type, source, licence, usage rights, attribution and focal point, and then re-points every
  spot that used the old image to the new one as drafts. Approval is **not** copied: the new image is not
  approved until an approver approves it.
- The old image stays in the library as an unused image and can be deleted from the _Unused images_ tab.
- Decision: Payload keeps an upload's file with its document, so replacing a file in place cannot keep the
  old file live until publish. A new record is the safe design.
```

Replace the **"### 3.3 Set focal point"** bullet `Saved as a draft of the media record, published with Publish like any other change.` with:

```markdown
- Saved as a **draft** of the media record. The card shows _Draft change waiting_ with Preview (previews read
  draft media) and **Publish image** (publishes the media record). Nothing about the live site changes until
  then.
```

In **"### 2.1 Used on the website"**, after the table add: `Credential badge spots are listed only for credentials that already have a badge; a badge is added from the credential's own record.` And in **"## 6 Testing and verification"** replace `publish blocked on an empty required spot` with `publish refused (Payload's own required-field check) on an empty required spot`.

- [ ] **Step 5: Commit the spec amendments**

```bash
git add docs/superpowers/specs/2026-10-05-cms-images-page-design.md
git commit -m "docs: amend images-page spec (own picker, replace creates a new record, focal draft)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Focal point on the website

**Files:**

- Create: `src/lib/focal.ts`, `tests/cms/unit/focal.test.ts`
- Modify: `src/content/schema.ts` (the `mediaAssetSchema`), `src/content/mappers/index.ts` (`mapMedia`), `src/components/primitives/figure.tsx`, `src/components/content/index-list.tsx`

**Interfaces:**

- Produces: `objectPositionOf(focal: { focalX?: number | null; focalY?: number | null } | undefined): string | undefined`; `MediaAsset` gains optional `focalX`, `focalY` (numbers, percent 0–100).

- [ ] **Step 1: Write the failing test**

Create `tests/cms/unit/focal.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { objectPositionOf } from "../../../src/lib/focal";
import { mapMedia } from "../../../src/content/mappers";
import { figureSchema } from "../../../src/content/schema";

test("no focal point means no object-position (the image stays centred)", () => {
  assert.equal(objectPositionOf(undefined), undefined);
  assert.equal(objectPositionOf({}), undefined);
  assert.equal(objectPositionOf({ focalX: null, focalY: null }), undefined);
});

test("a focal point becomes an object-position in percent", () => {
  assert.equal(objectPositionOf({ focalX: 20, focalY: 80 }), "20% 80%");
});

test("a missing axis falls back to the centre", () => {
  assert.equal(objectPositionOf({ focalX: 30 }), "30% 50%");
  assert.equal(objectPositionOf({ focalY: 10 }), "50% 10%");
});

test("values outside 0-100 or not numbers are clamped, never NaN", () => {
  assert.equal(objectPositionOf({ focalX: 150, focalY: -20 }), "100% 0%");
  assert.equal(objectPositionOf({ focalX: Number.NaN, focalY: 40 }), "50% 40%");
});

test("mapMedia carries the focal point into the figure contract", () => {
  const figure = figureSchema.parse(
    mapMedia({
      id: 7,
      kind: "image",
      filename: "a.jpg",
      alt: "Test",
      caption: "Test",
      width: 100,
      height: 100,
      source: "s",
      licence: "l",
      usageRights: "u",
      approvedForPublic: true,
      focalX: 25,
      focalY: 75,
    }),
  );
  assert.equal(figure.kind, "image");
  if (figure.kind === "image") {
    assert.equal(figure.focalX, 25);
    assert.equal(figure.focalY, 75);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx tsx --test tests/cms/unit/focal.test.ts`
Expected: FAIL — cannot find module `src/lib/focal`.

- [ ] **Step 3: Implement `src/lib/focal.ts`**

```ts
/*
 * A focal point is the part of an image that must stay in view when the frame crops it. Payload
 * stores it as percentages (0-100) from the top-left. The site turns it into CSS object-position.
 */

export interface FocalPoint {
  focalX?: number | null | undefined;
  focalY?: number | null | undefined;
}

function percent(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

/** `undefined` when no focal point is set, so the image keeps the default centred crop. */
export function objectPositionOf(focal: FocalPoint | undefined): string | undefined {
  if (!focal) return undefined;
  const hasX = typeof focal.focalX === "number";
  const hasY = typeof focal.focalY === "number";
  if (!hasX && !hasY) return undefined;
  return `${percent(focal.focalX)}% ${percent(focal.focalY)}%`;
}
```

- [ ] **Step 3b: Add the fields to the contract**

In `src/content/schema.ts`, inside `mediaAssetSchema` (after `approvedForPublic: z.boolean(),`) add:

```ts
  /** Where the subject is, in percent from the top-left. The frame keeps this point in view. */
  focalX: z.number().min(0).max(100).optional(),
  focalY: z.number().min(0).max(100).optional(),
```

In `src/content/mappers/index.ts`, in `mapMedia`, replace the `image` return's last property block

```ts
    approvedForPublic: bool(doc, "approvedForPublic"),
  };
}
```

with

```ts
    approvedForPublic: bool(doc, "approvedForPublic"),
    ...(typeof doc["focalX"] === "number" ? { focalX: doc["focalX"] } : {}),
    ...(typeof doc["focalY"] === "number" ? { focalY: doc["focalY"] } : {}),
  };
}
```

(Only the `kind: "image"` return in `mapMedia` changes; leave the `slot` branch alone.)

- [ ] **Step 4: Use it in the components**

In `src/components/primitives/figure.tsx` add the import `import { objectPositionOf } from "@/lib/focal";`, and replace the `<Image … className="photo-grade object-cover" />` element with:

```tsx
<Image
  src={figure.src}
  alt={figure.alt}
  fill
  preload={preload}
  sizes={sizes}
  className="photo-grade object-cover"
  style={{ objectPosition: objectPositionOf(figure) }}
/>
```

In `src/components/content/index-list.tsx` add the same import and change the thumbnail `<Image …>` to include `style={{ objectPosition: objectPositionOf(thumb) }}` (the variable is `thumb`, an image figure).

- [ ] **Step 5: Run the tests, typecheck, lint**

Run: `npx tsx --test tests/cms/unit/focal.test.ts && pnpm typecheck && pnpm lint`
Expected: 5 tests pass; typecheck and lint exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/focal.ts tests/cms/unit/focal.test.ts src/content/schema.ts src/content/mappers/index.ts src/components/primitives/figure.tsx src/components/content/index-list.tsx
git commit -m "feat: keep an image's focal point in view in every frame

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Empty image spots (deleted images) on the website

**Files:**

- Modify: `src/content/rules.ts`, `src/content/cms-source.ts`, `src/components/primitives/figure.tsx`
- Create: `tests/cms/unit/rules.test.ts`

**Interfaces:**

- Produces: `REMOVED_FIGURE_ID = ""`; `removedFigure(): FigureData` (a `slot` figure); `assertFigures` skips empty ids.

When an image is deleted Payload sets the field to `null` (`ON DELETE set null`, verified in `20261002_064614_cms_content.ts`); the mappers turn that into the figure id `""`. Today `assertFigures` would throw for `""` and the live page would error.

- [ ] **Step 1: Write the failing test**

Create `tests/cms/unit/rules.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { REMOVED_FIGURE_ID, assertFigures, removedFigure } from "../../../src/content/rules";
import { figureSchema } from "../../../src/content/schema";

test("an empty figure id means the image was removed and is not an error", () => {
  assert.doesNotThrow(() => assertFigures({ hero: REMOVED_FIGURE_ID }, new Set(), "Test"));
});

test("an id that points at nothing is still an error", () => {
  assert.throws(() => assertFigures({ hero: "img-missing" }, new Set(["img-a"]), "Test"));
});

test("the placeholder for a removed image is a valid marked slot", () => {
  const figure = figureSchema.parse(removedFigure());
  assert.equal(figure.kind, "slot");
  assert.equal(figure.id, REMOVED_FIGURE_ID);
  assert.match(figure.kind === "slot" ? figure.subject : "", /removed/i);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx tsx --test tests/cms/unit/rules.test.ts`
Expected: FAIL — `REMOVED_FIGURE_ID` is not exported.

- [ ] **Step 3: Implement in `src/content/rules.ts`**

Replace the `assertFigures` function (and add the two exports above it):

```ts
/** The figure id a page gets when its image was removed (the field is empty). */
export const REMOVED_FIGURE_ID = "";

/** Shown in the admin, previews and non-production builds where an image was removed. */
export function removedFigure(): FigureData {
  return {
    kind: "slot",
    id: REMOVED_FIGURE_ID,
    subject: "Image removed. Choose a new one in the CMS (Images on the website).",
    caption: "Image removed.",
    promptRef: "",
  };
}

/**
 * A reference to a figure that does not exist is a content error and fails the render. An empty
 * reference is an image that was deleted: the page leaves it out on the live site and shows a
 * marked placeholder elsewhere.
 */
export function assertFigures(
  ids: Record<string, string>,
  known: Set<string>,
  where: string,
): void {
  for (const [field, id] of Object.entries(ids)) {
    if (id === REMOVED_FIGURE_ID) continue;
    if (!known.has(id)) throw new Error(`${where} ${field} refers to unknown figure "${id}".`);
  }
}
```

Make sure `FigureData` is imported at the top of the file (it is a type from `./types`; add it to the existing type import if missing).

- [ ] **Step 4: Offer the placeholder where placeholders are allowed**

In `src/content/cms-source.ts`, add `removedFigure` and `showPending` to the import from `./rules` (`showPending` is already imported; add `removedFigure`), and replace `loadFigures`:

```ts
async function loadFigures(draft: boolean): Promise<Record<string, FigureData>> {
  const figures: Record<string, FigureData> = {};
  for (const doc of await findAll("media", draft, 0)) {
    const figure = figureSchema.parse(mapMedia(doc));
    figures[figure.id] = figure;
  }
  // Previews and non-production builds show a marked placeholder where an image was removed. The
  // live site leaves the spot out (the page gets no figure for the empty id).
  if (draft || showPending()) figures[REMOVED_FIGURE_ID] = removedFigure();
  return figures;
}
```

and add `REMOVED_FIGURE_ID` to the same import. Do **not** add the removed placeholder to `figureIds()` callers' expectations: `figureIds` only needs real ids, and `assertFigures` already skips `""`.

- [ ] **Step 5: Do not print an empty brief**

In `src/components/primitives/figure.tsx`, in `SlotFrame`, replace

```tsx
<span className="text-caption font-mono opacity-80">Brief: {promptRef}</span>
```

with

```tsx
{
  promptRef && <span className="text-caption font-mono opacity-80">Brief: {promptRef}</span>;
}
```

- [ ] **Step 6: Run tests, typecheck, lint**

Run: `npx tsx --test tests/cms/unit/rules.test.ts && pnpm typecheck && pnpm lint`
Expected: 3 tests pass; both exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/content/rules.ts src/content/cms-source.ts src/components/primitives/figure.tsx tests/cms/unit/rules.test.ts
git commit -m "feat: leave out a deleted image on the live site, mark it elsewhere

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Share images connected to the website

**Files:**

- Modify: `src/cms/fields/index.ts` (`seoGroup`), `src/cms/collections/services.ts` (use `seoGroup({ shareImage: true })`), `src/content/mappers/index.ts` (`mapSeo`, `mapService`), `src/content/cms-source.ts` (`getSeo` tags), the public pages' `generateMetadata`
- Create: `src/lib/seo-metadata.ts`, `tests/cms/unit/seo-metadata.test.ts`, one migration
- Regenerate: `src/cms/payload-types.ts`

**Interfaces:**

- Produces: `seoMetadata(seo: SeoEntry): Metadata`; `shareImageSrc(ref: unknown): string | undefined` (exported from `src/content/mappers/index.ts`) — returns a path only for an image that is approved for public use.

- [ ] **Step 1: Write the failing tests**

Create `tests/cms/unit/seo-metadata.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { seoMetadata } from "../../../src/lib/seo-metadata";
import { shareImageSrc } from "../../../src/content/mappers";

test("without a share image the metadata has no images (the generated card is used)", () => {
  const meta = seoMetadata({ title: "About", description: "D", canonical: "/about" });
  assert.equal(meta.title, "About");
  assert.equal(meta.alternates?.canonical, "/about");
  const og = meta.openGraph as { images?: unknown } | undefined;
  assert.equal(og?.images, undefined);
});

test("with a share image the page uses it for Open Graph and Twitter", () => {
  const meta = seoMetadata({
    title: "About",
    description: "D",
    canonical: "/about",
    ogImage: "/api/media/file/share.jpg",
  });
  const og = meta.openGraph as { images?: { url: string }[] };
  assert.equal(og.images?.[0]?.url.endsWith("/api/media/file/share.jpg"), true);
  assert.ok(og.images?.[0]?.url.startsWith("http"));
  const tw = meta.twitter as { images?: string[] };
  assert.equal(tw.images?.[0]?.endsWith("/api/media/file/share.jpg"), true);
});

test("only an approved, populated image can be a share image", () => {
  assert.equal(shareImageSrc(null), undefined);
  assert.equal(shareImageSrc(12), undefined); // an unpopulated id
  assert.equal(shareImageSrc({ filename: "a.jpg", approvedForPublic: false }), undefined);
  assert.equal(
    shareImageSrc({ filename: "a.jpg", approvedForPublic: true }),
    "/api/media/file/a.jpg",
  );
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx tsx --test tests/cms/unit/seo-metadata.test.ts`
Expected: FAIL — module `src/lib/seo-metadata` not found.

- [ ] **Step 3: Implement the helper and the mapper function**

Create `src/lib/seo-metadata.ts`:

```ts
import type { Metadata } from "next";
import type { SeoEntry } from "@/content/types";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Title, description, canonical and link-preview metadata for a page, from its SEO entry. When the
 * entry has an approved share image it is used for Open Graph and Twitter previews; otherwise the
 * generated card (src/app/opengraph-image.tsx) is used.
 */
export function seoMetadata(seo: SeoEntry): Metadata {
  const image = seo.ogImage ? absoluteUrl(seo.ogImage) : undefined;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    ...(image ? { twitter: { card: "summary_large_image", images: [image] } } : {}),
  };
}
```

In `src/content/mappers/index.ts`, add (next to `mediaSrc`):

```ts
/** A share image's public path, only when the image is populated and approved for public use. */
export function shareImageSrc(ref: unknown): string | undefined {
  if (!ref || typeof ref !== "object") return undefined;
  const doc = ref as Doc;
  if (!bool(doc, "approvedForPublic")) return undefined;
  return mediaSrc(doc) || undefined;
}
```

Replace the `ogImage` lines in `mapSeo`:

```ts
const ogImage = shareImageSrc(entry["ogImage"]);
entries[route] = {
  title: str(entry, "title"),
  description: str(entry, "description"),
  canonical: route,
  ...(ogImage ? { ogImage } : {}),
};
```

In `mapService`, replace the `seo:` block with:

```ts
    seo: {
      title: str(seo, "title"),
      description: str(seo, "description"),
      canonical: `/services/${slug}`,
      ...(shareImageSrc(seo["ogImage"]) ? { ogImage: shareImageSrc(seo["ogImage"]) } : {}),
    },
```

In `src/content/cms-source.ts`, change `getSeo`'s tags from `["seo"]` to `["seo", "media"]` so approving or deleting an image refreshes share previews.

- [ ] **Step 4: Run the unit tests**

Run: `npx tsx --test tests/cms/unit/seo-metadata.test.ts`
Expected: 3 tests pass.

- [ ] **Step 5: Add the Payload field**

In `src/cms/fields/index.ts` change the signature and body of `seoGroup`:

```ts
export function seoGroup(
  name = "seo",
  label = "Search result",
  options: { shareImage?: boolean } = {},
): GroupField {
```

and append to its `fields` array (after the `description` field):

```ts
      ...(options.shareImage
        ? [
            mediaField(
              "ogImage",
              "Share image",
              "Optional picture shown when a link to this page is shared. Only approved images are used.",
              { required: false },
            ),
          ]
        : []),
```

In `src/cms/collections/services.ts` change `seoGroup(),` to `seoGroup("seo", "Search result", { shareImage: true }),`. (Articles keep `seoGroup()` unchanged.)

- [ ] **Step 6: Back up dev, create and inspect the migration**

Run:

```bash
pnpm cms:backup
node node_modules/payload/bin.js migrate:create services_share_image
```

Expected: a new `src/cms/migrations/<timestamp>_services_share_image.ts` and `.json`, and `src/cms/migrations/index.ts` updated.

Open the new `.ts`. Its `up` must contain **only**: `ALTER TABLE "services" ADD COLUMN "seo_og_image_id" integer;`, the same for `"_services_v"` (`"version_seo_og_image_id"`), two `ADD CONSTRAINT … FOREIGN KEY … REFERENCES "public"."media"("id") ON DELETE set null`, and two `CREATE INDEX`. If it contains anything else, stop and investigate.

- [ ] **Step 7: Regenerate types and apply to dev**

Run:

```bash
node node_modules/payload/bin.js generate:types
pnpm cms:migrate
pnpm typecheck
```

Expected: `payload-types.ts` shows `seo.ogImage` on `Service`; migrate reports the new migration ran; typecheck exits 0.

- [ ] **Step 8: Use the helper in the pages**

For each page below, replace the body of its `generateMetadata` with the two lines shown, and add `import { seoMetadata } from "@/lib/seo-metadata";` (remove the now-unused `Metadata` import only if nothing else uses it; the function still returns `Promise<Metadata>`):

```ts
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSeo("ROUTE"));
}
```

| File (under `src/app/(public)/(site)/`) | `ROUTE`                |
| --------------------------------------- | ---------------------- |
| `page.tsx`                              | `/`                    |
| `about/page.tsx`                        | `/about`               |
| `services/page.tsx`                     | `/services`            |
| `credentials/page.tsx`                  | `/credentials`         |
| `contact/page.tsx`                      | `/contact`             |
| `legal/privacy/page.tsx`                | `/legal/privacy`       |
| `legal/terms/page.tsx`                  | `/legal/terms`         |
| `legal/accessibility/page.tsx`          | `/legal/accessibility` |

Leave `contact/thank-you/page.tsx` and the insights pages alone. In `services/[slug]/page.tsx` replace the success `return {…}` of `generateMetadata` with `return seoMetadata(service.seo);`.

- [ ] **Step 9: Verify nothing else changed**

Run: `pnpm typecheck && pnpm lint && npx tsx --test tests/cms/unit/seo-metadata.test.ts`
Expected: all exit 0 / pass.

- [ ] **Step 10: Commit**

```bash
git add src/lib/seo-metadata.ts tests/cms/unit/seo-metadata.test.ts src/content src/cms/fields/index.ts src/cms/collections/services.ts src/cms/migrations src/cms/payload-types.ts "src/app/(public)"
git commit -m "feat: use each page's share image in link previews

Pages now take title, description and link-preview image from one helper.
Service pages get a share image field. Only approved images are used.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Pure helpers — frames and document paths

**Files:**

- Create: `src/cms/images/frames.ts`, `src/cms/images/doc-paths.ts`, `tests/cms/unit/frames.test.ts`, `tests/cms/unit/doc-paths.test.ts`

**Interfaces:**

- Produces:
  - `type FrameShape = "wide" | "landscape" | "classic" | "portrait" | "square" | "share"`; `type PhoneShape = FrameShape | "hidden"`; `FRAME_RATIO: Record<FrameShape, number>`; `FRAME_LABEL: Record<FrameShape, string>`.
  - `getPath(doc: unknown, path: string): unknown`; `setPath<T extends Record<string, unknown>>(doc: T, path: string, value: unknown): T` (returns a new object; siblings kept); `changedPaths(before: unknown, after: unknown): string[]` (dotted paths that differ, ignoring `id`, `createdAt`, `updatedAt`, `_status`, `globalType`, `publishedAt`, `firstPublishedAt`).

- [ ] **Step 1: Write the failing tests**

`tests/cms/unit/frames.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { FRAME_LABEL, FRAME_RATIO } from "../../../src/cms/images/frames";

test("frame ratios match the site's aspect tokens", () => {
  assert.equal(FRAME_RATIO.wide, 21 / 9);
  assert.equal(FRAME_RATIO.landscape, 3 / 2);
  assert.equal(FRAME_RATIO.classic, 4 / 3);
  assert.equal(FRAME_RATIO.portrait, 4 / 5);
  assert.equal(FRAME_RATIO.square, 1);
  assert.equal(FRAME_RATIO.share, 1200 / 630);
});

test("every shape has words", () => {
  for (const shape of Object.keys(FRAME_RATIO)) {
    assert.ok(FRAME_LABEL[shape as keyof typeof FRAME_LABEL].length > 0, shape);
  }
});
```

`tests/cms/unit/doc-paths.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { changedPaths, getPath, setPath } from "../../../src/cms/images/doc-paths";

test("getPath reads nested values and tolerates gaps", () => {
  assert.equal(getPath({ media: { why: 4 } }, "media.why"), 4);
  assert.equal(getPath({ media: null }, "media.why"), undefined);
  assert.equal(getPath(undefined, "media.why"), undefined);
});

test("setPath changes one path and keeps every sibling (a stale card cannot overwrite them)", () => {
  const before = { title: "A", media: { why: 1, problems: 2, close: 3 } };
  const after = setPath(before, "media.why", 9);
  assert.deepEqual(after, { title: "A", media: { why: 9, problems: 2, close: 3 } });
  assert.deepEqual(before.media, { why: 1, problems: 2, close: 3 }); // not mutated
});

test("setPath creates missing groups", () => {
  assert.deepEqual(setPath({}, "seo.ogImage", 5), { seo: { ogImage: 5 } });
});

test("changedPaths lists what differs and ignores bookkeeping", () => {
  const published = {
    id: 1,
    _status: "published",
    updatedAt: "a",
    summary: "x",
    media: { hero: 1, detail: 2 },
  };
  const draft = {
    id: 1,
    _status: "draft",
    updatedAt: "b",
    summary: "y",
    media: { hero: 5, detail: 2 },
  };
  assert.deepEqual(changedPaths(published, draft).sort(), ["media.hero", "summary"]);
});

test("changedPaths compares arrays element by element", () => {
  const a = { steps: [{ title: "one" }, { title: "two" }] };
  const b = { steps: [{ title: "one" }, { title: "TWO" }] };
  assert.deepEqual(changedPaths(a, b), ["steps.1.title"]);
});

test("changedPaths treats null and undefined as the same empty value", () => {
  assert.deepEqual(changedPaths({ a: null }, { a: undefined }), []);
});
```

- [ ] **Step 2: Run to see them fail**

Run: `npx tsx --test tests/cms/unit/frames.test.ts tests/cms/unit/doc-paths.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/cms/images/frames.ts`:

```ts
/*
 * The frame shapes an image appears in on the site (the aspect tokens in src/styles/globals.css),
 * plus the 1200 x 630 link-preview card. The Images page uses them to show each spot as it looks.
 */

export type FrameShape = "wide" | "landscape" | "classic" | "portrait" | "square" | "share";
/** A spot can be hidden on phones (the Contact image shows on wide screens only). */
export type PhoneShape = FrameShape | "hidden";

export const FRAME_RATIO: Record<FrameShape, number> = {
  wide: 21 / 9,
  landscape: 3 / 2,
  classic: 4 / 3,
  portrait: 4 / 5,
  square: 1,
  share: 1200 / 630,
};

export const FRAME_LABEL: Record<FrameShape, string> = {
  wide: "Wide banner (21:9)",
  landscape: "Landscape (3:2)",
  classic: "Classic (4:3)",
  portrait: "Portrait (4:5)",
  square: "Square badge",
  share: "Link preview card (1200 × 630)",
};
```

`src/cms/images/doc-paths.ts`:

```ts
/*
 * Read, change and compare plain documents by dotted path ("media.why", "steps.1.title"). The
 * Images page changes exactly one path of the latest draft, so a card that is out of date can never
 * overwrite another editor's changes to the rest of the section.
 */

const IGNORED = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "_status",
  "globalType",
  "publishedAt",
  "firstPublishedAt",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getPath(doc: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (Array.isArray(value)) return value[Number(key)];
    return isObject(value) ? value[key] : undefined;
  }, doc);
}

/** A copy of `doc` with one path set. Groups on the way are created when missing. */
export function setPath<T extends Record<string, unknown>>(
  doc: T,
  path: string,
  value: unknown,
): T {
  const [head, ...rest] = path.split(".");
  if (head === undefined) return doc;
  if (rest.length === 0) return { ...doc, [head]: value };
  const child = isObject(doc[head]) ? (doc[head] as Record<string, unknown>) : {};
  return { ...doc, [head]: setPath(child, rest.join("."), value) };
}

function empty(value: unknown): boolean {
  return value === null || value === undefined;
}

function walk(before: unknown, after: unknown, prefix: string, out: string[]): void {
  if (empty(before) && empty(after)) return;
  if (Array.isArray(before) || Array.isArray(after)) {
    const a = Array.isArray(before) ? before : [];
    const b = Array.isArray(after) ? after : [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      walk(a[i], b[i], prefix ? `${prefix}.${i}` : String(i), out);
    }
    return;
  }
  if (isObject(before) || isObject(after)) {
    const a = isObject(before) ? before : {};
    const b = isObject(after) ? after : {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!prefix && IGNORED.has(key)) continue;
      walk(a[key], b[key], prefix ? `${prefix}.${key}` : key, out);
    }
    return;
  }
  if (before !== after) out.push(prefix);
}

/** Dotted paths whose values differ between two documents (bookkeeping fields ignored). */
export function changedPaths(before: unknown, after: unknown): string[] {
  const out: string[] = [];
  walk(before, after, "", out);
  return out;
}
```

- [ ] **Step 4: Run, typecheck, lint**

Run: `npx tsx --test tests/cms/unit/frames.test.ts tests/cms/unit/doc-paths.test.ts && pnpm typecheck && pnpm lint`
Expected: 8 tests pass; both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/cms/images/frames.ts src/cms/images/doc-paths.ts tests/cms/unit/frames.test.ts tests/cms/unit/doc-paths.test.ts
git commit -m "feat(cms): frame shapes and document-path helpers for the Images page

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: The spot registry

**Files:**

- Create: `src/cms/images/types.ts`, `src/cms/images/spots.ts`, `tests/cms/unit/spots.test.ts`

**Interfaces:**

- Consumes: `FrameShape`, `PhoneShape` (Task 5), `SEO_ROUTES` from `src/content/mappers`.
- Produces (`types.ts`):

```ts
export type OwnerRef =
  | { kind: "global"; slug: "home" | "about" | "pages" | "seo" }
  | { kind: "collection"; slug: "services" | "credentials"; id: number };

export interface SpotInstance {
  id: string; // stable key, e.g. "home:media.why", "services:12:media.hero"
  owner: OwnerRef;
  path: string; // dotted path inside the owner document
  group: string; // group heading, e.g. "Home"
  groupPath: string | null; // public page the group describes (null for share images)
  title: string; // "Why DeepTsight"
  where: string; // plain-words location
  pagePath: string | null; // page to preview; null when there is none
  desktop: FrameShape;
  phone: PhoneShape;
  required: boolean;
  badgeOnly: boolean; // picker shows issuer badges only
}
```

- Produces (`spots.ts`): `globalSpots(): SpotInstance[]`; `serviceSpots(service: { id: number; slug: string; title: string }): SpotInstance[]`; `credentialSpot(credential: { id: number; title: string }): SpotInstance`; `isRegisteredPath(owner: OwnerRef, path: string): boolean`; `registeredFieldPaths(): { home: string[]; about: string[]; pages: string[]; seo: string[]; services: string[]; credentials: string[] }`.

- [ ] **Step 1: Write the failing tests**

`tests/cms/unit/spots.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Field } from "payload";
import { About, Home, Pages, Seo } from "../../../src/cms/globals";
import { Credentials } from "../../../src/cms/collections/credentials";
import { Services } from "../../../src/cms/collections/services";
import {
  credentialSpot,
  globalSpots,
  isRegisteredPath,
  registeredFieldPaths,
  serviceSpots,
} from "../../../src/cms/images/spots";

/** Every upload field that points at `media`, as a dotted path (groups only; no arrays hold images). */
function mediaFieldPaths(fields: Field[], prefix = ""): string[] {
  const out: string[] = [];
  for (const field of fields) {
    const name = "name" in field && typeof field.name === "string" ? field.name : undefined;
    if (field.type === "upload" && field.relationTo === "media" && name) out.push(prefix + name);
    if (field.type === "group" && name && "fields" in field) {
      out.push(...mediaFieldPaths(field.fields, `${prefix}${name}.`));
    } else if (field.type === "tabs") {
      for (const tab of field.tabs) out.push(...mediaFieldPaths(tab.fields, prefix));
    } else if ((field.type === "row" || field.type === "collapsible") && "fields" in field) {
      out.push(...mediaFieldPaths(field.fields, prefix));
    } else if (field.type === "array" && name && "fields" in field) {
      // An image inside an array would need a spot per row; the registry does not support that.
      assert.deepEqual(mediaFieldPaths(field.fields), [], `image inside array "${prefix}${name}"`);
    }
  }
  return out;
}

test("every image field in the CMS is in the registry (so no image can be missing from the page)", () => {
  const registered = registeredFieldPaths();
  const actual = {
    home: mediaFieldPaths(Home.fields).sort(),
    about: mediaFieldPaths(About.fields).sort(),
    pages: mediaFieldPaths(Pages.fields).sort(),
    seo: mediaFieldPaths(Seo.fields).sort(),
    services: mediaFieldPaths(Services.fields).sort(),
    credentials: mediaFieldPaths(Credentials.fields).sort(),
  };
  for (const owner of Object.keys(actual) as (keyof typeof actual)[]) {
    assert.deepEqual([...registered[owner]].sort(), actual[owner], `registry for ${owner}`);
  }
});

test("global spots have unique ids and plain-words locations", () => {
  const spots = globalSpots();
  assert.equal(new Set(spots.map((spot) => spot.id)).size, spots.length);
  for (const spot of spots) {
    assert.ok(spot.where.length > 10, spot.id);
    assert.ok(spot.title.length > 0, spot.id);
  }
});

test("a service has a main image, a detail image and a share image", () => {
  const spots = serviceSpots({ id: 3, slug: "ot-cybersecurity", title: "OT cybersecurity" });
  assert.deepEqual(
    spots.map((spot) => spot.path),
    ["media.hero", "media.detail", "seo.ogImage"],
  );
  assert.equal(spots[0]?.pagePath, "/services/ot-cybersecurity");
  assert.equal(spots[0]?.required, true);
  assert.equal(spots[2]?.required, false);
});

test("a credential badge spot is optional and badge-only", () => {
  const spot = credentialSpot({ id: 9, title: "Chartered Professional Engineer (CPEng)" });
  assert.equal(spot.path, "badge");
  assert.equal(spot.badgeOnly, true);
  assert.equal(spot.required, false);
});

test("only registered paths may be written by the page", () => {
  assert.equal(isRegisteredPath({ kind: "global", slug: "home" }, "media.why"), true);
  assert.equal(isRegisteredPath({ kind: "global", slug: "home" }, "hero.headline"), false);
  assert.equal(
    isRegisteredPath({ kind: "collection", slug: "services", id: 1 }, "seo.ogImage"),
    true,
  );
  assert.equal(isRegisteredPath({ kind: "collection", slug: "services", id: 1 }, "title"), false);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx tsx --test tests/cms/unit/spots.test.ts`
Expected: FAIL — module `src/cms/images/spots` not found.

- [ ] **Step 3: Implement `types.ts` (shared types) and `spots.ts`**

`src/cms/images/types.ts` — start with the types above and add the ones later tasks use:

```ts
import type { FrameShape, PhoneShape } from "./frames";

export type OwnerRef =
  | { kind: "global"; slug: "home" | "about" | "pages" | "seo" }
  | { kind: "collection"; slug: "services" | "credentials"; id: number };

export interface SpotInstance {
  id: string;
  owner: OwnerRef;
  path: string;
  group: string;
  groupPath: string | null;
  title: string;
  where: string;
  pagePath: string | null;
  desktop: FrameShape;
  phone: PhoneShape;
  required: boolean;
  badgeOnly: boolean;
}

/** What the page needs to know about one image record. */
export interface ImageView {
  id: number;
  src: string;
  filename: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  focalX: number;
  focalY: number;
  approved: boolean;
  assetClass: string;
  /** Rights record, copied when an image is replaced. */
  meta: {
    assetClass: string;
    alt: string;
    decorative: boolean;
    caption: string;
    source: string;
    licence: string;
    usageRights: string;
    attribution: string;
  };
}

export interface SpotCard extends SpotInstance {
  adminHref: string;
  image: ImageView | null;
  /** The latest draft uses a different image from the published page. */
  pending: boolean;
  /** The image's focal point has an unpublished change. */
  focalPending: boolean;
  /** Everything else that is unpublished in this section (dotted paths), for the publish warning. */
  otherChanges: string[];
  /** Other spots using the same image (titles), for warnings. */
  sharedWith: string[];
}

export interface UsageView {
  spotId: string;
  group: string;
  title: string;
  where: string;
}

export interface UnusedImage {
  image: ImageView;
  createdAt: string;
}

export interface ImagesPageData {
  cards: SpotCard[];
  unused: UnusedImage[];
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; needsConfirmation?: boolean; usages?: UsageView[] };
```

`src/cms/images/spots.ts`:

```ts
import { SEO_ROUTES } from "../../content/mappers";
import type { FrameShape, PhoneShape } from "./frames";
import type { OwnerRef, SpotInstance } from "./types";

/*
 * Every image the site shows, declared once: which document owns it, where the field is, where it
 * appears in plain words, and the frame shape on desktop and phone. A unit test walks the Payload
 * config and fails if an upload field to `media` is missing here, so a new image can never be
 * missing from the Images page.
 */

interface Def {
  key: string;
  path: string;
  group: string;
  groupPath: string | null;
  title: string;
  where: string;
  pagePath: string | null;
  desktop: FrameShape;
  phone: PhoneShape;
  required: boolean;
  badgeOnly?: boolean;
}

const GLOBAL_DEFS: Record<"home" | "about" | "pages", Def[]> = {
  home: [
    {
      key: "why",
      path: "media.why",
      group: "Home",
      groupPath: "/",
      title: "Why DeepTsight",
      where: "Home page, Why DeepTsight section, beside the three pillars",
      pagePath: "/",
      desktop: "landscape",
      phone: "landscape",
      required: true,
    },
    {
      key: "problems",
      path: "media.problems",
      group: "Home",
      groupPath: "/",
      title: "Problems addressed",
      where: "Home page, Problems addressed section, beside the heading",
      pagePath: "/",
      desktop: "classic",
      phone: "classic",
      required: true,
    },
    {
      key: "close",
      path: "media.close",
      group: "Home",
      groupPath: "/",
      title: "Closing band",
      where: "Home page, wide band above the closing call to action",
      pagePath: "/",
      desktop: "wide",
      phone: "classic",
      required: true,
    },
  ],
  about: [
    {
      key: "portrait",
      path: "media.portrait",
      group: "About",
      groupPath: "/about",
      title: "Founder portrait",
      where: "About page, beside the career text",
      pagePath: "/about",
      desktop: "portrait",
      phone: "portrait",
      required: true,
    },
    {
      key: "site",
      path: "media.site",
      group: "About",
      groupPath: "/about",
      title: "Site image",
      where: "About page, lower image on the left",
      pagePath: "/about",
      desktop: "landscape",
      phone: "landscape",
      required: true,
    },
    {
      key: "desk",
      path: "media.desk",
      group: "About",
      groupPath: "/about",
      title: "Desk image",
      where: "About page, lower image on the right",
      pagePath: "/about",
      desktop: "portrait",
      phone: "portrait",
      required: true,
    },
  ],
  pages: [
    {
      key: "services",
      path: "services.figure",
      group: "Services page",
      groupPath: "/services",
      title: "Services page image",
      where: "Services page, wide image under the heading",
      pagePath: "/services",
      desktop: "wide",
      phone: "classic",
      required: true,
    },
    {
      key: "credentials",
      path: "credentials.figure",
      group: "Credentials page",
      groupPath: "/credentials",
      title: "Credentials page image",
      where: "Credentials page, wide image under the heading",
      pagePath: "/credentials",
      desktop: "wide",
      phone: "classic",
      required: true,
    },
    {
      key: "contact",
      path: "contact.figure",
      group: "Contact page",
      groupPath: "/contact",
      title: "Contact page image",
      where: "Contact page, beside the enquiry form (wide screens only)",
      pagePath: "/contact",
      desktop: "landscape",
      phone: "hidden",
      required: true,
    },
  ],
};

const SEO_LABELS: Record<string, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  credentials: "Credentials",
  insights: "Insights",
  contact: "Contact",
  thankYou: "Thank-you page",
  privacy: "Privacy notice",
  terms: "Terms of use",
  accessibility: "Accessibility statement",
};

function ownerLabelled(def: Def, owner: OwnerRef, id: string): SpotInstance {
  return {
    id,
    owner,
    path: def.path,
    group: def.group,
    groupPath: def.groupPath,
    title: def.title,
    where: def.where,
    pagePath: def.pagePath,
    desktop: def.desktop,
    phone: def.phone,
    required: def.required,
    badgeOnly: def.badgeOnly === true,
  };
}

/** Spots owned by a global: Home, About, page images and share images for the fixed pages. */
export function globalSpots(): SpotInstance[] {
  const spots: SpotInstance[] = [];
  for (const slug of ["home", "about", "pages"] as const) {
    for (const def of GLOBAL_DEFS[slug]) {
      spots.push(ownerLabelled(def, { kind: "global", slug }, `${slug}:${def.path}`));
    }
  }
  for (const [route, key] of Object.entries(SEO_ROUTES)) {
    const label = SEO_LABELS[key] ?? key;
    spots.push(
      ownerLabelled(
        {
          key,
          path: `${key}.ogImage`,
          group: "Share images",
          groupPath: null,
          title: `${label}`,
          where: `Picture shown when a link to the ${label.toLowerCase()} page (${route}) is shared`,
          pagePath: route,
          desktop: "share",
          phone: "share",
          required: false,
        },
        { kind: "global", slug: "seo" },
        `seo:${key}.ogImage`,
      ),
    );
  }
  return spots;
}

export function serviceSpots(service: { id: number; slug: string; title: string }): SpotInstance[] {
  const owner: OwnerRef = { kind: "collection", slug: "services", id: service.id };
  const page = `/services/${service.slug}`;
  const base = { group: `Service: ${service.title}`, groupPath: page, pagePath: page };
  return [
    ownerLabelled(
      {
        ...base,
        key: "hero",
        path: "media.hero",
        title: "Main image",
        where:
          "Service page, wide image under the heading (also the thumbnail in the Services list and Related services)",
        desktop: "wide",
        phone: "classic",
        required: true,
      },
      owner,
      `services:${service.id}:media.hero`,
    ),
    ownerLabelled(
      {
        ...base,
        key: "detail",
        path: "media.detail",
        title: "Detail image",
        where: "Service page, beside part 3.0 Capability",
        desktop: "landscape",
        phone: "landscape",
        required: true,
      },
      owner,
      `services:${service.id}:media.detail`,
    ),
    ownerLabelled(
      {
        ...base,
        key: "share",
        path: "seo.ogImage",
        title: "Share image",
        where: `Picture shown when a link to this service page is shared`,
        desktop: "share",
        phone: "share",
        required: false,
      },
      owner,
      `services:${service.id}:seo.ogImage`,
    ),
  ];
}

export function credentialSpot(credential: { id: number; title: string }): SpotInstance {
  return ownerLabelled(
    {
      key: "badge",
      path: "badge",
      group: "Credential badges",
      groupPath: "/credentials",
      title: credential.title,
      where: "Credentials page register and the Home credentials strip",
      pagePath: "/credentials",
      desktop: "square",
      phone: "square",
      required: false,
      badgeOnly: true,
    },
    { kind: "collection", slug: "credentials", id: credential.id },
    `credentials:${credential.id}:badge`,
  );
}

/** Field paths per owner slug, for the completeness test and for refusing unknown writes. */
export function registeredFieldPaths(): Record<
  "home" | "about" | "pages" | "seo" | "services" | "credentials",
  string[]
> {
  return {
    home: GLOBAL_DEFS.home.map((def) => def.path),
    about: GLOBAL_DEFS.about.map((def) => def.path),
    pages: GLOBAL_DEFS.pages.map((def) => def.path),
    seo: Object.values(SEO_ROUTES).map((key) => `${key}.ogImage`),
    services: ["media.hero", "media.detail", "seo.ogImage"],
    credentials: ["badge"],
  };
}

export function isRegisteredPath(owner: OwnerRef, path: string): boolean {
  return registeredFieldPaths()[owner.slug].includes(path);
}
```

- [ ] **Step 4: Run, typecheck, lint**

Run: `npx tsx --test tests/cms/unit/spots.test.ts && pnpm typecheck && pnpm lint`
Expected: 5 tests pass; both exit 0. If the completeness test fails, the failure names the owner and the difference — fix the registry, not the test. If `Home`, `About`, `Pages` or `Seo` are not exported under those names, open `src/cms/globals/index.ts` and use the exported names (they are listed in `payload.config.ts`: `About, Home, Pages, Seo, SiteSettings`).

- [ ] **Step 5: Commit**

```bash
git add src/cms/images/types.ts src/cms/images/spots.ts tests/cms/unit/spots.test.ts
git commit -m "feat(cms): registry of every image spot, with a completeness test

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Cards, usage and the page data

**Files:**

- Create: `src/cms/images/local-api.ts`, `src/cms/images/cards.ts`, `src/cms/images/data.ts`, `tests/cms/unit/cards.test.ts`

**Interfaces:**

- Consumes: Tasks 5–6.
- Produces:
  - `localApi(payload: Payload): LocalApi` and `asDoc(value: unknown): Record<string, unknown>` (`local-api.ts`).
  - `buildCard(spot: SpotInstance, ctx: { latest: Doc; published: Doc | null; media: Map<number, ImageView>; publishedMedia: Map<number, ImageView>; adminHref: string }): SpotCard` (`cards.ts`); `cardStatus(card: SpotCard): { tone: "ok" | "warn" | "info"; text: string }[]`; `needsAttention(card: SpotCard): boolean`.
  - `loadImagesPage(payload: Payload): Promise<ImagesPageData>`; `findUsages(payload: Payload, mediaId: number): Promise<UsageView[]>`; `imageViewOf(doc: Doc): ImageView` (`data.ts`).

- [ ] **Step 1: Write the failing test for the pure card logic**

`tests/cms/unit/cards.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCard, cardStatus, needsAttention } from "../../../src/cms/images/cards";
import { globalSpots } from "../../../src/cms/images/spots";
import type { ImageView } from "../../../src/cms/images/types";

function image(id: number, over: Partial<ImageView> = {}): ImageView {
  return {
    id,
    src: `/api/media/file/${id}.jpg`,
    filename: `${id}.jpg`,
    alt: "Test",
    caption: "Test",
    width: 100,
    height: 100,
    focalX: 50,
    focalY: 50,
    approved: true,
    assetClass: "photograph",
    meta: {
      assetClass: "photograph",
      alt: "Test",
      decorative: false,
      caption: "Test",
      source: "s",
      licence: "l",
      usageRights: "u",
      attribution: "",
    },
    ...over,
  };
}

const spot = globalSpots().find((s) => s.id === "home:media.why");
if (!spot) throw new Error("spot missing");

function ctx(
  latest: Record<string, unknown>,
  published: Record<string, unknown> | null,
  media: ImageView[],
) {
  const byId = new Map(media.map((m) => [m.id, m]));
  return { latest, published, media: byId, publishedMedia: byId, adminHref: "/admin/globals/home" };
}

test("an approved image that matches the published page needs no attention", () => {
  const card = buildCard(spot, ctx({ media: { why: 1 } }, { media: { why: 1 } }, [image(1)]));
  assert.equal(card.pending, false);
  assert.equal(needsAttention(card), false);
  assert.ok(cardStatus(card).some((s) => /approved for public use/i.test(s.text)));
});

test("a changed image is a draft change waiting", () => {
  const card = buildCard(
    spot,
    ctx({ media: { why: 2 } }, { media: { why: 1 } }, [image(1), image(2)]),
  );
  assert.equal(card.pending, true);
  assert.equal(card.image?.id, 2);
  assert.ok(cardStatus(card).some((s) => /draft change waiting/i.test(s.text)));
  assert.equal(needsAttention(card), true);
});

test("other unpublished edits in the section are listed, but not this spot", () => {
  const card = buildCard(
    spot,
    ctx(
      { media: { why: 2 }, hero: { headline: "New" } },
      { media: { why: 1 }, hero: { headline: "Old" } },
      [image(1), image(2)],
    ),
  );
  assert.deepEqual(card.otherChanges, ["hero.headline"]);
});

test("a section that was never published counts as pending", () => {
  const card = buildCard(spot, ctx({ media: { why: 1 } }, null, [image(1)]));
  assert.equal(card.pending, true);
});

test("an empty required spot says the page shows a placeholder", () => {
  const card = buildCard(spot, ctx({ media: { why: null } }, { media: { why: null } }, []));
  assert.equal(card.image, null);
  assert.ok(cardStatus(card).some((s) => /no image/i.test(s.text) && /placeholder/i.test(s.text)));
  assert.equal(needsAttention(card), true);
});

test("an unapproved image is hidden on the live site, and the card says so in words", () => {
  const card = buildCard(
    spot,
    ctx({ media: { why: 1 } }, { media: { why: 1 } }, [image(1, { approved: false })]),
  );
  assert.ok(cardStatus(card).some((s) => /not approved/i.test(s.text) && /hidden/i.test(s.text)));
  assert.equal(needsAttention(card), true);
});

test("an unpublished focal point change is flagged", () => {
  const latest = image(1, { focalX: 20 });
  const published = image(1, { focalX: 50 });
  const card = buildCard(spot, {
    latest: { media: { why: 1 } },
    published: { media: { why: 1 } },
    media: new Map([[1, latest]]),
    publishedMedia: new Map([[1, published]]),
    adminHref: "/admin/globals/home",
  });
  assert.equal(card.focalPending, true);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx tsx --test tests/cms/unit/cards.test.ts`
Expected: FAIL — module `cards` not found.

- [ ] **Step 3: Implement `cards.ts`**

```ts
import { changedPaths, getPath } from "./doc-paths";
import type { ImageView, SpotCard, SpotInstance } from "./types";

type Doc = Record<string, unknown>;

export interface CardContext {
  latest: Doc;
  published: Doc | null;
  media: Map<number, ImageView>;
  publishedMedia: Map<number, ImageView>;
  adminHref: string;
}

/** The id of the image at a path, whether the document holds an id or a populated record. */
function mediaIdAt(doc: Doc | null, path: string): number | null {
  const value = getPath(doc, path);
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && typeof (value as Doc)["id"] === "number") {
    return (value as Doc)["id"] as number;
  }
  return null;
}

export function buildCard(spot: SpotInstance, ctx: CardContext): SpotCard {
  const latestId = mediaIdAt(ctx.latest, spot.path);
  const publishedId = mediaIdAt(ctx.published, spot.path);
  const image = latestId === null ? null : (ctx.media.get(latestId) ?? null);
  const publishedImage =
    publishedId === null ? null : (ctx.publishedMedia.get(publishedId) ?? null);

  const focalPending =
    image !== null &&
    publishedImage !== null &&
    image.id === publishedImage.id &&
    (image.focalX !== publishedImage.focalX || image.focalY !== publishedImage.focalY);

  const otherChanges = ctx.published
    ? changedPaths(ctx.published, ctx.latest).filter((path) => path !== spot.path)
    : [];

  return {
    ...spot,
    adminHref: ctx.adminHref,
    image,
    pending: ctx.published === null || latestId !== publishedId,
    focalPending,
    otherChanges,
    sharedWith: [],
  };
}

/** Status in words, never colour alone. */
export function cardStatus(card: SpotCard): { tone: "ok" | "warn" | "info"; text: string }[] {
  const out: { tone: "ok" | "warn" | "info"; text: string }[] = [];
  if (!card.image) {
    out.push({
      tone: "warn",
      text: card.required
        ? "No image — the page shows a placeholder"
        : "No image — nothing is shown for this",
    });
  } else if (card.image.approved) {
    out.push({ tone: "ok", text: "Approved for public use" });
  } else {
    out.push({ tone: "warn", text: "Not approved — hidden on the live site" });
  }
  if (card.pending) out.push({ tone: "info", text: "Draft change waiting" });
  if (card.focalPending) out.push({ tone: "info", text: "Focal point change waiting" });
  return out;
}

export function needsAttention(card: SpotCard): boolean {
  if (card.pending || card.focalPending) return true;
  if (!card.image) return card.required;
  return !card.image.approved;
}
```

- [ ] **Step 4: Run the card tests**

Run: `npx tsx --test tests/cms/unit/cards.test.ts`
Expected: 7 tests pass.

- [ ] **Step 5: Implement `local-api.ts`**

```ts
import type { Payload } from "payload";

/*
 * The Local API with loose argument types, the same approach as src/content/cms-source.ts: the
 * generated collection types would force a cast at every call here.
 */

export type Doc = Record<string, unknown>;

export function asDoc(value: unknown): Doc {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Doc) : {};
}

export interface LocalApi {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[] }>;
  findByID(args: Record<string, unknown>): Promise<unknown>;
  findGlobal(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
  updateGlobal(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
}

export function localApi(payload: Payload): LocalApi {
  return payload as unknown as LocalApi;
}
```

- [ ] **Step 6: Implement `data.ts`**

```ts
import type { Payload } from "payload";
import { mediaSrc } from "../../content/mappers";
import { buildCard } from "./cards";
import { getPath } from "./doc-paths";
import { asDoc, localApi, type Doc } from "./local-api";
import { credentialSpot, globalSpots, serviceSpots } from "./spots";
import type {
  ImageView,
  ImagesPageData,
  OwnerRef,
  SpotCard,
  SpotInstance,
  UnusedImage,
  UsageView,
} from "./types";

/*
 * Reads every image owner (Home, About, Pages, Search results, each service, each credential)
 * twice, the latest draft and the published copy, plus every image record, and builds the cards.
 * Runs in the admin view and in the delete guard, always after an isAdmin check.
 */

const text = (doc: Doc, key: string): string =>
  typeof doc[key] === "string" ? (doc[key] as string) : "";
const flag = (doc: Doc, key: string): boolean => doc[key] === true;
const number = (doc: Doc, key: string, fallback: number): number =>
  typeof doc[key] === "number" && Number.isFinite(doc[key]) ? (doc[key] as number) : fallback;

export function imageViewOf(doc: Doc): ImageView {
  return {
    id: number(doc, "id", 0),
    src: mediaSrc(doc),
    filename: text(doc, "filename"),
    alt: text(doc, "alt"),
    caption: text(doc, "caption"),
    width: number(doc, "width", 0),
    height: number(doc, "height", 0),
    focalX: number(doc, "focalX", 50),
    focalY: number(doc, "focalY", 50),
    approved: flag(doc, "approvedForPublic"),
    assetClass: text(doc, "assetClass") || "photograph",
    meta: {
      assetClass: text(doc, "assetClass") || "photograph",
      alt: text(doc, "alt"),
      decorative: flag(doc, "decorative"),
      caption: text(doc, "caption"),
      source: text(doc, "source"),
      licence: text(doc, "licence"),
      usageRights: text(doc, "usageRights"),
      attribution: text(doc, "attribution"),
    },
  };
}

interface OwnerDocs {
  owner: OwnerRef;
  adminHref: string;
  latest: Doc;
  published: Doc | null;
  spots: SpotInstance[];
}

async function all(payload: Payload, collection: string, draft: boolean): Promise<Doc[]> {
  const api = localApi(payload);
  const result = await api.find({
    collection,
    draft,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    ...(draft ? {} : { where: { _status: { equals: "published" } } }),
  });
  return result.docs.map(asDoc);
}

async function loadOwners(payload: Payload): Promise<OwnerDocs[]> {
  const api = localApi(payload);
  const owners: OwnerDocs[] = [];

  const globals = globalSpots();
  for (const slug of ["home", "about", "pages", "seo"] as const) {
    const latest = asDoc(
      await api.findGlobal({ slug, draft: true, depth: 0, overrideAccess: true }),
    );
    const published = asDoc(
      await api.findGlobal({ slug, draft: false, depth: 0, overrideAccess: true }),
    );
    owners.push({
      owner: { kind: "global", slug },
      adminHref: `/admin/globals/${slug}`,
      latest,
      published: published["_status"] === "published" ? published : null,
      spots: globals.filter((spot) => spot.owner.kind === "global" && spot.owner.slug === slug),
    });
  }

  const publishedServices = new Map(
    (await all(payload, "services", false)).map((doc) => [doc["id"], doc]),
  );
  for (const doc of await all(payload, "services", true)) {
    const id = number(doc, "id", 0);
    owners.push({
      owner: { kind: "collection", slug: "services", id },
      adminHref: `/admin/collections/services/${id}`,
      latest: doc,
      published: publishedServices.get(doc["id"]) ?? null,
      spots: serviceSpots({ id, slug: text(doc, "slug"), title: text(doc, "title") }),
    });
  }

  const publishedCredentials = new Map(
    (await all(payload, "credentials", false)).map((doc) => [doc["id"], doc]),
  );
  for (const doc of await all(payload, "credentials", true)) {
    if (getPath(doc, "badge") === null || getPath(doc, "badge") === undefined) continue;
    const id = number(doc, "id", 0);
    owners.push({
      owner: { kind: "collection", slug: "credentials", id },
      adminHref: `/admin/collections/credentials/${id}`,
      latest: doc,
      published: publishedCredentials.get(doc["id"]) ?? null,
      spots: [credentialSpot({ id, title: text(doc, "title") })],
    });
  }
  return owners;
}

async function loadMedia(payload: Payload): Promise<{
  latest: Map<number, ImageView>;
  published: Map<number, ImageView>;
  createdAt: Map<number, string>;
}> {
  const toMap = (docs: Doc[]) =>
    new Map(
      docs
        .filter((doc) => text(doc, "kind") !== "slot" && text(doc, "filename") !== "")
        .map((doc) => [number(doc, "id", 0), imageViewOf(doc)] as const),
    );
  const latestDocs = await all(payload, "media", true);
  return {
    latest: toMap(latestDocs),
    published: toMap(await all(payload, "media", false)),
    createdAt: new Map(latestDocs.map((doc) => [number(doc, "id", 0), text(doc, "createdAt")])),
  };
}

function usedIds(owners: OwnerDocs[]): Set<number> {
  const ids = new Set<number>();
  for (const { latest, published, spots } of owners) {
    for (const spot of spots) {
      for (const doc of [latest, published]) {
        const value = getPath(doc, spot.path);
        if (typeof value === "number") ids.add(value);
        else if (value && typeof value === "object" && typeof (value as Doc)["id"] === "number") {
          ids.add((value as Doc)["id"] as number);
        }
      }
    }
  }
  return ids;
}

export async function loadImagesPage(payload: Payload): Promise<ImagesPageData> {
  const [owners, media] = await Promise.all([loadOwners(payload), loadMedia(payload)]);

  const cards: SpotCard[] = owners.flatMap((owner) =>
    owner.spots.map((spot) =>
      buildCard(spot, {
        latest: owner.latest,
        published: owner.published,
        media: media.latest,
        publishedMedia: media.published,
        adminHref: owner.adminHref,
      }),
    ),
  );

  // Titles of the other spots that use the same image, for the replace and delete warnings.
  const byImage = new Map<number, SpotCard[]>();
  for (const card of cards) {
    if (card.image) byImage.set(card.image.id, [...(byImage.get(card.image.id) ?? []), card]);
  }
  for (const card of cards) {
    if (!card.image) continue;
    card.sharedWith = (byImage.get(card.image.id) ?? [])
      .filter((other) => other.id !== card.id)
      .map((other) => `${other.group} → ${other.title}`);
  }

  const used = usedIds(owners);
  const unused: UnusedImage[] = [...media.latest.values()]
    .filter((image) => !used.has(image.id))
    .map((image) => ({ image, createdAt: media.createdAt.get(image.id) ?? "" }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { cards, unused };
}

/** Every spot (latest draft or published) that uses an image. Used by the delete guard. */
export async function findUsages(payload: Payload, mediaId: number): Promise<UsageView[]> {
  const owners = await loadOwners(payload);
  const usages: UsageView[] = [];
  for (const { latest, published, spots } of owners) {
    for (const spot of spots) {
      const hit = [latest, published].some((doc) => {
        const value = getPath(doc, spot.path);
        const id = typeof value === "number" ? value : asDoc(value)["id"];
        return id === mediaId;
      });
      if (hit)
        usages.push({ spotId: spot.id, group: spot.group, title: spot.title, where: spot.where });
    }
  }
  return usages;
}
```

- [ ] **Step 7: Typecheck, lint, run all unit tests**

Run: `pnpm typecheck && pnpm lint && pnpm test:cms-unit`
Expected: all exit 0; every unit test passes (new and existing).

- [ ] **Step 8: Commit**

```bash
git add src/cms/images tests/cms/unit/cards.test.ts
git commit -m "feat(cms): build the Images page data (cards, usage, unused images)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Server actions and the in-use delete guard

**Files:**

- Create: `src/cms/images/in-use.ts`, `src/cms/images/actions.ts`
- Modify: `src/cms/collections/media.ts` (add the `beforeDelete` hook)

**Interfaces:**

- Consumes: `localApi`, `findUsages`, `isRegisteredPath`, `setPath`, `OwnerRef`, `ActionResult`.
- Produces (`in-use.ts`): `ALLOW_IN_USE_DELETE = "allowInUseDelete"`; `refuseInUseDelete: CollectionBeforeDeleteHook`.
- Produces (`actions.ts`, all `async`, all re-check `isAdmin`):
  - `setSpotImage(owner: OwnerRef, path: string, mediaId: number | null): Promise<ActionResult>` — saves a **draft** with one path changed.
  - `publishSpot(owner: OwnerRef): Promise<ActionResult>` — publishes the owning document's latest draft.
  - `saveFocalPoint(mediaId: number, x: number, y: number): Promise<ActionResult>` — saves a draft of the media record.
  - `publishImage(mediaId: number): Promise<ActionResult>` — publishes the media record's latest draft.
  - `swapImage(oldId: number, newId: number): Promise<ActionResult>` — re-points every spot using `oldId` to `newId`, as drafts.
  - `deleteImage(mediaId: number, confirmed: boolean): Promise<ActionResult>`.

- [ ] **Step 1: Implement `in-use.ts`**

```ts
import { APIError, type CollectionBeforeDeleteHook } from "payload";
import { findUsages } from "./data";

/*
 * An image that a page still uses must not be deleted by accident. The Media section's own delete
 * is refused with a message that points to the Images page. That page's delete action sets this
 * request-context key after its two-step confirmation; the key cannot be set through REST or the
 * admin (same pattern as IMPORT_PUBLISH in hooks/lifecycle.ts).
 */
export const ALLOW_IN_USE_DELETE = "allowInUseDelete";

export const refuseInUseDelete: CollectionBeforeDeleteHook = async ({ id, req, context }) => {
  if (context[ALLOW_IN_USE_DELETE] === true) return;
  const numeric = typeof id === "number" ? id : Number(id);
  if (!Number.isFinite(numeric)) return;
  const usages = await findUsages(req.payload, numeric);
  if (usages.length > 0) {
    throw new APIError(
      `This image is used in ${usages.length} place${usages.length === 1 ? "" : "s"}. Delete it from "Images on the website", which shows where it is used.`,
      409,
    );
  }
};
```

In `src/cms/collections/media.ts` add `import { refuseInUseDelete } from "../images/in-use";` and, in `hooks`, add `beforeDelete: [refuseInUseDelete],` (before `afterDelete`).

- [ ] **Step 2: Implement `actions.ts`**

```ts
"use server";

import { headers } from "next/headers";
import { getPayload, ValidationError, type Payload, type PayloadRequest } from "payload";
import config from "@payload-config";
import { isAdmin } from "../access";
import { setPath } from "./doc-paths";
import { ALLOW_IN_USE_DELETE } from "./in-use";
import { findUsages } from "./data";
import { asDoc, localApi, type Doc } from "./local-api";
import { isRegisteredPath } from "./spots";
import type { ActionResult, OwnerRef } from "./types";

/*
 * Every write the Images page makes. Each action authenticates the caller with the same isAdmin
 * rule as the rest of the CMS (signed in AND a valid second-factor cookie), re-reads the latest
 * draft at call time, and changes one path only. Writes go through the Local API, so access to
 * approval flags, the publish guard, the audit log and revalidation all run as for any other edit.
 */

interface Context {
  payload: Payload;
  user: unknown;
}

async function adminContext(): Promise<Context> {
  const payload = await getPayload({ config });
  const requestHeaders = await headers();
  const { user } = await payload.auth({ headers: requestHeaders });
  const probe = { user, headers: requestHeaders } as unknown as Pick<
    PayloadRequest,
    "user" | "headers"
  >;
  if (!isAdmin(probe)) throw new Error("Not allowed.");
  return { payload, user };
}

/** Plain words for a Payload error: validation messages with their field names, or the message. */
function describe(error: unknown): string {
  if (error instanceof ValidationError) {
    const errors = (error.data as { errors?: { path?: string; message?: string }[] } | undefined)
      ?.errors;
    if (errors?.length) {
      return errors
        .map((item) => `${item.path ?? "field"}: ${item.message ?? "invalid"}`)
        .join("; ");
    }
  }
  return error instanceof Error ? error.message : "Something went wrong. Nothing was changed.";
}

/** Fields Payload sets itself; never sent back when a draft is saved or published. */
function writable(doc: Doc): Doc {
  const { id: _id, createdAt: _c, updatedAt: _u, globalType: _g, ...rest } = doc;
  return rest;
}

async function readLatest(payload: Payload, owner: OwnerRef): Promise<Doc> {
  const api = localApi(payload);
  if (owner.kind === "global") {
    return asDoc(
      await api.findGlobal({ slug: owner.slug, draft: true, depth: 0, overrideAccess: true }),
    );
  }
  return asDoc(
    await api.findByID({
      collection: owner.slug,
      id: owner.id,
      draft: true,
      depth: 0,
      overrideAccess: true,
    }),
  );
}

async function save(
  { payload, user }: Context,
  owner: OwnerRef,
  data: Doc,
  draft: boolean,
): Promise<void> {
  const api = localApi(payload);
  const args = { data, draft, overrideAccess: true, user };
  if (owner.kind === "global") await api.updateGlobal({ slug: owner.slug, ...args });
  else await api.update({ collection: owner.slug, id: owner.id, ...args });
}

export async function setSpotImage(
  owner: OwnerRef,
  path: string,
  mediaId: number | null,
): Promise<ActionResult> {
  try {
    const context = await adminContext();
    if (!isRegisteredPath(owner, path))
      return { ok: false, message: "That image spot is not recognised." };
    const latest = writable(await readLatest(context.payload, owner));
    await save(context, owner, setPath(latest, path, mediaId), true);
    return { ok: true, message: "Saved as a draft. Preview it, then publish." };
  } catch (error) {
    return { ok: false, message: describe(error) };
  }
}

export async function publishSpot(owner: OwnerRef): Promise<ActionResult> {
  try {
    const context = await adminContext();
    const latest = writable(await readLatest(context.payload, owner));
    await save(context, owner, { ...latest, _status: "published" }, false);
    return { ok: true, message: "Published." };
  } catch (error) {
    return { ok: false, message: describe(error) };
  }
}

export async function saveFocalPoint(mediaId: number, x: number, y: number): Promise<ActionResult> {
  try {
    const context = await adminContext();
    if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) {
      return { ok: false, message: "The focal point must be between 0 and 100 on both axes." };
    }
    await localApi(context.payload).update({
      collection: "media",
      id: mediaId,
      data: { focalX: Math.round(x * 10) / 10, focalY: Math.round(y * 10) / 10 },
      draft: true,
      overrideAccess: true,
      user: context.user,
    });
    return { ok: true, message: "Focal point saved as a draft." };
  } catch (error) {
    return { ok: false, message: describe(error) };
  }
}

export async function publishImage(mediaId: number): Promise<ActionResult> {
  try {
    const context = await adminContext();
    const api = localApi(context.payload);
    const latest = writable(
      asDoc(
        await api.findByID({
          collection: "media",
          id: mediaId,
          draft: true,
          depth: 0,
          overrideAccess: true,
        }),
      ),
    );
    await api.update({
      collection: "media",
      id: mediaId,
      data: { ...latest, _status: "published" },
      draft: false,
      overrideAccess: true,
      user: context.user,
    });
    return { ok: true, message: "Image published." };
  } catch (error) {
    return { ok: false, message: describe(error) };
  }
}

/** Points every spot that uses `oldId` at `newId`, as drafts (used after Replace file). */
export async function swapImage(oldId: number, newId: number): Promise<ActionResult> {
  try {
    const context = await adminContext();
    const usages = await findUsages(context.payload, oldId);
    if (usages.length === 0) return { ok: true, message: "Nothing used the old image." };
    // Spot ids encode their owner and path: "<owner>:<path>" or "<collection>:<id>:<path>".
    for (const usage of usages) {
      const parts = usage.spotId.split(":");
      const owner: OwnerRef =
        parts.length === 2
          ? { kind: "global", slug: parts[0] as "home" | "about" | "pages" | "seo" }
          : {
              kind: "collection",
              slug: parts[0] as "services" | "credentials",
              id: Number(parts[1]),
            };
      const path = parts[parts.length - 1] ?? "";
      if (!isRegisteredPath(owner, path)) continue;
      const latest = writable(await readLatest(context.payload, owner));
      await save(context, owner, setPath(latest, path, newId), true);
    }
    return {
      ok: true,
      message: `${usages.length} place${usages.length === 1 ? "" : "s"} now use the new image as a draft.`,
    };
  } catch (error) {
    return { ok: false, message: describe(error) };
  }
}

export async function deleteImage(mediaId: number, confirmed: boolean): Promise<ActionResult> {
  try {
    const context = await adminContext();
    const usages = await findUsages(context.payload, mediaId);
    if (usages.length > 0 && !confirmed) {
      return {
        ok: false,
        needsConfirmation: true,
        usages,
        message:
          "This image is in use. Confirm to delete it and leave those spots without an image.",
      };
    }
    await localApi(context.payload).delete({
      collection: "media",
      id: mediaId,
      overrideAccess: true,
      user: context.user,
      context: { [ALLOW_IN_USE_DELETE]: true },
    });
    return { ok: true, message: "Image deleted." };
  } catch (error) {
    return { ok: false, message: describe(error) };
  }
}
```

Spot ids use `:` as a separator and the registry's paths contain no colon, so the decode in `swapImage` is safe. (`services:12:media.hero` → `["services","12","media.hero"]`; `home:media.why` → `["home","media.why"]`.)

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0. ESLint's `no-unused-vars` may flag the `_id`-style destructures in `writable`; if it does, rewrite `writable` as `const copy = { ...doc }; for (const key of ["id","createdAt","updatedAt","globalType"]) delete copy[key]; return copy;`.

- [ ] **Step 4: Commit**

```bash
git add src/cms/images/in-use.ts src/cms/images/actions.ts src/cms/collections/media.ts
git commit -m "feat(cms): Images page actions and a guard against deleting images in use

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: The admin view, navigation and styles

**Files:**

- Create: `src/cms/views/images.tsx`
- Modify: `src/payload.config.ts`, `src/cms/nav/nav-groups.ts`, `src/cms/nav/admin-nav.tsx`, `src/cms/nav/nav-client.tsx`, `src/app/(payload)/admin-theme.css`
- Regenerate: `src/app/(payload)/admin/importMap.js`

**Interfaces:**

- Consumes: `loadImagesPage`, `ImagesPageData`.
- Produces: `ImagesView` (server component, path `/admin/images`) rendering `<ImagesClient data={data} />` (Task 10).

- [ ] **Step 1: Write the server view**

`src/cms/views/images.tsx`:

```tsx
import * as React from "react";
import type { AdminViewServerProps } from "payload";
import { isAdmin } from "../access";
import { loadImagesPage } from "../images/data";
import { ImagesClient } from "./images/images-client";

/*
 * "Images on the website": every image the site shows, grouped by page, with where it appears and
 * what it looks like in its real frame. A server component: nothing is read before the isAdmin
 * check (signed in AND a verified second factor). Writes happen in src/cms/images/actions.ts.
 * Styles: src/app/(payload)/admin-theme.css (".dts-img-*").
 */
export async function ImagesView({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult;
  if (!isAdmin(req)) return null;
  const data = await loadImagesPage(req.payload);
  return (
    <div className="dts-dashboard dts-img">
      <header className="dts-dashboard__head">
        <div>
          <h1>Images on the website</h1>
          <p>
            Every image the website shows, with where it appears. Changes are saved as drafts.
            Preview the page, then publish.
          </p>
        </div>
      </header>
      <ImagesClient data={data} />
    </div>
  );
}
```

(The wrapper and heading reuse the dashboard's `.dts-dashboard` and `.dts-dashboard__head`, so spacing, width and the mobile heading size match.)

- [ ] **Step 2: Register the view and add the nav entry**

In `src/payload.config.ts`, inside `admin.components.views` after `dashboard`:

```ts
        images: {
          Component: "/cms/views/images#ImagesView",
          path: "/images",
        },
```

In `src/cms/nav/nav-groups.ts` add `"images"` to the Content group's `slugs`, before `"media"`.

In `src/cms/nav/admin-nav.tsx`, after the `entries = grouped.flatMap(…)` assignment (still inside the `if (verified && …)` block) add:

```ts
// Not a collection or global, so it is added by hand.
entries.push({ slug: "images", label: "Images on the website", href: `${ADMIN_ROUTE}/images` });
```

In `src/cms/nav/nav-client.tsx` add `Images,` to the lucide import list (alphabetical, after `Image as ImageIcon`) and `images: Images,` to `ICONS`. Verify the icon exists first: `grep -c "declare const Images:" node_modules/lucide-react/dist/lucide-react.d.ts` → `1`; if `0`, use `ImageIcon` for both.

- [ ] **Step 3: Stub the client component so the build compiles**

Create `src/cms/views/images/images-client.tsx`:

```tsx
"use client";

import * as React from "react";
import type { ImagesPageData } from "../../images/types";

export function ImagesClient({ data }: { data: ImagesPageData }) {
  return <p>{data.cards.length} image spots.</p>;
}
```

- [ ] **Step 4: Regenerate the import map and typecheck**

Run:

```bash
node node_modules/payload/bin.js generate:importmap
pnpm typecheck && pnpm lint
```

Expected: `src/app/(payload)/admin/importMap.js` now contains `ImagesView`; typecheck and lint exit 0.

- [ ] **Step 5: Styles**

Append to `src/app/(payload)/admin-theme.css`, using only the existing `--dts-*` variables (`.dts-sr-only` already exists in the file for visually hidden text):

```css
/* ---------- Images on the website (src/cms/views/images) ---------- */

.dts-img__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin: 0 0 24px;
}
.dts-img__toolbar input[type="search"],
.dts-img__toolbar select {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--dts-line);
  border-radius: 8px;
  background: var(--dts-surface);
  color: var(--dts-ink);
  font: inherit;
}
.dts-img__tabs {
  display: flex;
  gap: 4px;
  margin: 0 0 20px;
  border-bottom: 1px solid var(--dts-line);
}
.dts-img__tab {
  min-height: 44px;
  padding: 0 16px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: none;
  color: var(--dts-muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.dts-img__tab[aria-selected="true"] {
  color: var(--dts-ink);
  border-bottom-color: var(--dts-primary);
}
.dts-img__group {
  margin: 0 0 40px;
}
.dts-img__group-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: baseline;
  margin: 0 0 16px;
}
.dts-img__group-head h2 {
  margin: 0;
  font-size: 18px;
}
.dts-img__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.dts-img__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--dts-line);
  border-radius: 12px;
  background: var(--dts-surface);
}
.dts-img__frame {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 8px;
  background: var(--dts-grey-bg);
}
.dts-img__frame img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dts-img__empty {
  display: grid;
  place-items: center;
  height: 100%;
  padding: 12px;
  border: 2px dashed var(--dts-muted);
  border-radius: 8px;
  color: var(--dts-muted);
  font-size: 13px;
  text-align: center;
}
.dts-img__card h3 {
  margin: 0;
  font-size: 16px;
}
.dts-img__where,
.dts-img__shape {
  margin: 0;
  color: var(--dts-muted);
  font-size: 13px;
}
.dts-img__status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.dts-img__status li {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.dts-img__status [data-tone="ok"] {
  background: var(--dts-green-bg);
  color: var(--dts-green-fg);
}
.dts-img__status [data-tone="warn"] {
  background: var(--dts-orange-bg);
  color: var(--dts-orange-fg);
}
.dts-img__status [data-tone="info"] {
  background: var(--dts-blue-bg);
  color: var(--dts-blue-fg);
}
.dts-img__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}
.dts-img__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--dts-line);
  border-radius: 8px;
  background: var(--dts-surface);
  color: var(--dts-ink);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.dts-img__btn:hover {
  border-color: var(--dts-primary);
}
.dts-img__btn--primary {
  border-color: var(--dts-primary);
  background: var(--dts-primary);
  color: #fff;
}
.dts-img__btn--primary:hover {
  background: var(--dts-primary-deep);
}
.dts-img__btn--danger {
  border-color: var(--dts-error);
  color: var(--dts-error);
}
.dts-img__btn:focus-visible,
.dts-img__tab:focus-visible,
.dts-img__toolbar input:focus-visible,
.dts-img__toolbar select:focus-visible,
.dts-img__dialog button:focus-visible,
.dts-img__dialog input:focus-visible {
  outline: 2px solid var(--dts-primary);
  outline-offset: 2px;
}
.dts-img__dialog {
  width: min(720px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
  padding: 24px;
  border: 1px solid var(--dts-line);
  border-radius: 12px;
  background: var(--dts-surface);
  color: var(--dts-ink);
}
.dts-img__dialog::backdrop {
  background: rgb(15 23 36 / 55%);
}
.dts-img__dialog h2 {
  margin: 0 0 8px;
  font-size: 20px;
}
.dts-img__dialog-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}
.dts-img__library {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin: 16px 0;
  padding: 0;
  list-style: none;
}
.dts-img__library button {
  display: block;
  width: 100%;
  padding: 4px;
  border: 2px solid var(--dts-line);
  border-radius: 8px;
  background: var(--dts-surface);
  color: var(--dts-ink);
  text-align: left;
  cursor: pointer;
}
.dts-img__library button[aria-pressed="true"] {
  border-color: var(--dts-primary);
}
.dts-img__library img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}
.dts-img__library span {
  display: block;
  padding: 4px 2px 0;
  font-size: 12px;
}
.dts-img__field {
  display: grid;
  gap: 4px;
  margin: 0 0 12px;
}
.dts-img__field input,
.dts-img__field textarea {
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid var(--dts-line);
  border-radius: 8px;
  font: inherit;
}
.dts-img__error {
  margin: 12px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--dts-error);
  border-radius: 8px;
  color: var(--dts-error);
  font-weight: 600;
}
.dts-img__previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}
.dts-img__focal {
  position: relative;
  display: block;
  width: 100%;
  cursor: crosshair;
}
.dts-img__focal img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.dts-img__focal-dot {
  position: absolute;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--dts-primary);
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .dts-img * {
    transition: none !important;
  }
}
```

- [ ] **Step 6: Run the admin-theme test and lint**

Run: `npx tsx --test tests/cms/unit/admin-theme.test.ts && pnpm lint`
Expected: passes. If the contrast test names a pairing, fix the class to use a token the test already approves.

- [ ] **Step 7: Commit**

```bash
git add src/cms/views src/payload.config.ts src/cms/nav "src/app/(payload)"
git commit -m "feat(cms): Images on the website view, navigation entry and styles

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: The interactive parts (cards, change, replace, focal point, publish, delete)

**Files:**

- Create: `src/cms/views/images/dialog.tsx`, `use-run.ts`, `spot-card.tsx`, `picker.tsx`, `replace.tsx`, `focal.tsx`, `publish.tsx`, `delete.tsx`
- Modify: `src/cms/views/images/images-client.tsx` (replace the stub)

**Interfaces:**

- Consumes: Task 8 actions, Task 7 types, `FRAME_RATIO`/`FRAME_LABEL`, `cardStatus`, `needsAttention`, `objectPositionOf`.
- Produces: `ImagesClient({ data })`.

All admin images use a plain `<img>` (the admin is not the public site; `next/image` is not needed). Add `// eslint-disable-next-line @next/next/no-img-element` above each `<img>` (the same comment `src/cms/media/image-preview.tsx` uses — check it and copy exactly).

- [ ] **Step 1: `use-run.ts` and `dialog.tsx`**

`use-run.ts`:

```ts
"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import type { ActionResult } from "../../images/types";

/** Runs a server action, shows its message in words, and refreshes the page data on success. */
export function useRun() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function run(work: () => Promise<ActionResult>): Promise<ActionResult> {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await work();
      if (result.ok) {
        setNotice(result.message ?? "Done.");
        router.refresh();
      } else if (!result.needsConfirmation) {
        setError(result.message);
      }
      return result;
    } catch {
      const failure: ActionResult = {
        ok: false,
        message: "Something went wrong. Nothing was changed.",
      };
      setError(failure.message);
      return failure;
    } finally {
      setBusy(false);
    }
  }
  return { run, busy, error, notice, setError };
}
```

`dialog.tsx` (native `<dialog>`: focus is trapped and Escape closes it; focus returns to the opener):

```tsx
"use client";

import * as React from "react";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dts-img__dialog" aria-labelledby={titleId} onClose={onClose}>
      <h2 id={titleId}>{title}</h2>
      {open ? children : null}
    </dialog>
  );
}
```

- [ ] **Step 2: `picker.tsx` (Change image: library, upload, use)**

```tsx
"use client";

import * as React from "react";
import { setSpotImage } from "../../images/actions";
import type { SpotCard } from "../../images/types";
import { Dialog } from "./dialog";
import { useRun } from "./use-run";

interface LibraryItem {
  id: number;
  caption: string;
  filename: string;
  alt: string;
}

/** A Payload REST error as one sentence. */
export function restError(body: unknown): string {
  const errors = (
    body as {
      errors?: { message?: string; data?: { errors?: { path?: string; message?: string }[] } }[];
    }
  )?.errors;
  const first = errors?.[0];
  const nested = first?.data?.errors
    ?.map((e) => `${e.path ?? "field"}: ${e.message ?? "invalid"}`)
    .join("; ");
  return nested || first?.message || "The upload was refused. Nothing was saved.";
}

export function PickerDialog({
  card,
  open,
  onClose,
}: {
  card: SpotCard;
  open: boolean;
  onClose: () => void;
}) {
  const { run, busy, error, setError } = useRun();
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<LibraryItem[]>([]);
  const [chosen, setChosen] = React.useState<number | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const load = React.useCallback(async () => {
    const filter = card.badgeOnly
      ? "where[assetClass][equals]=issuer-badge"
      : "where[assetClass][not_equals]=issuer-badge";
    const search = query ? `&where[caption][like]=${encodeURIComponent(query)}` : "";
    const res = await fetch(
      `/api/media?limit=100&depth=0&sort=-updatedAt&where[kind][equals]=image&${filter}${search}`,
      {
        credentials: "same-origin",
      },
    );
    if (!res.ok) return setError("The image library could not be loaded.");
    const body = (await res.json()) as { docs: LibraryItem[] };
    setItems(body.docs.filter((doc) => doc.filename));
  }, [card.badgeOnly, query, setError]);

  React.useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0)
      return setError("Choose an image file to upload.");
    const payload = {
      kind: "image",
      assetClass: card.badgeOnly ? "issuer-badge" : "photograph",
      alt: String(form.get("alt") ?? ""),
      caption: String(form.get("caption") ?? ""),
      source: String(form.get("source") ?? ""),
      licence: String(form.get("licence") ?? ""),
      usageRights: String(form.get("usageRights") ?? ""),
      _status: "published",
    };
    const body = new FormData();
    body.append("file", file);
    body.append("_payload", JSON.stringify(payload));
    setUploading(true);
    try {
      const res = await fetch("/api/media", { method: "POST", body, credentials: "same-origin" });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) return setError(restError(json));
      const id = (json as { doc?: { id?: number } }).doc?.id;
      if (typeof id !== "number")
        return setError("The upload finished but the image could not be found.");
      setChosen(id);
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function use() {
    if (chosen === null) return;
    const result = await run(() => setSpotImage(card.owner, card.path, chosen));
    if (result.ok) onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Change image: ${card.title}`}>
      <p>{card.where}</p>
      <label className="dts-img__field">
        <span>Search the library by caption</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <ul className="dts-img__library">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={chosen === item.id}
              onClick={() => setChosen(item.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/file/${encodeURIComponent(item.filename)}`}
                alt=""
                loading="lazy"
              />
              <span>{item.caption || item.filename}</span>
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p>No images match.</p>}

      <details>
        <summary>Upload a new image</summary>
        <form onSubmit={upload}>
          <label className="dts-img__field">
            <span>Image file (JPEG, PNG, WebP or AVIF, up to 10 MB)</span>
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
            />
          </label>
          <label className="dts-img__field">
            <span>Alternative text (what the image shows)</span>
            <input name="alt" required />
          </label>
          <label className="dts-img__field">
            <span>Caption</span>
            <input name="caption" required />
          </label>
          <label className="dts-img__field">
            <span>Source (where it came from)</span>
            <input name="source" required />
          </label>
          <label className="dts-img__field">
            <span>Licence</span>
            <input name="licence" required />
          </label>
          <label className="dts-img__field">
            <span>Usage rights</span>
            <input name="usageRights" required />
          </label>
          <p>
            Never upload photographs that show a client site, plant, equipment tags or screens. A
            new image is not approved until an approver approves it in Media.
          </p>
          <button className="dts-img__btn" type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </details>

      {error && (
        <p className="dts-img__error" role="alert">
          {error}
        </p>
      )}
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          disabled={chosen === null || busy}
          onClick={use}
        >
          Use this image (save as draft)
        </button>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 3: `replace.tsx`**

```tsx
"use client";

import * as React from "react";
import { swapImage } from "../../images/actions";
import type { SpotCard } from "../../images/types";
import { Dialog } from "./dialog";
import { restError } from "./picker";
import { useRun } from "./use-run";

export function ReplaceDialog({
  card,
  open,
  onClose,
}: {
  card: SpotCard;
  open: boolean;
  onClose: () => void;
}) {
  const { run, busy, error, setError } = useRun();
  const image = card.image;
  if (!image) return null;
  const places = [`${card.group} → ${card.title}`, ...card.sharedWith];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) return;
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return setError("Choose the new image file.");
    if (form.get("rights") !== "on")
      return setError("Confirm the usage rights still apply to the new photograph.");
    const body = new FormData();
    body.append("file", file);
    body.append(
      "_payload",
      JSON.stringify({
        kind: "image",
        ...image.meta,
        focalX: image.focalX,
        focalY: image.focalY,
        _status: "published",
      }),
    );
    const res = await fetch("/api/media", { method: "POST", body, credentials: "same-origin" });
    const json: unknown = await res.json().catch(() => ({}));
    if (!res.ok) return setError(restError(json));
    const id = (json as { doc?: { id?: number } }).doc?.id;
    if (typeof id !== "number")
      return setError("The upload finished but the new image could not be found.");
    const result = await run(() => swapImage(image.id, id));
    if (result.ok) onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Replace file: ${card.title}`}>
      <p>All of these places will change to the new file (as drafts):</p>
      <ul>
        {places.map((place) => (
          <li key={place}>{place}</li>
        ))}
      </ul>
      <p>
        The caption, alternative text and rights record are copied. The new image is not approved
        until an approver approves it.
      </p>
      <form onSubmit={submit}>
        <label className="dts-img__field">
          <span>New image file</span>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
          />
        </label>
        <label>
          <input name="rights" type="checkbox" /> The source, licence and usage rights above still
          apply to this photograph.
        </label>
        {error && (
          <p className="dts-img__error" role="alert">
            {error}
          </p>
        )}
        <div className="dts-img__dialog-actions">
          <button type="button" className="dts-img__btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="dts-img__btn dts-img__btn--primary" disabled={busy}>
            Replace file (save as draft)
          </button>
        </div>
      </form>
    </Dialog>
  );
}
```

- [ ] **Step 4: `focal.tsx`**

```tsx
"use client";

import * as React from "react";
import { FRAME_LABEL, FRAME_RATIO } from "../../images/frames";
import { saveFocalPoint } from "../../images/actions";
import type { SpotCard } from "../../images/types";
import { objectPositionOf } from "../../../lib/focal";
import { Dialog } from "./dialog";
import { useRun } from "./use-run";

export function FocalDialog({
  card,
  siblings,
  open,
  onClose,
}: {
  card: SpotCard;
  /** Every card that uses the same image, including this one, for the previews. */
  siblings: SpotCard[];
  open: boolean;
  onClose: () => void;
}) {
  const image = card.image;
  const { run, busy, error } = useRun();
  const [point, setPoint] = React.useState({ x: image?.focalX ?? 50, y: image?.focalY ?? 50 });
  if (!image) return null;

  function pick(event: React.PointerEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - box.top) / box.height) * 100));
    setPoint({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  function nudge(event: React.KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 10 : 2;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    setPoint((p) => ({
      x: Math.min(100, Math.max(0, p.x + move[0])),
      y: Math.min(100, Math.max(0, p.y + move[1])),
    }));
  }

  const position = objectPositionOf({ focalX: point.x, focalY: point.y });

  return (
    <Dialog open={open} onClose={onClose} title={`Focal point: ${card.title}`}>
      <p>
        Click, or use the arrow keys (hold Shift for bigger steps), on the most important part of
        the picture. Every frame on the site keeps that point in view.
      </p>
      <button
        type="button"
        className="dts-img__focal"
        onPointerDown={pick}
        onKeyDown={nudge}
        aria-label={`Focal point at ${Math.round(point.x)} percent across and ${Math.round(point.y)} percent down`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt="" />
        <span className="dts-img__focal-dot" style={{ left: `${point.x}%`, top: `${point.y}%` }} />
      </button>
      <ul className="dts-img__previews">
        {siblings.flatMap((spot) =>
          (["desktop", "phone"] as const).flatMap((view) => {
            const shape = view === "desktop" ? spot.desktop : spot.phone;
            if (shape === "hidden") return [];
            return [
              <li key={`${spot.id}-${view}`}>
                <div className="dts-img__frame" style={{ aspectRatio: String(FRAME_RATIO[shape]) }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt="" style={{ objectPosition: position }} />
                </div>
                <p className="dts-img__shape">
                  {spot.title}, {view === "desktop" ? "desktop" : "phone"}: {FRAME_LABEL[shape]}
                </p>
              </li>,
            ];
          }),
        )}
      </ul>
      {error && (
        <p className="dts-img__error" role="alert">
          {error}
        </p>
      )}
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          disabled={busy}
          onClick={async () => {
            const r = await run(() => saveFocalPoint(image.id, point.x, point.y));
            if (r.ok) onClose();
          }}
        >
          Save focal point (as draft)
        </button>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 5: `publish.tsx`**

```tsx
"use client";

import * as React from "react";
import { publishImage, publishSpot } from "../../images/actions";
import type { SpotCard } from "../../images/types";
import { Dialog } from "./dialog";
import { useRun } from "./use-run";

const SHOWN = 8;

export function PublishDialog({
  card,
  open,
  onClose,
}: {
  card: SpotCard;
  open: boolean;
  onClose: () => void;
}) {
  const { run, busy, error } = useRun();
  const others = card.otherChanges;
  return (
    <Dialog open={open} onClose={onClose} title={`Publish: ${card.title}`}>
      {card.pending && (
        <p>
          Publishing makes the whole <strong>{card.group}</strong> section live, not just this
          image.
        </p>
      )}
      {card.pending && others.length > 0 && (
        <>
          <p>These other changes in the section are unpublished and will go live too:</p>
          <ul>
            {others.slice(0, SHOWN).map((path) => (
              <li key={path}>{path}</li>
            ))}
          </ul>
          {others.length > SHOWN && <p>…and {others.length - SHOWN} more.</p>}
        </>
      )}
      {card.focalPending && <p>The focal point change for this image will be published as well.</p>}
      {error && (
        <p className="dts-img__error" role="alert">
          {error}
        </p>
      )}
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          disabled={busy}
          onClick={async () => {
            const imageId = card.image?.id;
            let ok = true;
            if (card.pending) ok = (await run(() => publishSpot(card.owner))).ok;
            if (ok && card.focalPending && imageId !== undefined) {
              ok = (await run(() => publishImage(imageId))).ok;
            }
            if (ok) onClose();
          }}
        >
          Publish now
        </button>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 6: `delete.tsx` (unused: one confirmation; in use: warning, then tick-box confirmation)**

```tsx
"use client";

import * as React from "react";
import { deleteImage } from "../../images/actions";
import type { ImageView, UsageView } from "../../images/types";
import { Dialog } from "./dialog";
import { useRun } from "./use-run";

export function DeleteDialog({
  image,
  open,
  onClose,
}: {
  image: ImageView;
  open: boolean;
  onClose: () => void;
}) {
  const { run, busy, error } = useRun();
  const [usages, setUsages] = React.useState<UsageView[] | null>(null);
  const [understood, setUnderstood] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setUsages(null);
      setUnderstood(false);
    }
  }, [open]);

  async function attempt(confirmed: boolean) {
    const result = await run(() => deleteImage(image.id, confirmed));
    if (!result.ok && result.needsConfirmation && result.usages) setUsages(result.usages);
    if (result.ok) onClose();
  }

  const inUse = usages !== null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Delete image: ${image.caption || image.filename}`}
    >
      {!inUse && <p>This permanently deletes the image and its file. It cannot be undone.</p>}
      {inUse && (
        <>
          <p>
            <strong>This image is in use.</strong> It appears here:
          </p>
          <ul>
            {usages.map((u) => (
              <li key={u.spotId}>
                {u.group} → {u.title}: {u.where}
              </li>
            ))}
          </ul>
          <p>
            If you delete it, those spots are left without an image. On the live site the image
            disappears straight away. The pages cannot be published again until you choose a new
            image.
          </p>
          <label>
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
            />{" "}
            I understand these spots will be left without an image
          </label>
        </>
      )}
      {error && (
        <p className="dts-img__error" role="alert">
          {error}
        </p>
      )}
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--danger"
          disabled={busy || (inUse && !understood)}
          onClick={() => attempt(inUse)}
        >
          Delete image
        </button>
      </div>
    </Dialog>
  );
}
```

For an image the page lists as _used_, the card's Delete button opens this dialog the same way; the first `deleteImage(id, false)` call returns the usages, so the warning always comes from the server's own check, never from possibly stale card data.

- [ ] **Step 7: `spot-card.tsx`**

```tsx
"use client";

import * as React from "react";
import { FRAME_LABEL, FRAME_RATIO } from "../../images/frames";
import { cardStatus } from "../../images/cards";
import type { SpotCard } from "../../images/types";
import { objectPositionOf } from "../../../lib/focal";
import { previewUrl } from "../../preview-url";
import { DeleteDialog } from "./delete";
import { FocalDialog } from "./focal";
import { PickerDialog } from "./picker";
import { PublishDialog } from "./publish";
import { ReplaceDialog } from "./replace";

type Which = "change" | "replace" | "focal" | "publish" | "delete" | null;

export function SpotCardView({ card, siblings }: { card: SpotCard; siblings: SpotCard[] }) {
  const [open, setOpen] = React.useState<Which>(null);
  const close = () => setOpen(null);
  const image = card.image;
  const phone =
    card.phone === "hidden" ? "not shown on phones" : `phone: ${FRAME_LABEL[card.phone]}`;

  return (
    <li className="dts-img__card" data-spot={card.id}>
      <div className="dts-img__frame" style={{ aspectRatio: String(FRAME_RATIO[card.desktop]) }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            style={{
              objectPosition: objectPositionOf({ focalX: image.focalX, focalY: image.focalY }),
            }}
          />
        ) : (
          <div className="dts-img__empty">
            No image{card.required ? " — the page shows a placeholder" : ""}
          </div>
        )}
      </div>
      <h3>{card.title}</h3>
      <p className="dts-img__where">{card.where}</p>
      <p className="dts-img__shape">
        Desktop: {FRAME_LABEL[card.desktop]}; {phone}
      </p>
      <ul className="dts-img__status" aria-label="Status">
        {cardStatus(card).map((status) => (
          <li key={status.text} data-tone={status.tone}>
            {status.text}
          </li>
        ))}
      </ul>
      <div className="dts-img__actions">
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          onClick={() => setOpen("change")}
        >
          Change image
        </button>
        {image && (
          <button type="button" className="dts-img__btn" onClick={() => setOpen("replace")}>
            Replace file
          </button>
        )}
        {image && (
          <button type="button" className="dts-img__btn" onClick={() => setOpen("focal")}>
            Set focal point
          </button>
        )}
        {(card.pending || card.focalPending) && card.pagePath && (
          <a
            className="dts-img__btn"
            href={previewUrl(card.pagePath)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview<span className="dts-sr-only"> {card.title} (opens in a new tab)</span>
          </a>
        )}
        {(card.pending || card.focalPending) && (
          <button
            type="button"
            className="dts-img__btn dts-img__btn--primary"
            onClick={() => setOpen("publish")}
          >
            Publish
          </button>
        )}
        <a className="dts-img__btn" href={card.adminHref}>
          Open section
        </a>
        {image && (
          <button
            type="button"
            className="dts-img__btn dts-img__btn--danger"
            onClick={() => setOpen("delete")}
          >
            Delete image
          </button>
        )}
      </div>
      <PickerDialog card={card} open={open === "change"} onClose={close} />
      <ReplaceDialog card={card} open={open === "replace"} onClose={close} />
      <FocalDialog card={card} siblings={siblings} open={open === "focal"} onClose={close} />
      <PublishDialog card={card} open={open === "publish"} onClose={close} />
      {image && <DeleteDialog image={image} open={open === "delete"} onClose={close} />}
    </li>
  );
}
```

- [ ] **Step 8: `images-client.tsx` (tabs, search, filters, groups, unused list)**

Replace the stub:

```tsx
"use client";

import * as React from "react";
import { needsAttention } from "../../images/cards";
import type { ImagesPageData, SpotCard } from "../../images/types";
import { DeleteDialog } from "./delete";
import { SpotCardView } from "./spot-card";

function matches(card: SpotCard, query: string): boolean {
  if (!query) return true;
  const haystack = [card.group, card.title, card.where, card.image?.caption, card.image?.filename]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function ImagesClient({ data }: { data: ImagesPageData }) {
  const [tab, setTab] = React.useState<"used" | "unused">("used");
  const [query, setQuery] = React.useState("");
  const [attentionOnly, setAttentionOnly] = React.useState(false);
  const [pageFilter, setPageFilter] = React.useState("");
  const [deleting, setDeleting] = React.useState<number | null>(null);

  const pageNames = [...new Set(data.cards.map((card) => card.group))];
  const visible = data.cards.filter(
    (card) =>
      matches(card, query) &&
      (!attentionOnly || needsAttention(card)) &&
      (pageFilter === "" || card.group === pageFilter),
  );
  const groups = new Map<string, { path: string | null; cards: SpotCard[] }>();
  for (const card of visible) {
    const entry = groups.get(card.group) ?? { path: card.groupPath, cards: [] };
    entry.cards.push(card);
    groups.set(card.group, entry);
  }
  const attention = data.cards.filter(needsAttention).length;

  return (
    <>
      <div role="tablist" aria-label="Images" className="dts-img__tabs">
        <button
          role="tab"
          type="button"
          className="dts-img__tab"
          aria-selected={tab === "used"}
          onClick={() => setTab("used")}
        >
          Used on the website ({data.cards.length})
        </button>
        <button
          role="tab"
          type="button"
          className="dts-img__tab"
          aria-selected={tab === "unused"}
          onClick={() => setTab("unused")}
        >
          Unused images ({data.unused.length})
        </button>
      </div>

      {tab === "used" && (
        <>
          <div className="dts-img__toolbar">
            <label>
              <span className="dts-sr-only">Search images</span>
              <input
                type="search"
                placeholder="Search by page, spot or caption"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              <span className="dts-sr-only">Show one page only</span>
              <select value={pageFilter} onChange={(e) => setPageFilter(e.target.value)}>
                <option value="">All pages</option>
                {pageNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={attentionOnly}
                onChange={(e) => setAttentionOnly(e.target.checked)}
              />{" "}
              Needs attention ({attention})
            </label>
          </div>
          {[...groups.entries()].map(([name, group]) => (
            <section key={name} className="dts-img__group" aria-labelledby={`g-${name}`}>
              <div className="dts-img__group-head">
                <h2 id={`g-${name}`}>{name}</h2>
                {group.path && (
                  <a href={group.path} target="_blank" rel="noopener noreferrer">
                    View page<span className="dts-sr-only"> {name} (opens in a new tab)</span>
                  </a>
                )}
              </div>
              <ul className="dts-img__grid">
                {group.cards.map((card) => (
                  <SpotCardView
                    key={card.id}
                    card={card}
                    siblings={
                      card.image
                        ? data.cards.filter((other) => other.image?.id === card.image?.id)
                        : [card]
                    }
                  />
                ))}
              </ul>
            </section>
          ))}
          {visible.length === 0 && <p>No image spots match.</p>}
          <p className="dts-img__where">
            Some graphics are drawn in code and cannot be changed here: the dotted power plant on
            Home, the Perth globe, the dotted numbers and the dotted bar.
          </p>
        </>
      )}

      {tab === "unused" && (
        <ul className="dts-img__grid">
          {data.unused.map(({ image }) => (
            <li key={image.id} className="dts-img__card">
              <div className="dts-img__frame" style={{ aspectRatio: "3 / 2" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} />
              </div>
              <h3>{image.caption || image.filename}</h3>
              <p className="dts-img__where">{image.filename}</p>
              <ul className="dts-img__status">
                <li data-tone={image.approved ? "ok" : "warn"}>
                  {image.approved
                    ? "Approved for public use"
                    : "Not approved — hidden on the live site"}
                </li>
              </ul>
              <div className="dts-img__actions">
                <button
                  type="button"
                  className="dts-img__btn dts-img__btn--danger"
                  onClick={() => setDeleting(image.id)}
                >
                  Delete image
                </button>
              </div>
              <DeleteDialog
                image={image}
                open={deleting === image.id}
                onClose={() => setDeleting(null)}
              />
            </li>
          ))}
          {data.unused.length === 0 && <li>Every image in the library is in use.</li>}
        </ul>
      )}
    </>
  );
}
```

- [ ] **Step 9: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0. Fix any `no-non-null-assertion` hits as described in Step 5.

- [ ] **Step 10: Commit**

```bash
git add src/cms/views src/app/(payload)
git commit -m "feat(cms): Images page cards, picker, replace, focal point, publish and delete

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Admin end-to-end tests

**Files:**

- Create: `tests/cms/images.spec.ts`
- Modify: `scripts/cms/prepare-test-db.ts` (add `IMAGES_FILE` and an account), `tests/cms/global-setup.ts` (re-export it)

**Interfaces:**

- Consumes: the running CMS build (`CMS_E2E_BUILD=cms`), accounts from `prepare-test-db`.

Run the suite with `pnpm cms:test` (it builds, prepares the **test** database and runs Playwright). Close other apps first.

- [ ] **Step 1: Add a dedicated test account**

In `scripts/cms/prepare-test-db.ts` add next to the other exports:

```ts
export const IMAGES_FILE = path.join(TEST_DATA_DIR, "cms-images.json");
```

and to the `accounts` array: `[IMAGES_FILE, "images@example.com", "Test Images", "editor,approver"],`. In `tests/cms/global-setup.ts` add `IMAGES_FILE,` to the re-export list.

- [ ] **Step 2: Write the tests**

`tests/cms/images.spec.ts`:

```ts
import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import { IMAGES_FILE } from "./global-setup";
import { fullLogin, readAccount, requireTestDatabase } from "./helpers";

/*
 * "Images on the website" (docs/superpowers/specs/2026-10-05-cms-images-page-design.md):
 * the page lists every spot, a change is a draft until published, other unpublished edits are
 * named before publishing, an image in use needs a second confirmation to delete and leaves an
 * empty spot, the Media section refuses to delete an image in use, and a bad upload saves nothing.
 * Test database only; fixtures are fictional.
 */
test.describe.configure({ mode: "serial" });
requireTestDatabase();
test.skip(
  process.env["CMS_E2E_BUILD"] !== "cms",
  "Needs a CONTENT_SOURCE=cms build (scripts/cms/test-cms.ts)",
);

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

async function adminPage(browser: Browser, request: APIRequestContext) {
  const context = await browser.newContext({ storageState: await request.storageState() });
  return { context, page: await context.newPage() };
}

async function uploadImage(request: APIRequestContext, caption: string): Promise<number> {
  const res = await request.post("/api/media", {
    multipart: {
      file: { name: "test.png", mimeType: "image/png", buffer: PNG },
      _payload: JSON.stringify({
        kind: "image",
        assetClass: "photograph",
        alt: "Test",
        caption,
        source: "Test",
        licence: "Test",
        usageRights: "Test",
        _status: "published",
      }),
    },
  });
  expect(res.status()).toBe(201);
  return ((await res.json()) as { doc: { id: number } }).doc.id;
}

test("the page lists every image spot, with where it appears", async ({ request, browser }) => {
  await fullLogin(request, readAccount(IMAGES_FILE));
  const { context, page } = await adminPage(browser, request);
  await page.goto("/admin/images");
  await expect(
    page.getByRole("heading", { name: "Images on the website", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Home", level: 2 })).toBeVisible();
  await expect(
    page.getByText("Home page, Why DeepTsight section, beside the three pillars"),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Share images", level: 2 })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Unused images/ })).toBeVisible();
  await context.close();
});

test("anonymous and password-only visitors see nothing", async ({ page, request, browser }) => {
  await page.goto("/admin/images");
  await expect(page.getByText("Images on the website")).toHaveCount(0);
  await request.post("/api/users/login", {
    data: { email: readAccount(IMAGES_FILE).email, password: readAccount(IMAGES_FILE).password },
  });
  const second = await browser.newContext({ storageState: await request.storageState() });
  const p = await second.newPage();
  await p.goto("/admin/images");
  await expect(p.getByText("Every image the website shows")).toHaveCount(0);
  await second.close();
});

test("a change is a draft until published, and other unpublished edits are named", async ({
  request,
  browser,
}) => {
  await fullLogin(request, readAccount(IMAGES_FILE));
  const newId = await uploadImage(request, "Images test change");
  // Make another unpublished edit in the same section (Home) so the publish warning has something to name.
  const home = (await (await request.get("/api/globals/home?draft=true&depth=0")).json()) as Record<
    string,
    unknown
  >;
  const hero = { ...(home["hero"] as Record<string, unknown>), headline: "Images test headline" };
  expect(
    (await request.post("/api/globals/home?draft=true", { data: { ...home, hero } })).status(),
  ).toBe(200);

  const { context, page } = await adminPage(browser, request);
  await page.goto("/admin/images");
  const card = page.locator('[data-spot="home:media.why"]');
  await card.getByRole("button", { name: "Change image" }).click();
  await page.getByRole("button", { name: /Images test change/ }).click();
  await page.getByRole("button", { name: /Use this image/ }).click();
  await expect(card.getByText("Draft change waiting")).toBeVisible();

  // The live page still shows the old image.
  const live = await request.get("/");
  expect(await live.text()).not.toContain(`media-${newId}`);

  await card.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText(/other changes in the section are unpublished/i)).toBeVisible();
  await expect(page.getByText("hero.headline")).toBeVisible();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(card.getByText("Draft change waiting")).toHaveCount(0);
  await context.close();
});

test("an unused image is deleted after one confirmation", async ({ request, browser }) => {
  await fullLogin(request, readAccount(IMAGES_FILE));
  await uploadImage(request, "Images test unused");
  const { context, page } = await adminPage(browser, request);
  await page.goto("/admin/images");
  await page.getByRole("tab", { name: /Unused images/ }).click();
  const card = page.locator("li", { hasText: "Images test unused" }).first();
  await card.getByRole("button", { name: "Delete image" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete image" }).click();
  await expect(page.getByText("Images test unused")).toHaveCount(0);
  await context.close();
});

test("an image in use needs a second confirmation, and Media refuses to delete it", async ({
  request,
  browser,
}) => {
  await fullLogin(request, readAccount(IMAGES_FILE));
  const id = await uploadImage(request, "Images test in use");
  // Put it in the Contact page image spot as a draft, via the page's own flow.
  const { context, page } = await adminPage(browser, request);
  await page.goto("/admin/images");
  const card = page.locator('[data-spot="pages:contact.figure"]');
  await card.getByRole("button", { name: "Change image" }).click();
  await page.getByRole("button", { name: /Images test in use/ }).click();
  await page.getByRole("button", { name: /Use this image/ }).click();
  await expect(card.getByText("Draft change waiting")).toBeVisible();

  // The Media section's own delete is refused and points to the Images page.
  const refused = await request.delete(`/api/media/${id}`);
  expect(refused.status()).toBe(409);
  expect(await refused.text()).toContain("Images on the website");

  // The Images page asks twice.
  await card.getByRole("button", { name: "Delete image" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("This image is in use.")).toBeVisible();
  await expect(dialog.getByText(/Contact page/)).toBeVisible();
  const confirm = dialog.getByRole("button", { name: "Delete image" });
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel(/I understand these spots will be left without an image/).check();
  await confirm.click();
  await expect(card.getByText(/No image — the page shows a placeholder/)).toBeVisible();

  // An empty required spot cannot be published (Payload's own required-field check).
  const contact = (await (
    await request.get("/api/globals/pages?draft=true&depth=0")
  ).json()) as Record<string, unknown>;
  const publish = await request.post("/api/globals/pages", {
    data: { ...contact, _status: "published" },
  });
  expect(publish.status()).toBeGreaterThanOrEqual(400);
  await context.close();
});

test("a file that is not an image saves nothing", async ({ request }) => {
  await fullLogin(request, readAccount(IMAGES_FILE));
  const before = (await (await request.get("/api/media?limit=1&depth=0")).json()) as {
    totalDocs: number;
  };
  const res = await request.post("/api/media", {
    multipart: {
      file: { name: "note.txt", mimeType: "text/plain", buffer: Buffer.from("not an image") },
      _payload: JSON.stringify({
        kind: "image",
        assetClass: "photograph",
        alt: "x",
        caption: "x",
        source: "x",
        licence: "x",
        usageRights: "x",
        _status: "published",
      }),
    },
  });
  expect(res.status()).toBeGreaterThanOrEqual(400);
  const after = (await (await request.get("/api/media?limit=1&depth=0")).json()) as {
    totalDocs: number;
  };
  expect(after.totalDocs).toBe(before.totalDocs);
});
```

- [ ] **Step 3: Run the suite**

Run: `pnpm cms:test`
Expected: the build succeeds, the test database is reset/migrated/imported, and every CMS spec passes, including the six new tests. If a selector fails, open the failure's screenshot/trace and adjust the test's selector to the real accessible name (not the implementation).

- [ ] **Step 4: Run parity and the public checks**

Run: `pnpm cms:parity && pnpm test:a11y`
Expected: parity reports no differences (focal null produces identical output); axe reports 0 violations on all routes.

- [ ] **Step 5: Commit**

```bash
git add tests/cms/images.spec.ts tests/cms/global-setup.ts scripts/cms/prepare-test-db.ts
git commit -m "test(cms): Images page end-to-end tests

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Docs, visual check and handover

**Files:**

- Modify: `docs/cms/04_DECISIONS_DEFAULTS.md`, `docs/cms/PROGRESS.md`, `TASKS.md`, `docs/PROJECT_CONTEXT_FOR_CMS.md`, `CLAUDE.md` §10 (one line)

- [ ] **Step 1: Record the decisions**

Append to `docs/cms/04_DECISIONS_DEFAULTS.md` (use the next free `D-` numbers; read the file's last entry first and continue its numbering):

```markdown
- **D-xx** Images on the website (2026-10-05): one admin page lists every image spot (registry in
  `src/cms/images/spots.ts`, completeness test). Changes are drafts on the owning section; Publish names
  other unpublished edits. Replace file creates a new media record and re-points spots (Payload keeps a
  file with its document). Focal point is stored on the media record and used by the site. Deleting an
  image in use needs two confirmations (Media's own delete is refused, `src/cms/images/in-use.ts`); the
  field becomes empty (`ON DELETE set null`): placeholder in the admin and previews, left out on the live
  site. Reversal: remove the `images` view from `payload.config.ts` and the `beforeDelete` hook.
- **D-xx** Share images are used for Open Graph and Twitter previews only when approved (`shareImageSrc`).
```

Add a short entry to `TASKS.md` decisions log (dated 2026-10-05) and a line in `docs/cms/PROGRESS.md`. In `docs/PROJECT_CONTEXT_FOR_CMS.md` add "Images on the website" to the CMS capabilities list. In `CLAUDE.md` §10 add one bullet: "**Images page.** New image fields go in the spot registry (`src/cms/images/spots.ts`); the completeness test fails otherwise."

- [ ] **Step 2: Typecheck, lint, unit tests, a11y**

Run: `pnpm typecheck && pnpm lint && pnpm test:cms-unit`
Expected: all exit 0 / pass.

- [ ] **Step 3: Production build**

Close other apps (the machine needs ~1 GB free). Run: `pnpm build`
Expected: succeeds; every public route is still static.

- [ ] **Step 4: Visual check with screenshots**

Start the CMS dev server against the dev database (`pnpm dev:cms`), sign in, and capture `/admin/images` at 1280 px and 768 px (use the `admin-shots` script in `scripts/cms/admin-shots.ts` if it fits, otherwise Playwright's `page.screenshot`). Check: group headings and spot cards read clearly, thumbnails use the real frame shapes, status is in words, the focal dialog previews, dialogs trap focus, and Escape closes them. Fix any visual problem in `admin-theme.css` and rerun Step 2.

- [ ] **Step 5: Commit and report**

```bash
git add docs TASKS.md CLAUDE.md
git commit -m "docs: record the Images page decisions

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

Report to the owner: what was built, the checks run and their results, anything not verified (for example, a manual screen-reader pass), and the two follow-ups: approvers must approve new images in Media before they go live, and the code-drawn graphics remain code-only.
