/**
 * Compares two CMS databases table by table (row counts in the public schema), to prove a restore.
 *
 *   tsx scripts/cms/verify-backup.ts DATABASE_URI DATABASE_URI_RESTORE
 *
 * Read-only. Prints table names and counts, never row content. Exits non-zero on any difference.
 */
import { parseDbEnvName, redact, runPg, type DbEnvName } from "./lib/db";

function query(db: DbEnvName, sql: string): string {
  const result = runPg(
    "psql",
    ["--no-psqlrc", "--tuples-only", "--no-align", `--command=${sql}`],
    db,
  );
  if (result.status !== 0) {
    throw new Error(`Query failed on ${db}: ${redact(result.stderr ?? "").trim()}`);
  }
  return result.stdout.trim();
}

function counts(db: DbEnvName): Map<string, number> {
  const tables = query(
    db,
    "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name",
  )
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter((name) => /^[a-z0-9_]+$/.test(name));
  const result = new Map<string, number>();
  for (const table of tables) {
    result.set(table, Number(query(db, `select count(*) from public."${table}"`)));
  }
  return result;
}

function main(): number {
  const a = parseDbEnvName(process.argv[2]);
  const b = parseDbEnvName(process.argv[3]);
  const left = counts(a);
  const right = counts(b);
  let differences = 0;
  const names = [...new Set([...left.keys(), ...right.keys()])].sort();
  for (const table of names) {
    const l = left.get(table);
    const r = right.get(table);
    const same = l === r;
    if (!same) differences += 1;
    console.log(
      `${same ? "  " : "!!"} ${table.padEnd(48)} ${String(l ?? "missing").padStart(8)} ${String(r ?? "missing").padStart(8)}`,
    );
  }
  console.log(
    differences === 0
      ? `Verified: ${names.length} tables, identical row counts in ${a} and ${b}.`
      : `${differences} table(s) differ between ${a} and ${b}.`,
  );
  return differences === 0 ? 0 : 1;
}

try {
  process.exit(main());
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
