/**
 * Proves the backup works (Phase 12): back up the dev database, restore it into the restore
 * database, and compare row counts table by table.
 *
 *   tsx scripts/cms/prove-backup.ts
 *
 * Reads DATABASE_URI (dev, read-only here) and writes only DATABASE_URI_RESTORE.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { databaseName, redact } from "./lib/db";

const tsx = (script: string, args: string[]) =>
  spawnSync(
    process.execPath,
    [path.join("node_modules", "tsx", "dist", "cli.mjs"), script, ...args],
    {
      stdio: "inherit",
      env: process.env,
    },
  ).status ?? 1;

function main(): number {
  const before = Date.now();
  if (tsx(path.join("scripts", "cms", "backup.ts"), ["--db", "DATABASE_URI"]) !== 0) return 1;
  const dir = path.join(".data", "backups");
  const prefix = `${databaseName("DATABASE_URI")}-`;
  const latest = fs
    .readdirSync(dir)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".dump"))
    .map((name) => ({ name, time: fs.statSync(path.join(dir, name)).mtimeMs }))
    .filter((file) => file.time >= before - 1000)
    .sort((a, b) => b.time - a.time)[0];
  if (!latest) throw new Error("The backup file was not found.");
  const file = path.join(dir, latest.name);
  if (
    tsx(path.join("scripts", "cms", "restore.ts"), [
      "--from",
      file,
      "--db",
      "DATABASE_URI_RESTORE",
    ]) !== 0
  )
    return 1;
  return tsx(path.join("scripts", "cms", "verify-backup.ts"), [
    "DATABASE_URI",
    "DATABASE_URI_RESTORE",
  ]);
}

try {
  process.exit(main());
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
