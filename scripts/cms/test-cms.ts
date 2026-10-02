/**
 * Full CMS test run (the morning command once DATABASE_URI_TEST exists):
 *
 *   tsx scripts/cms/test-cms.ts
 *
 * 1. Reset, migrate and import the test database; create test accounts (tests/cms/global-setup.ts).
 * 2. Build with CONTENT_SOURCE=cms against the test database.
 * 3. Parity of the CMS build against .cms-baseline/static-before.
 * 4. Public E2E and axe suites against the CMS build (port 3100).
 * 5. CMS suites (tests/cms) against the CMS build (port 3000).
 * 6. Rebuild in static mode.
 * Only DATABASE_URI_TEST is used. Exits non-zero if any step fails; later steps still run.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { connectionString, redact } from "./lib/db";
import { OFFLINE_ENV } from "./lib/server";

function run(command: string, args: string[], env: Record<string, string> = {}): number {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    // pnpm is a .cmd shim on Windows; node must not go through a shell (spaces in its path).
    shell: process.platform === "win32" && command === "pnpm",
    env: { ...process.env, ...OFFLINE_ENV, ...env },
  });
  return result.status ?? 1;
}

const tsx = (script: string, args: string[], env: Record<string, string> = {}) =>
  run(
    process.execPath,
    [path.join("node_modules", "tsx", "dist", "cli.mjs"), script, ...args],
    env,
  );

function main(): number {
  const cmsEnv = {
    CONTENT_SOURCE: "cms",
    DATABASE_URI: connectionString("DATABASE_URI_TEST"),
    CMS_E2E_BUILD: "cms",
  };
  const steps: [string, () => number][] = [
    ["prepare test database", () => tsx(path.join("scripts", "cms", "prepare-test-db.ts"), [])],
    [
      "build (cms)",
      () => {
        // Next's data cache lives in .next/cache and is only invalidated by tags, so a stale one
        // would serve the previous run's content. Start from nothing.
        fs.rmSync(path.join(".next"), { recursive: true, force: true });
        return run("pnpm", ["build"], cmsEnv);
      },
    ],
    [
      "parity (cms vs static-before)",
      () =>
        tsx(
          path.join("scripts", "cms", "parity-snapshot.ts"),
          [path.join(".cms-baseline", "cms")],
          cmsEnv,
        ) ||
        tsx(path.join("scripts", "cms", "parity-compare.ts"), [
          path.join(".cms-baseline", "static-before"),
          path.join(".cms-baseline", "cms"),
        ]),
    ],
    [
      "public E2E and axe (cms)",
      () =>
        tsx(
          path.join("scripts", "cms", "with-server.ts"),
          ["--", "pnpm", "exec", "playwright", "test"],
          cmsEnv,
        ),
    ],
    [
      "CMS suites",
      () =>
        run("pnpm", ["exec", "playwright", "test", "-c", "playwright.cms.config.ts"], {
          ...cmsEnv,
          CMS_TEST_PREPARED: "1",
        }),
    ],
  ];
  const results: string[] = [];
  let failed = false;
  for (const [name, step] of steps) {
    const status = step();
    results.push(`${status === 0 ? "pass" : "FAIL"}  ${name}`);
    if (status !== 0) failed = true;
    if (status !== 0 && name === "build (cms)") break;
  }
  results.push(
    `${run("pnpm", ["build"], { CONTENT_SOURCE: "static" }) === 0 ? "pass" : "FAIL"}  rebuild (static)`,
  );
  console.log(`\nCMS test run:\n${results.join("\n")}`);
  return failed ? 1 : 0;
}

try {
  process.exit(main());
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
