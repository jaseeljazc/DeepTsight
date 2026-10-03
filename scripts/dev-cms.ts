/**
 * Starts `next dev` with the public site reading its content from the CMS (CONTENT_SOURCE=cms).
 *
 *   pnpm dev:cms            (plain `pnpm dev` keeps reading src/content/source)
 *
 * A launcher rather than `CONTENT_SOURCE=cms next dev` in package.json, because that syntax does not
 * work in PowerShell or cmd. Needs DATABASE_URI, PAYLOAD_SECRET and MFA_ENCRYPTION_KEY in .env.local.
 */
import { spawn } from "node:child_process";
import path from "node:path";

const next = path.join("node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [next, "dev", ...process.argv.slice(2)], {
  env: { ...process.env, CONTENT_SOURCE: "cms" },
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => child.kill(signal));
