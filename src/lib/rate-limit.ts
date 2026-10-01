import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";

/*
 * FR-36: 5 enquiries per IP per hour and 30 per hour across the site.
 * Upstash is required on the live site (src/lib/env-rules.ts). The in-memory limiter is for
 * development, and the fallback if Redis errors: it only covers one server instance, so each
 * fallback is logged (no personal data, PRIV-08).
 */

const IP_LIMIT = 5;
const GLOBAL_LIMIT = 30;
const ONE_HOUR_MS = 60 * 60 * 1000;

const memoryStore = new Map<string, number[]>();

function checkMemoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = memoryStore.get(key) ?? [];
  const valid = timestamps.filter((t) => now - t < windowMs);
  if (valid.length >= limit) {
    return false;
  }
  valid.push(now);
  memoryStore.set(key, valid);
  return true;
}

let ipRatelimit: Ratelimit | null = null;
let globalRatelimit: Ratelimit | null = null;

if (env.server.UPSTASH_REDIS_REST_URL && env.server.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: env.server.UPSTASH_REDIS_REST_URL,
    token: env.server.UPSTASH_REDIS_REST_TOKEN,
  });

  ipRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(IP_LIMIT, "1 h"),
    analytics: false,
    prefix: "ratelimit:enquiry:ip",
  });

  globalRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(GLOBAL_LIMIT, "1 h"),
    analytics: false,
    prefix: "ratelimit:enquiry:global",
  });
}

const IP_LIMIT_MESSAGE =
  "Too many enquiries from this connection. Please wait before sending another.";
const GLOBAL_LIMIT_MESSAGE =
  "The form can't take enquiries right now. Please try again later or send an email.";

/**
 * The visitor's IP for rate limiting. Assumes the host overwrites these headers with the real
 * client address (Vercel does). On a host that passes client-supplied values through, configure
 * the trusted header here before launch.
 */
export function clientIp(headerList: Headers): string {
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || headerList.get("x-real-ip")?.trim() || "unknown";
}

/** Counts one enquiry against the limits. Call it only for submissions that passed validation. */
export async function checkEnquiryRateLimit(
  ip: string,
): Promise<{ allowed: boolean; reason?: string }> {
  if (ipRatelimit && globalRatelimit) {
    try {
      const [ipResult, globalResult] = await Promise.all([
        ipRatelimit.limit(ip),
        globalRatelimit.limit("global"),
      ]);

      if (!ipResult.success) return { allowed: false, reason: IP_LIMIT_MESSAGE };
      if (!globalResult.success) return { allowed: false, reason: GLOBAL_LIMIT_MESSAGE };
      return { allowed: true };
    } catch (error) {
      console.warn(
        "[Rate limit] Redis unavailable, using the in-memory limiter:",
        error instanceof Error ? error.name : "UnknownError",
      );
    }
  }

  if (!checkMemoryLimit(`ip:${ip}`, IP_LIMIT, ONE_HOUR_MS)) {
    return { allowed: false, reason: IP_LIMIT_MESSAGE };
  }
  if (!checkMemoryLimit("global", GLOBAL_LIMIT, ONE_HOUR_MS)) {
    return { allowed: false, reason: GLOBAL_LIMIT_MESSAGE };
  }
  return { allowed: true };
}
