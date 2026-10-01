import { env } from "./env";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export type TurnstileResult =
  | {
      success: true;
      /** When Cloudflare issued the token, in ms since epoch. */
      challengeAt?: number;
    }
  | { success: false };

/**
 * Verifies a Cloudflare Turnstile token server-side (SEC-08).
 * The always-pass test secret is only ever present outside production (src/lib/env.ts).
 * A network failure fails closed on the live site and open elsewhere, so local work is not
 * blocked by Cloudflare.
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<TurnstileResult> {
  const secretKey = env.server.TURNSTILE_SECRET_KEY;
  if (!secretKey) return { success: false };

  // Test secret outside production: no network call, so local work and tests run offline.
  if (!env.isProductionSite && secretKey.startsWith("1x0000000000")) return { success: true };

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!res.ok) return { success: false };

    const outcome: TurnstileVerifyResponse = await res.json();
    if (!outcome.success) return { success: false };

    const challengeAt = outcome.challenge_ts ? Date.parse(outcome.challenge_ts) : NaN;
    return Number.isNaN(challengeAt) ? { success: true } : { success: true, challengeAt };
  } catch {
    return env.isProductionSite ? { success: false } : { success: true };
  }
}
