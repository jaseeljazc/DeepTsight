import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/*
 * Prepares the test database for tests/cms: reset the schema, run every migration (proving the
 * chain from empty), import the site content, then create the test accounts. Only DATABASE_URI_TEST is touched; the reset
 * script refuses any database whose name does not end in _test.
 */

export const TEST_DATA_DIR = path.join(process.cwd(), ".data", "test");
export const ADMIN_FILE = path.join(TEST_DATA_DIR, "cms-admin.json");
export const LOCKOUT_FILE = path.join(TEST_DATA_DIR, "cms-lockout.json");
export const EDITOR_FILE = path.join(TEST_DATA_DIR, "cms-editor.json");

function run(script: string, args: string[]): void {
  const result = spawnSync(
    process.execPath,
    [path.join("node_modules", "tsx", "dist", "cli.mjs"), script, ...args],
    { stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) throw new Error(`${script} failed (exit ${result.status ?? "signal"}).`);
}

export default async function globalSetup(): Promise<void> {
  if (!process.env["DATABASE_URI_TEST"]) {
    console.warn("DATABASE_URI_TEST is not set: CMS tests will be skipped.");
    return;
  }
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  run(path.join("scripts", "cms", "migrate.ts"), ["--db", "DATABASE_URI_TEST", "--fresh"]);
  // The site content, so cms-mode pages render exactly as static mode (D-15).
  run(path.join("scripts", "cms", "import-from-source.ts"), ["--db", "DATABASE_URI_TEST"]);
  const accounts: [string, string, string, string][] = [
    [ADMIN_FILE, "editor@example.com", "Test Editor", "editor,approver"],
    [EDITOR_FILE, "editor-only@example.com", "Test Editor Only", "editor"],
    [LOCKOUT_FILE, "lockout@example.com", "Test Lockout", "editor"],
  ];
  for (const [file, email, name, roles] of accounts) {
    run(path.join("scripts", "cms", "create-admin.ts"), [
      "--db",
      "DATABASE_URI_TEST",
      "--email",
      email,
      "--name",
      name,
      "--roles",
      roles,
      "--out",
      file,
      "--json",
    ]);
  }
}
