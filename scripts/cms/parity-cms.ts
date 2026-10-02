/**
 * CMS-mode parity (Phase 6): the site built from the CMS must match the static site.
 *
 *   tsx scripts/cms/parity-cms.ts [--skip-import]
 *
 * 1. Reset, migrate and import the test database (DATABASE_URI_TEST only).
 * 2. Build with CONTENT_SOURCE=cms against it.
 * 3. Snapshot to .cms-baseline/cms/ and compare with .cms-baseline/static-before/.
 * 4. Rebuild in static mode so .next is left as the default.
 * Exits non-zero on any unexplained difference (docs/cms/parity-allowlist.json).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { connectionString, redact } from "./lib/db";
import { OFFLINE_ENV } from "./lib/server";

function run(command: string, args: string[], env: Record<string, string> = {}): number {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    // pnpm is a .cmd shim on Windows and needs a shell; node itself must not get one (spaces in its path).
    shell: process.platform === "win32" && command === "pnpm",
    env: { ...process.env, ...OFFLINE_ENV, ...env },
  });
  return result.status ?? 1;
}

function tsx(script: string, args: string[], env: Record<string, string> = {}): number {
  return run(
    process.execPath,
    [path.join("node_modules", "tsx", "dist", "cli.mjs"), script, ...args],
    env,
  );
}

function main(): number {
  const testDb = connectionString("DATABASE_URI_TEST");
  const cmsEnv = { CONTENT_SOURCE: "cms", DATABASE_URI: testDb };

  if (!process.argv.includes("--skip-import")) {
    if (
      tsx(path.join("scripts", "cms", "migrate.ts"), ["--db", "DATABASE_URI_TEST", "--fresh"]) !== 0
    )
      return 1;
    if (
      tsx(path.join("scripts", "cms", "import-from-source.ts"), ["--db", "DATABASE_URI_TEST"]) !== 0
    )
      return 1;
  }

  // A stale .next/cache would serve the previous build's content (Next's data cache).
  fs.rmSync(path.join(".next"), { recursive: true, force: true });
  let status = run("pnpm", ["build"], cmsEnv);
  if (status === 0) {
    status = tsx(
      path.join("scripts", "cms", "parity-snapshot.ts"),
      [path.join(".cms-baseline", "cms")],
      cmsEnv,
    );
  }
  if (status === 0) {
    status = tsx(path.join("scripts", "cms", "parity-compare.ts"), [
      path.join(".cms-baseline", "static-before"),
      path.join(".cms-baseline", "cms"),
    ]);
  }

  // Leave the default (static) build behind whatever happened.
  const rebuild = run("pnpm", ["build"], { CONTENT_SOURCE: "static" });
  if (rebuild !== 0) console.error("Static rebuild failed; run pnpm build.");
  return status;
}

try {
  process.exit(main());
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
