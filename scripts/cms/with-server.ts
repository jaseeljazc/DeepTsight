/**
 * Runs a command against the production build: starts `next start`, sets
 * PLAYWRIGHT_TEST_BASE_URL, runs the command, then stops the server.
 *
 *   tsx scripts/cms/with-server.ts [--port 3100] -- pnpm exec playwright test tests/e2e
 */
import { spawnSync } from "node:child_process";
import { OFFLINE_ENV, startServer } from "./lib/server";

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const separator = args.indexOf("--");
  if (separator === -1 || separator === args.length - 1) {
    console.error("Usage: tsx scripts/cms/with-server.ts [--port N] -- <command...>");
    return 2;
  }
  const own = args.slice(0, separator);
  const command = args.slice(separator + 1);
  const portFlag = own.indexOf("--port");
  const port = portFlag === -1 ? 3100 : Number(own[portFlag + 1]);

  const server = await startServer(port);
  try {
    const [bin, ...rest] = command;
    if (bin === undefined) return 2;
    const result = spawnSync(bin, rest, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, ...OFFLINE_ENV, PLAYWRIGHT_TEST_BASE_URL: server.url },
    });
    return result.status ?? 1;
  } finally {
    server.stop();
  }
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
