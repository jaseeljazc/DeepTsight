import crypto from "node:crypto";
import { derivedKey, hmac, mfaEncryptionKey, safeEqual } from "../lib/secrets";

/*
 * TOTP secrets are encrypted at rest with AES-256-GCM under MFA_ENCRYPTION_KEY
 * (docs/cms/03_SECURITY_AND_OPS.md §3). Stored form: "v1.<iv>.<tag>.<ciphertext>", base64url parts.
 * Recovery codes are stored only as keyed hashes.
 */

export function encryptSecret(plain: string, key: Buffer = mfaEncryptionKey()): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv, tag, ciphertext]
    .map((part) => (typeof part === "string" ? part : part.toString("base64url")))
    .join(".");
}

export function decryptSecret(stored: string, key: Buffer = mfaEncryptionKey()): string {
  const [version, iv, tag, ciphertext] = stored.split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext)
    throw new Error("Unrecognised secret format.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const RECOVERY_CODE_COUNT = 10;

/** Ten single-use recovery codes, shown once. Format "xxxxx-xxxxx" (about 49 bits each). */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const chars = Array.from(
      { length: 10 },
      () => RECOVERY_ALPHABET[crypto.randomInt(RECOVERY_ALPHABET.length)] ?? "a",
    ).join("");
    return `${chars.slice(0, 5)}-${chars.slice(5)}`;
  });
}

function normaliseRecoveryCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function hashRecoveryCode(code: string): string {
  return hmac(derivedKey("recovery-code"), normaliseRecoveryCode(code));
}

/** Returns the index of the matching stored hash, or -1. */
export function findRecoveryCode(code: string, storedHashes: string[]): number {
  const candidate = hashRecoveryCode(code);
  let found = -1;
  storedHashes.forEach((stored, index) => {
    if (safeEqual(stored, candidate)) found = index;
  });
  return found;
}
