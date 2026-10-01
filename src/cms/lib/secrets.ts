import crypto from "node:crypto";

/*
 * CMS secrets, read from the environment when first needed (never at import time, so the static
 * build does not need them). Errors name the variable, never its value.
 */

function required(name: "PAYLOAD_SECRET" | "MFA_ENCRYPTION_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

/** 32-byte key that encrypts TOTP secrets at rest (AES-256-GCM). */
export function mfaEncryptionKey(): Buffer {
  const key = Buffer.from(required("MFA_ENCRYPTION_KEY"), "base64");
  if (key.length !== 32) throw new Error("MFA_ENCRYPTION_KEY must be 32 bytes, base64 encoded.");
  return key;
}

/**
 * A key for one purpose, derived from PAYLOAD_SECRET with HKDF, so a key used to sign MFA cookies
 * can never be confused with one used to hash recovery codes or IP addresses.
 */
export function derivedKey(purpose: "mfa-cookie" | "recovery-code" | "ip-hash"): Buffer {
  const secret = required("PAYLOAD_SECRET");
  return Buffer.from(
    crypto.hkdfSync("sha256", secret, "deeptsight-cms", `deeptsight-cms:${purpose}`, 32),
  );
}

/** HMAC-SHA256 as base64url. */
export function hmac(key: Buffer, value: string): string {
  return crypto.createHmac("sha256", key).update(value).digest("base64url");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

/** One-way hash of an IP address for rate limiting. Raw addresses are never stored. */
export function hashIp(ip: string): string {
  return hmac(derivedKey("ip-hash"), ip).slice(0, 32);
}
