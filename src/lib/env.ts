import { z } from "zod";
import { CONTENT_SOURCES, cmsEnvProblems, productionEnvProblems } from "./env-rules";
import { appEnv, isProductionSite, publicEnv } from "./public-env";

/*
 * Server environment (SEC-10, ARCHITECTURE.md §9). Server code only: never import this from a
 * client component. Public values come from ./public-env.
 *
 * On the live site (NEXT_PUBLIC_ENV=production) every variable in env-rules.ts is required and
 * Cloudflare test keys are refused. scripts/check-env.ts applies the same rules before the build.
 */

/** Cloudflare's documented always-pass test secret. Development and preview only. */
const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA";

const serverEnvSchema = z.object({
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  ENQUIRY_TO_EMAIL: z.string().email().optional(),
  ENQUIRY_FROM_EMAIL: z.string().email().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  CONTENT_SOURCE: z.enum(CONTENT_SOURCES).default("static"),
  ENQUIRY_RETENTION_DAYS: z.coerce.number().int().positive().optional(),
});

function parseServerEnv() {
  if (isProductionSite) {
    const problems = productionEnvProblems(process.env);
    if (problems.length > 0) {
      throw new Error(`Production environment is incomplete: ${problems.join("; ")}.`);
    }
  } else {
    // CMS variables (DATABASE_URI, PAYLOAD_SECRET, MFA_ENCRYPTION_KEY) are read by src/cms only.
    const problems = cmsEnvProblems(process.env, { production: false });
    if (problems.length > 0) {
      throw new Error(`CMS environment is incomplete: ${problems.join("; ")}.`);
    }
  }

  const parsed = serverEnvSchema.safeParse({
    TURNSTILE_SECRET_KEY: process.env["TURNSTILE_SECRET_KEY"] || undefined,
    RESEND_API_KEY: process.env["RESEND_API_KEY"] || undefined,
    ENQUIRY_TO_EMAIL: process.env["ENQUIRY_TO_EMAIL"] || undefined,
    ENQUIRY_FROM_EMAIL: process.env["ENQUIRY_FROM_EMAIL"] || undefined,
    UPSTASH_REDIS_REST_URL: process.env["UPSTASH_REDIS_REST_URL"] || undefined,
    UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"] || undefined,
    CONTENT_SOURCE: process.env["CONTENT_SOURCE"] || undefined,
    ENQUIRY_RETENTION_DAYS: process.env["ENQUIRY_RETENTION_DAYS"] || undefined,
  });

  if (!parsed.success) {
    // Names only, never values.
    const names = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
    throw new Error(`Invalid server environment variables: ${names}.`);
  }

  return {
    ...parsed.data,
    TURNSTILE_SECRET_KEY:
      parsed.data.TURNSTILE_SECRET_KEY ?? (isProductionSite ? undefined : TURNSTILE_TEST_SECRET),
  };
}

export const env = {
  appEnv,
  isProductionSite,
  client: publicEnv,
  server: parseServerEnv(),
};
