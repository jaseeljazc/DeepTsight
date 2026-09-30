import { env } from "./env";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Validates Cloudflare Turnstile token server-side.
 * Returns true if valid or if running in test environment with test keys.
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = env.server.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return true;
  }

  // Cloudflare test secret key always passes
  if (secretKey.startsWith("1x00000000000000000000")) {
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!res.ok) {
      return false;
    }

    const outcome: TurnstileVerifyResponse = await res.json();
    return outcome.success;
  } catch {
    // If external verification network call fails, fail closed in production, pass in non-prod
    return env.client.NEXT_PUBLIC_ENV !== "production";
  }
}
