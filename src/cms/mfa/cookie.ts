import { derivedKey, hmac, safeEqual } from "../lib/secrets";

/*
 * Second-factor cookie (docs/cms/03_SECURITY_AND_OPS.md §3). Set after a valid TOTP or recovery
 * code. Value: "<userId>.<expiresAtSeconds>.<hmac>", where the HMAC covers the user id, the Payload
 * session id and the expiry. Logging out revokes the session, which invalidates the cookie; a new
 * login gets a new session id and must verify again.
 */

export const MFA_COOKIE = "dts-mfa";
/** Same as the Payload session (auth.tokenExpiration). */
export const MFA_LIFETIME_SECONDS = 2 * 60 * 60;

function signature(userId: string, sessionId: string, expiresAt: number): string {
  return hmac(derivedKey("mfa-cookie"), `${userId}|${sessionId}|${expiresAt}`);
}

export function createMfaCookieValue(
  userId: string | number,
  sessionId: string,
  nowMs = Date.now(),
): { value: string; expiresAt: number } {
  const expiresAt = Math.floor(nowMs / 1000) + MFA_LIFETIME_SECONDS;
  const id = String(userId);
  return { value: `${id}.${expiresAt}.${signature(id, sessionId, expiresAt)}`, expiresAt };
}

export function isValidMfaCookie(
  value: string | undefined,
  userId: string | number,
  sessionId: string | undefined,
  nowMs = Date.now(),
): boolean {
  if (!value || !sessionId) return false;
  const [id, expires, mac] = value.split(".");
  if (!id || !expires || !mac || id !== String(userId)) return false;
  const expiresAt = Number(expires);
  if (!Number.isInteger(expiresAt) || expiresAt <= Math.floor(nowMs / 1000)) return false;
  return safeEqual(mac, signature(id, sessionId, expiresAt));
}

/** Set-Cookie header value. Secure everywhere except plain-http localhost development. */
export function serializeMfaCookie(value: string, maxAgeSeconds: number, secure: boolean): string {
  return [
    `${MFA_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAgeSeconds}`,
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

export function readCookie(
  cookieHeader: string | null | undefined,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}
