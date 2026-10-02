/**
 * Drops and recreates the `public` schema of a test or restore database.
 *
 *   tsx scripts/cms/reset-db.ts DATABASE_URI_TEST
 *
 * Refuses unless the database name ends in _test or _restore (D-15). Never touches the dev database.
 */
import fs from "node:fs";
import path from "node:path";
import { assertDisposable, connectionString, parseDbEnvName, redact, runPg } from "./lib/db";
import { mediaDirFor } from "../../src/cms/collections/media";

export function resetDatabase(envName: string): void {
  const db = parseDbEnvName(envName);
  const dbName = assertDisposable(db);
  const result = runPg(
    "psql",
    [
      "--no-psqlrc",
      "--quiet",
      "--set=ON_ERROR_STOP=1",
      "--command=DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;",
    ],
    db,
  );
  if (result.status !== 0) {
    throw new Error(`Reset of ${dbName} failed: ${redact(result.stderr ?? "").trim()}`);
  }
  // Uploaded files belong to the database: leftovers would make new uploads get a "-1" suffix.
  // Only ever inside this project's .data/media, even if MEDIA_DIR points somewhere else.
  const mediaDir = mediaDirFor(connectionString(db));
  const allowedRoot = path.resolve(process.cwd(), ".data", "media") + path.sep;
  if (mediaDir.startsWith(allowedRoot)) fs.rmSync(mediaDir, { recursive: true, force: true });
  console.log(
    `Reset schema public${mediaDir.startsWith(allowedRoot) ? " and media files" : ""} of ${dbName}.`,
  );
}

if (process.argv[1]?.endsWith("reset-db.ts")) {
  try {
    resetDatabase(process.argv[2] ?? "");
  } catch (error) {
    console.error(redact(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
