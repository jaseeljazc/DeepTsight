/**
 * Drops and recreates the `public` schema of a test or restore database.
 *
 *   tsx scripts/cms/reset-db.ts DATABASE_URI_TEST
 *
 * Refuses unless the database name ends in _test or _restore (D-15). Never touches the dev database.
 */
import { assertDisposable, parseDbEnvName, redact, runPg } from "./lib/db";

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
  console.log(`Reset schema public in ${dbName}.`);
}

if (process.argv[1]?.endsWith("reset-db.ts")) {
  try {
    resetDatabase(process.argv[2] ?? "");
  } catch (error) {
    console.error(redact(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
