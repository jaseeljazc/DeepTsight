/**
 * Backs up one CMS database with pg_dump (custom format, no owner) to
 * .data/backups/<dbname>-YYYYMMDD-HHMMSS.dump, plus a copy of the media directory beside it.
 *
 *   tsx scripts/cms/backup.ts --db DATABASE_URI
 *
 * Development backups live on this machine only. Production also needs an off-machine copy
 * (docs/MAINTENANCE_PLAN.md).
 */
import fs from "node:fs";
import path from "node:path";
import { argValue, databaseName, parseDbEnvName, redact, runPg, timestamp } from "./lib/db";

const BACKUP_DIR = path.join(process.cwd(), ".data", "backups");
const MEDIA_DIR = path.join(process.cwd(), ".data", "media");

function main(): void {
  const db = parseDbEnvName(argValue("--db") ?? "DATABASE_URI");
  const name = databaseName(db);
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const base = `${name}-${timestamp()}`;
  const file = path.join(BACKUP_DIR, `${base}.dump`);

  const result = runPg("pg_dump", ["--format=custom", "--no-owner", `--file=${file}`], db);
  if (result.status !== 0) {
    fs.rmSync(file, { force: true });
    console.error(
      `pg_dump failed (exit ${result.status ?? "signal"}): ${redact(result.stderr ?? "").trim()}`,
    );
    process.exit(1);
  }

  let mediaNote = "no media directory";
  if (fs.existsSync(MEDIA_DIR)) {
    const mediaCopy = path.join(BACKUP_DIR, `${base}-media`);
    fs.cpSync(MEDIA_DIR, mediaCopy, { recursive: true });
    mediaNote = `media copied to ${path.relative(process.cwd(), mediaCopy)}`;
  }

  const size = fs.statSync(file).size;
  console.log(
    `Backup of ${db} written to ${path.relative(process.cwd(), file)} (${size} bytes); ${mediaNote}.`,
  );
}

try {
  main();
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
