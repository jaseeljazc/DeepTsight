/**
 * Restores a backup made by backup.ts into a test or restore database.
 *
 *   tsx scripts/cms/restore.ts --from .data/backups/<file>.dump --db DATABASE_URI_RESTORE
 *
 * Refuses unless the target database name ends in _test or _restore (D-15). Restoring the dev or
 * production database is a manual owner action (docs/MAINTENANCE_PLAN.md), never automated here.
 * Resets the schema, then runs pg_restore --no-owner --exit-on-error. The media copy saved beside
 * the dump (if any) replaces the target database's media folder.
 */
import fs from "node:fs";
import path from "node:path";
import {
  argValue,
  assertDisposable,
  connectionString,
  parseDbEnvName,
  redact,
  runPg,
} from "./lib/db";
import { resetDatabase } from "./reset-db";
import { mediaDirFor } from "../../src/cms/collections/media";

function main(): void {
  const db = parseDbEnvName(argValue("--db"));
  const dbName = assertDisposable(db);
  const from = argValue("--from");
  if (!from) throw new Error("--from <backup file> is required.");
  const dump = path.resolve(from);
  if (!fs.existsSync(dump))
    throw new Error(`Backup file not found: ${path.relative(process.cwd(), dump)}`);

  resetDatabase(db);
  const result = runPg("pg_restore", ["--no-owner", "--exit-on-error", dump], db);
  if (result.status !== 0) {
    throw new Error(
      `pg_restore failed (exit ${result.status ?? "signal"}): ${redact(result.stderr ?? "").trim()}`,
    );
  }

  const mediaCopy = dump.replace(/\.dump$/, "-media");
  let mediaNote = "no media copy beside the backup";
  if (fs.existsSync(mediaCopy)) {
    const target = mediaDirFor(connectionString(db));
    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(mediaCopy, target, { recursive: true });
    mediaNote = `media restored to ${path.relative(process.cwd(), target)}`;
  }
  console.log(`Restored ${path.basename(dump)} into ${dbName}; ${mediaNote}.`);
}

try {
  main();
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
