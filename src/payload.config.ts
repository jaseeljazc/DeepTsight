import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { publicEnv } from "./lib/public-env";
import { Users } from "./cms/collections/users";

/*
 * Payload CMS configuration (Phase 2 CMS, docs/cms/01_BUILD_PLAN.md).
 * Secrets come from the environment only; src/lib/env-rules.ts validates them and errors name
 * variables, never values. Nothing here connects to the database until Payload initialises.
 */

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/** The only origin allowed to make credentialed requests to the admin and API. */
const origin = publicEnv.siteUrl;

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
    // No Gravatar: the admin makes no external requests.
    avatar: "default",
    importMap: {
      baseDir: dirname,
    },
  },
  collections: [Users],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env["DATABASE_URI"] ?? "",
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
