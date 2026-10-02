/**
 * check-env.ts
 * Fails the build when NEXT_PUBLIC_ENV=production and a required variable is missing or is a
 * Cloudflare test key (SEC-10), and when CONTENT_SOURCE=cms without the CMS variables.
 * Loads .env files the same way `next build` does. Prints variable names only, never values.
 */

import nextEnv from "@next/env";
import { cmsEnvProblems, productionEnvProblems } from "../src/lib/env-rules";

nextEnv.loadEnvConfig(process.cwd());

const isProduction = process.env["NEXT_PUBLIC_ENV"]?.trim() === "production";

if (!isProduction) {
  const problems = cmsEnvProblems(process.env, { production: false });
  if (problems.length > 0) {
    console.error("\nCMS environment is incomplete:");
    problems.forEach((problem) => console.error(` - ${problem}`));
    process.exit(1);
  }
  console.log("Environment check: NEXT_PUBLIC_ENV is not production; CMS variables checked.");
} else {
  const problems = productionEnvProblems(process.env);
  if (problems.length > 0) {
    console.error("\nCRITICAL: production environment is incomplete (SEC-10):");
    problems.forEach((problem) => console.error(` - ${problem}`));
    process.exit(1);
  }
  console.log("Production environment variables present.");
}
