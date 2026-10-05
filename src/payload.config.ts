import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { publicEnv } from "./lib/public-env";
import { ArticleCategories, Articles } from "./cms/collections/articles";
import { AuditLog } from "./cms/collections/audit-log";
import { CredentialGroups, Credentials } from "./cms/collections/credentials";
import { Enquiries } from "./cms/collections/enquiries";
import { EnquiryTypes } from "./cms/collections/enquiry-types";
import { LegalPages } from "./cms/collections/legal-pages";
import { Media } from "./cms/collections/media";
import { ProofItems } from "./cms/collections/proof-items";
import { Services } from "./cms/collections/services";
import { About, Home, Pages, Seo, SiteSettings } from "./cms/globals";
import { Users } from "./cms/collections/users";
import { noEmailAdapter } from "./cms/lib/no-email";

/*
 * Payload CMS configuration (Phase 2 CMS, docs/cms/01_BUILD_PLAN.md).
 * Secrets come from the environment only; src/lib/env-rules.ts validates them and errors name
 * variables, never values. Nothing here connects to the database until Payload initialises.
 */

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/** The only origin allowed to make credentialed requests to the admin and API. */
const origin = publicEnv.siteUrl;

/**
 * The CMS connection string. An empty value makes `pg` fall back to defaults and fail with a
 * confusing SASL password error, so a missing DATABASE_URI is reported by name instead. Builds
 * (which never open the database) and the offline `payload` commands are not blocked.
 */
function databaseUri(): string {
  const uri = process.env["DATABASE_URI"]?.trim() ?? "";
  if (uri === "" && process.env["NEXT_PHASE"] !== "phase-production-build") {
    throw new Error(
      "DATABASE_URI is not set. Add it to .env.local (see .env.example), then restart the server.",
    );
  }
  return uri;
}

export default buildConfig({
  secret: process.env["PAYLOAD_SECRET"] ?? "",
  serverURL: origin,
  csrf: [origin],
  cors: [origin],
  // No anonymous usage data leaves this machine.
  telemetry: false,
  // GraphQL is off and has no route files (docs/cms/03_SECURITY_AND_OPS.md §1).
  graphQL: { disable: true },
  admin: {
    user: Users.slug,
    // Light only: Payload otherwise follows the visitor's system setting (and showed dark).
    theme: "light",
    // No Gravatar: the admin makes no external requests. Initials, name and role instead.
    avatar: { Component: "/cms/header/account-avatar#AccountAvatar" },
    importMap: {
      baseDir: dirname,
    },
    meta: {
      titleSuffix: " | DeepTsight CMS",
      robots: "noindex, nofollow",
    },
    routes: {
      // Signed-in users without a verified second factor are sent here (03 §3).
      unauthorized: "/mfa",
    },
    components: {
      // Sidebar and top bar (src/cms/nav, src/cms/header); styled in admin-theme.css.
      Nav: "/cms/nav/admin-nav#AdminNav",
      // Click any image to see it large (src/cms/media/image-preview.tsx).
      providers: ["/cms/media/image-preview#ImagePreviewProvider"],
      actions: [
        "/cms/header/header-actions#BackAction",
        "/cms/header/header-actions#SearchAction",
        "/cms/header/header-actions#InboxBell",
      ],
      // Typeset wordmark until the approved logo arrives (src/cms/graphics/logo.tsx).
      graphics: {
        Logo: "/cms/graphics/logo#Logo",
        Icon: "/cms/graphics/logo#Icon",
      },
      views: {
        dashboard: {
          Component: "/cms/views/dashboard#DashboardView",
        },
        images: {
          Component: "/cms/views/images#ImagesView",
          path: "/images",
        },
        unauthorized: {
          Component: "/cms/views/mfa-view#MfaView",
          path: "/mfa",
        },
      },
    },
  },
  collections: [
    Services,
    ProofItems,
    Credentials,
    CredentialGroups,
    Media,
    Articles,
    ArticleCategories,
    LegalPages,
    Enquiries,
    EnquiryTypes,
    Users,
    AuditLog,
  ],
  globals: [SiteSettings, Home, About, Pages, Seo],
  // Uploads: 10 MB at most (03 §8).
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  editor: lexicalEditor(),
  email: noEmailAdapter,
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri(),
      // `next build` runs several workers, each with its own pool.
      max: 5,
    },
    // Every schema change is a committed migration (D-04).
    push: false,
    migrationDir: path.resolve(dirname, "cms", "migrations"),
    // The app role cannot create databases, and must never try.
    disableCreateDatabase: true,
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "cms", "payload-types.ts"),
  },
});
