import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_ENV: z.enum(["development", "preview", "production"]).default("development"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional().default("1x00000000000000000000AA"),
  NEXT_PUBLIC_ANALYTICS_DOMAIN: z.string().optional().default("deeptsight.com.au"),
});

const serverEnvSchema = z.object({
  TURNSTILE_SECRET_KEY: z.string().optional().default("1x0000000000000000000000000000000AA"),
  RESEND_API_KEY: z.string().optional(),
  ENQUIRY_TO_EMAIL: z.string().email().optional().default("enquiries@deeptsight.com"),
  ENQUIRY_FROM_EMAIL: z.string().email().optional().default("contact@deeptsight.com.au"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

function parseEnv() {
  const isProd =
    process.env["NEXT_PUBLIC_ENV"] === "production" || process.env.NODE_ENV === "production";

  const client = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env["NEXT_PUBLIC_SITE_URL"],
    NEXT_PUBLIC_ENV: process.env["NEXT_PUBLIC_ENV"] ?? process.env.NODE_ENV,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env["NEXT_PUBLIC_TURNSTILE_SITE_KEY"],
    NEXT_PUBLIC_ANALYTICS_DOMAIN: process.env["NEXT_PUBLIC_ANALYTICS_DOMAIN"],
  });

  if (!client.success) {
    console.error("Invalid client environment variables:", client.error.format());
    if (isProd) {
      throw new Error("Client environment validation failed in production.");
    }
  }

  const server = serverEnvSchema.safeParse({
    TURNSTILE_SECRET_KEY: process.env["TURNSTILE_SECRET_KEY"],
    RESEND_API_KEY: process.env["RESEND_API_KEY"],
    ENQUIRY_TO_EMAIL: process.env["ENQUIRY_TO_EMAIL"],
    ENQUIRY_FROM_EMAIL: process.env["ENQUIRY_FROM_EMAIL"],
    UPSTASH_REDIS_REST_URL: process.env["UPSTASH_REDIS_REST_URL"],
    UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"],
  });

  if (!server.success) {
    console.error("Invalid server environment variables:", server.error.format());
    if (isProd) {
      throw new Error("Server environment validation failed in production.");
    }
  }

  return {
    client: client.data ?? clientEnvSchema.parse({}),
    server: server.data ?? serverEnvSchema.parse({}),
  };
}

export const env = parseEnv();
