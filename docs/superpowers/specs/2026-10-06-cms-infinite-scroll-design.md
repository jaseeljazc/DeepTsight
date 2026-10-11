# CMS admin lists: infinite scroll — design

Date: 2026-10-06. Status: design approved in conversation, awaiting review of this written spec.

## 1. Purpose

Every list in the CMS admin (articles, credentials, credential groups, enquiries, enquiry types, legal
pages, media, proof items, services, users, audit log) pages with numbered buttons. The owner wants the
lists to keep loading as the editor scrolls, so the numbered page buttons are no longer the way to move
through a list.

Success means: on any admin list, scrolling to the bottom loads more rows without losing search, filters,
sort, columns, selection or the scroll position; a keyboard or screen-reader user can do the same with a
button; nothing about who can read what changes.

### Owner decisions (conversation, 2026-10-06)

| #   | Decision                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------- |
| D1  | Auto-load on scroll, keeping Payload's own list views (not rebuilt lists, not a "Load more"-only button).              |
| D2  | Applies to every admin list table, including the audit log. A shared helper means a new collection gets it by default. |

## 2. Findings in Payload 3.90.2 (read from the installed code)

- There is no built-in infinite scroll for list views. The list view paginates with `PageControls`.
- `collection.admin.components.afterListTable` is a supported slot, rendered inside the list view just
  above `PageControls`.
- The list state is `useListQuery()` from `@payloadcms/ui`. Its `data` is a `PaginatedDocs`
  (`docs`, `totalDocs`, `limit`, `hasNextPage`, …). `handlePerPageChange(limit)` sets `limit` and
  `page = 1` and re-renders the list on the server, so cells, selection, search, filters and sort stay
  Payload's own.
- `PageControls` holds three things we care about: the numbered `Pagination`, the page-info text and the
  per-page `PerPage` select, and (on small screens) the bulk-selection actions via `AfterPageControls`.
  The bulk-selection actions must stay visible.
- Whether the server accepts a `limit` above the dropdown's listed options is not confirmed from the
  source. It is checked first (section 6, step 1).

## 3. Design

### 3.1 Behaviour

- A client component `InfiniteScroll` renders below the table (slot `afterListTable`).
- When its sentinel (a zero-height element below the last row) comes within one screen of the viewport and
  `data.hasNextPage` is true, it calls `handlePerPageChange(nextLimit)`.
- `nextLimit` is the current limit doubled, starting from the collection's default limit, up to a cap
  (`MAX_ROWS`, 500). Past the cap, `nextLimit` grows by 500 per request. The row count never shrinks while
  the user stays on the list (a search or filter change resets Payload's own limit; the component then
  starts again from the default).
- Only one request is in flight. While loading, the sentinel is disabled and the status says so.
- Scroll position is kept: Payload re-renders the same route; the component does not scroll.

### 3.2 What the editor sees

- The numbered page buttons, the page-info text and the per-page select are hidden. The bulk-selection
  actions stay.
- Below the table: a status line "Showing 50 of 214" (live region, polite) and a **Load more** button.
  The button is a real `<button>`, always present while rows remain, reachable by keyboard, minimum 44 px,
  with the project's visible focus ring. The scroll trigger is a convenience on top of it, not the only way.
- When every row is shown: "Showing all 214". No button.
- When the list is empty, nothing is rendered (Payload's own empty state shows).
- `prefers-reduced-motion`: no motion exists in this component; nothing to change.

### 3.3 Where it is registered

- A helper `withInfiniteScroll(collection)` in `src/cms/lists/` adds
  `"/cms/lists/infinite-scroll#InfiniteScroll"` to `admin.components.afterListTable`, preserving any existing
  entries, and is applied to every collection in `src/payload.config.ts`. The import map is regenerated.
- A test walks the Payload config and fails if any collection (other than ones explicitly listed as
  excluded, none at the start) lacks the component, so a new collection cannot ship without it.
- Styles go in `src/app/(payload)/admin-theme.css` (`.dts-infinite-*`), following the admin theme rules
  already enforced by `tests/cms/unit/admin-theme.test.ts` (no shadows, radius at most 16 px, contrast,
  44 px targets).
- The Images page "Unused images" tab (already a client list) is out of scope unless it has more rows than
  one page; checked at planning, added only if needed.

### 3.4 Pure logic

`src/cms/lists/limits.ts` (no React, no Payload imports): `nextLimit(current, defaultLimit, total)`,
`statusText(shown, total)`. Unit-tested.

## 4. Safety and security

- No new data path: list data still comes through Payload's list view and its access control. Nothing is
  fetched outside Payload; no new API route, no new dependency.
- Admin access (`isAdmin`: signed in plus valid MFA cookie) is unchanged.
- The cap bounds how many rows one request asks for from the browser. The limit is a URL/query value, so the
  server must be shown to cope with a hand-edited huge `limit` (section 6, step 1); if it does not clamp,
  a small server-side clamp is added at that point.
- The audit log can grow without limit; the cap and the "Load more" step keep one render bounded.

## 5. Accessibility (WCAG 2.2 AA)

- Native `<button>` for Load more; status in a `role="status"` region; focus is never moved by a load.
- New rows are announced by the status text ("Showing 100 of 214"), not by moving focus.
- The infinite behaviour has a non-scroll equivalent (the button), so keyboard-only and screen-reader users
  are not blocked, and the page footer stays reachable.
- axe: zero violations on a list route; checked manually at 360, 768 and 1280 px and 200 % zoom.

## 6. Testing and verification

1. **Spike first (before building):** against the test database, confirm Payload renders a list with
   `?limit=<n>` for n above the dropdown options (for example 150 and 600), that `handlePerPageChange`
   keeps scroll, search and sort, and what a huge value (for example 1,000,000) does. Record the result in
   the plan; adjust the cap or add a clamp if needed.
2. Unit tests: `nextLimit` (doubling, cap, chunking past the cap, never below default, never above total),
   `statusText`, and the "every collection registers the component" config test.
3. Playwright (`tests/cms`, test database only): seed more than one page of rows in one collection; scroll
   and see rows append and the status update; **Load more** works by keyboard; search, filter and sort
   still work while rows are appended; bulk select still works on appended rows; page buttons are hidden;
   a collection with few rows shows "Showing all".
4. Existing gates: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:a11y`, `pnpm cms:test`,
   `pnpm cms:parity`. Builds need other apps closed (low memory on this machine).
5. Screenshots of a list at 1280 and 768 px.

## 7. Out of scope

Rebuilt list views; virtualised (windowed) rows; infinite scroll on the public site; changing which columns
or filters exist; the Images page cards; relationship pickers inside forms (Payload's own).

## 8. Risks

- `handlePerPageChange` re-renders the whole list for every step; fine up to the cap, and doubling keeps
  the number of requests small. If a table ever holds many thousands of rows, the cap protects the page.
- Hiding Payload's pagination uses its CSS class names (`paginator`, `page-controls__page-info`,
  `per-page`). They are read from 3.90.2 and pinned by a test that fails if they disappear after an
  upgrade, so a Payload update cannot silently bring the buttons back.
- Payload's own list state may reset the limit when the user changes search, filter or sort; the component
  must read the limit from `useListQuery()` each time rather than keep its own copy.
