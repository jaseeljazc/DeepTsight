# Content Editing Guide (Phase 1)

This guide explains how to update the content for the DeepTsight Consulting website before the CMS is installed in Phase 10.

## 1. Where the Content Lives

All website content is strictly typed and separated from the UI components. It lives in the `src/content/source/` directory.

- **`site.ts`**: Global site settings (Company Name, ABN, Social Links, Email, Phone, Navigation).
- **`home.ts`**: Homepage hero copy, trust strip metrics, capability summaries.
- **`about.ts`**: About page story, founding principles, core capabilities.
- **`services.ts`**: The 4 core service pillars (Control Systems, OT Cybersecurity, IT/OT Segregation, Plant Reliability). Each service has a structured layout with problem statements, solutions, delivery approaches, and evidence.
- **`credentials.ts`**: Client past performance and credential groups.
- **`legal/`**: Privacy Policy, Terms of Use, Accessibility Statement.
- **`seo.ts`**: Meta titles and descriptions for every page.

## 2. Managing Placeholders

During development, any missing content was marked with a `[PLACEHOLDER]` tag.

**Important:** The production build will **FAIL** if any `[PLACEHOLDER]`, `TBD — CLIENT`, or `TODO(CLIENT)` strings are left in the codebase. This is a strict safety mechanism to prevent unapproved dummy text from going live.

### How to verify placeholders:

You can run the placeholder verification script locally to see what is missing:

```bash
pnpm check:content
```

This script will output the exact file and line number where placeholders still exist.

## 3. How to Update Content

If you need to update content, you will edit the TypeScript files directly.

1. Open the relevant file in `src/content/source/`.
2. Locate the text you wish to change.
3. Replace the string. If replacing a placeholder, make sure you completely remove the `[PLACEHOLDER]` prefix.
4. Save the file.

Because the content is strictly typed via Zod schemas, if you accidentally delete a required field, the development server and build process will immediately alert you with an error.

## 4. Phase 2: CMS Migration

In Phase 10, a headless CMS (Payload) will be deployed. At that point, this manual file-editing process will be replaced by a visual, web-based admin panel accessible at `/admin`. The migration is designed to be seamless; the UI components will remain unchanged, and the data source will simply swap from these static files to the CMS API.
