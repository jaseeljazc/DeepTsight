import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";

/*
 * Database helpers for scripts/cms. Connection strings are only ever passed to child processes
 * as arguments or environment; they are never printed. Errors name variables, never values.
 */

nextEnv.loadEnvConfig(process.cwd());

export const DB_ENV_NAMES = ["DATABASE_URI", "DATABASE_URI_TEST", "DATABASE_URI_RESTORE"] as const;
export type DbEnvName = (typeof DB_ENV_NAMES)[number];

export function parseDbEnvName(value: string | undefined): DbEnvName {
  if (!value || !(DB_ENV_NAMES as readonly string[]).includes(value)) {
    throw new Error(`Expected one of ${DB_ENV_NAMES.join(", ")}; got ${value ?? "nothing"}.`);
  }
  return value as DbEnvName;
}

/** Reads `--flag value` from argv. */
export function argValue(flag: string, args = process.argv.slice(2)): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

export function connectionString(name: DbEnvName): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set (see .env.example).`);
  if (!/^postgres(ql)?:\/\//.test(value)) {
    throw new Error(`${name} must start with postgres:// or postgresql://.`);
  }
  return value;
}

export function databaseName(name: DbEnvName): string {
  const url = new URL(connectionString(name));
  return decodeURIComponent(url.pathname.replace(/^\//, ""));
}

/**
 * Destructive operations (schema reset, restore) are allowed only on databases whose name ends in
 * _test or _restore (D-15). The dev database is changed only by migrations and the import.
 */
export function assertDisposable(name: DbEnvName): string {
  const dbName = databaseName(name);
  if (!/(_test|_restore)$/.test(dbName)) {
    throw new Error(
      `Refusing: the database in ${name} does not end in _test or _restore. Destructive operations are not allowed on it.`,
    );
  }
  return dbName;
}

/** Finds a PostgreSQL client tool on PATH, in PG_BIN, or in the default Windows install folder. */
export function pgTool(tool: "psql" | "pg_dump" | "pg_restore"): string {
  const exe = process.platform === "win32" ? `${tool}.exe` : tool;
  const candidates: string[] = [];
  if (process.env["PG_BIN"]) candidates.push(path.join(process.env["PG_BIN"], exe));
  for (const dir of (process.env["PATH"] ?? "").split(path.delimiter)) {
    if (dir) candidates.push(path.join(dir, exe));
  }
  if (process.platform === "win32") {
    candidates.push(path.join("C:\\Program Files\\PostgreSQL\\17\\bin", exe));
  }
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found)
    throw new Error(`${tool} not found. Add the PostgreSQL 17 bin folder to PATH or set PG_BIN.`);
  return found;
}

/**
 * Runs a PostgreSQL tool with the connection passed through the environment (PG* variables are
 * not used; the URI goes in as --dbname). Output is captured; the caller decides what to print.
 */
export function runPg(
  tool: "psql" | "pg_dump" | "pg_restore",
  args: string[],
  db: DbEnvName,
): SpawnSyncReturns<string> {
  const uri = connectionString(db);
  return spawnSync(pgTool(tool), [`--dbname=${uri}`, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Removes anything that looks like a connection string or password from tool output. */
export function redact(text: string): string {
  return text
    .replace(/postgres(ql)?:\/\/[^\s"']+/g, "[connection string]")
    .replace(/password[=:]\s*\S+/gi, "password=[redacted]");
}

export function timestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}
