/**
 * check-env.ts
 * Fails the build when NEXT_PUBLIC_ENV=production and a required variable is missing or is a
 * Cloudflare test key (SEC-10). Loads .env files the same way `next build` does.
 * Prints variable names only, never values.
 */

import nextEnv from "@next/env";
import { productionEnvProblems } from "../src/lib/env-rules";

nextEnv.loadEnvConfig(process.cwd());

const isProduction = process.env["NEXT_PUBLIC_ENV"]?.trim() === "production";

if (!isProduction) {
  console.log("Environment check skipped: NEXT_PUBLIC_ENV is not production.");
} else {
  const problems = productionEnvProblems(process.env);
  if (problems.length > 0) {
    console.error("\nCRITICAL: production environment is incomplete (SEC-10):");
    problems.forEach((problem) => console.error(` - ${problem}`));
    process.exit(1);
  }
  console.log("Production environment variables present.");
}
