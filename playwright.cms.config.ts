import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import nextEnv from "@next/env";

/*
 * CMS tests (tests/cms): run against `next start` on port 3000 with DATABASE_URI pointed at the
 * test database (D-15), never the dev database. global-setup resets, migrates and seeds it.
 * Port 3000 matches the default NEXT_PUBLIC_SITE_URL, which Payload uses for its CSRF origin check.
 * Run `pnpm build` first. Without DATABASE_URI_TEST every test is skipped.
 */
nextEnv.loadEnvConfig(process.cwd());

const testDb = process.env["DATABASE_URI_TEST"] ?? "";
const PORT = 3000;

export default defineConfig({
  testDir: "./tests/cms",
  testIgnore: ["**/unit/**"],
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  globalSetup: path.join(process.cwd(), "tests", "cms", "global-setup.ts"),
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
  },
  projects: [{ name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } }],
  webServer: testDb
    ? {
        command: `node ${path.join("node_modules", "next", "dist", "bin", "next")} start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        timeout: 120 * 1000,
        env: {
          DATABASE_URI: testDb,
          RESEND_API_KEY: "",
          UPSTASH_REDIS_REST_URL: "",
          UPSTASH_REDIS_REST_TOKEN: "",
        },
      }
    : undefined,
});
