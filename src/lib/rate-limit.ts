import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";

// In-memory sliding window fallback for environments without Upstash credentials
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

let redis: Redis | null = null;
let ipRatelimit: Ratelimit | null = null;
let globalRatelimit: Ratelimit | null = null;

if (env.server.UPSTASH_REDIS_REST_URL && env.server.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: env.server.UPSTASH_REDIS_REST_URL,
    token: env.server.UPSTASH_REDIS_REST_TOKEN,
  });

  ipRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: false,
    prefix: "ratelimit:enquiry:ip",
  });

  globalRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 h"),
    analytics: false,
    prefix: "ratelimit:enquiry:global",
  });
}

/**
 * Enforces FR-36:
 * Rate limiting: 5 submissions per IP per hour, 30 per hour globally.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export async function checkEnquiryRateLimit(
  ip: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const ONE_HOUR_MS = 60 * 60 * 1000;

  if (redis && ipRatelimit && globalRatelimit) {
    try {
      const [ipResult, globalResult] = await Promise.all([
        ipRatelimit.limit(ip),
        globalRatelimit.limit("global"),
      ]);

      if (!ipResult.success) {
        return {
          allowed: false,
          reason: "Too many enquiries from this connection. Please wait before sending another.",
        };
      }

      if (!globalResult.success) {
        return {
          allowed: false,
          reason:
            "The form can't take enquiries right now. Please try again later or send an email.",
        };
      }

      return { allowed: true };
    } catch {
      // In case Redis connection encounters an issue, fallback to in-memory check
    }
  }

  // Fallback in-memory rate limiter
  const ipAllowed = checkMemoryLimit(`ip:${ip}`, 5, ONE_HOUR_MS);
  if (!ipAllowed) {
    return {
      allowed: false,
      reason: "Too many enquiries from this connection. Please wait before sending another.",
    };
  }

  const globalAllowed = checkMemoryLimit("global", 30, ONE_HOUR_MS);
  if (!globalAllowed) {
    return {
      allowed: false,
      reason: "The form can't take enquiries right now. Please try again later or send an email.",
    };
  }

  return { allowed: true };
}
