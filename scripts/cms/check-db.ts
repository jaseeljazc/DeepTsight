/**
 * Checks that each CMS database answers `select 1`. Prints "ok" or a short error per variable,
 * never a connection string.
 *
 *   tsx scripts/cms/check-db.ts
 */
import { DB_ENV_NAMES, redact, runPg } from "./lib/db";

let failures = 0;
for (const name of DB_ENV_NAMES) {
  if (!process.env[name]?.trim()) {
    console.log(`${name}: not set`);
    failures += 1;
    continue;
  }
  try {
    const result = runPg("psql", ["--no-psqlrc", "--tuples-only", "--command=select 1"], name);
    if (result.status === 0 && result.stdout.trim() === "1") {
      console.log(`${name}: ok`);
    } else {
      failures += 1;
      const firstLine =
        redact(result.stderr ?? "")
          .trim()
          .split(/\r?\n/)[0] ?? "";
      console.log(`${name}: error (exit ${result.status ?? "signal"}) ${firstLine}`);
    }
  } catch (error) {
    failures += 1;
    console.log(`${name}: error ${redact(error instanceof Error ? error.message : String(error))}`);
  }
}
process.exit(failures === 0 ? 0 : 1);
