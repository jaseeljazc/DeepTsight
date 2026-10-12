/**
 * Runs Payload migrations against one of the CMS databases.
 *
 *   tsx scripts/cms/migrate.ts --db DATABASE_URI_TEST [--fresh]
 *
 * --fresh resets the schema first (test and restore databases only) and so proves the whole
 * migration chain from an empty database. Back up dev (scripts/cms/backup.ts) before migrating it.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { argValue, connectionString, parseDbEnvName, redact } from "./lib/db";
import { resetDatabase } from "./reset-db";

export function migrate(envName: string, { fresh = false } = {}): void {
  const db = parseDbEnvName(envName);
  if (fresh) resetDatabase(db);
  const payloadBin = path.join(process.cwd(), "node_modules", "payload", "bin.js");
  // Payload's CLI starts its work with `void start()` behind tsx's async loader, and now and then
  // Node exits 0 before that work begins: no output, nothing migrated. Exit 0 alone is not
  // success; the run must also reach Payload's closing "Done." line. Retry such a run twice.
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = spawnSync(process.execPath, [payloadBin, "migrate"], {
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URI: connectionString(db),
        // Never prompt: an interactive question would block an unattended run.
        CI: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const output = redact(`${result.stdout ?? ""}${result.stderr ?? ""}`);
    if (result.status !== 0) {
      throw new Error(
        `payload migrate failed on ${db} (exit ${result.status ?? "signal"}):\n${output.slice(-3000)}`,
      );
    }
    // Payload colours its log lines, so match the text rather than a word boundary.
    if (output.includes("Done.")) {
      console.log(`Migrations applied to ${db}${fresh ? " (fresh schema)" : ""}.`);
      return;
    }
  }
  throw new Error(`payload migrate exited without running on ${db} (3 attempts).`);
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  try {
    migrate(argValue("--db") ?? "", { fresh: process.argv.includes("--fresh") });
  } catch (error) {
    console.error(redact(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
