/**
 * Prepares the test database for the CMS tests: reset the schema, run every migration (proving
 * the chain from empty), import the site content, then create the test accounts. Only
 * DATABASE_URI_TEST is touched; the reset refuses any database whose name does not end in _test.
 *
 *   tsx scripts/cms/prepare-test-db.ts
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const TEST_DATA_DIR = path.join(process.cwd(), ".data", "test");
export const ADMIN_FILE = path.join(TEST_DATA_DIR, "cms-admin.json");
export const EDITOR_FILE = path.join(TEST_DATA_DIR, "cms-editor.json");
export const LOCKOUT_FILE = path.join(TEST_DATA_DIR, "cms-lockout.json");
// One approver account per spec: each has its own authenticator secret, so specs neither share the
// MFA attempt limit (5 per 5 minutes per user) nor wait for a fresh code step.
export const ENQUIRY_TYPES_FILE = path.join(TEST_DATA_DIR, "cms-enquiry-types.json");
export const INBOX_FILE = path.join(TEST_DATA_DIR, "cms-inbox.json");
export const INSIGHTS_FILE = path.join(TEST_DATA_DIR, "cms-insights.json");
export const PREVIEW_FILE = path.join(TEST_DATA_DIR, "cms-preview.json");

function run(script: string, args: string[]): void {
  const result = spawnSync(
    process.execPath,
    [path.join("node_modules", "tsx", "dist", "cli.mjs"), script, ...args],
    { stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) throw new Error(`${script} failed (exit ${result.status ?? "signal"}).`);
}

export function prepareTestDb(): void {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  run(path.join("scripts", "cms", "migrate.ts"), ["--db", "DATABASE_URI_TEST", "--fresh"]);
  run(path.join("scripts", "cms", "import-from-source.ts"), ["--db", "DATABASE_URI_TEST"]);
  const accounts: [string, string, string, string][] = [
    [ADMIN_FILE, "editor@example.com", "Test Editor", "editor,approver"],
    [EDITOR_FILE, "editor-only@example.com", "Test Editor Only", "editor"],
    [LOCKOUT_FILE, "lockout@example.com", "Test Lockout", "editor"],
    [ENQUIRY_TYPES_FILE, "enquiry-types@example.com", "Test Enquiry Types", "editor,approver"],
    [INBOX_FILE, "inbox@example.com", "Test Inbox", "editor,approver"],
    [INSIGHTS_FILE, "insights@example.com", "Test Insights", "editor,approver"],
    [PREVIEW_FILE, "preview@example.com", "Test Preview", "editor,approver"],
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

if (process.argv[1]?.endsWith("prepare-test-db.ts")) {
  try {
    prepareTestDb();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
