/**
 * Offline unit tests for the MFA building blocks. Run: pnpm test:cms-unit
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { test } from "node:test";

process.env["PAYLOAD_SECRET"] ??= "unit-test-secret-unit-test-secret-0000";
process.env["MFA_ENCRYPTION_KEY"] ??= crypto.randomBytes(32).toString("base64");

const totp = await import("../../../src/cms/mfa/totp");
const mfaCrypto = await import("../../../src/cms/mfa/crypto");
const cookie = await import("../../../src/cms/mfa/cookie");

// RFC 6238 appendix B, SHA-1 key "12345678901234567890", last six digits of the 8-digit values.
const RFC_SECRET = totp.base32Encode(Buffer.from("12345678901234567890", "ascii"));
const RFC_VECTORS: [number, string][] = [
  [59, "287082"],
  [1111111109, "081804"],
  [1111111111, "050471"],
  [1234567890, "005924"],
  [2000000000, "279037"],
];

test("TOTP matches the RFC 6238 test vectors", () => {
  for (const [seconds, expected] of RFC_VECTORS) {
    assert.equal(totp.totpCode(RFC_SECRET, totp.timeStep(seconds * 1000)), expected);
  }
});

test("base32 round-trips", () => {
  const bytes = crypto.randomBytes(20);
  assert.deepEqual(totp.base32Decode(totp.base32Encode(bytes)), bytes);
});

test("verifyTotp accepts adjacent steps, refuses replays and malformed codes", () => {
  const secret = totp.generateTotpSecret();
  const now = Date.now();
  const step = totp.timeStep(now);
  assert.equal(totp.verifyTotp(secret, totp.totpCode(secret, step), { nowMs: now }), step);
  assert.equal(totp.verifyTotp(secret, totp.totpCode(secret, step - 1), { nowMs: now }), step - 1);
  assert.equal(totp.verifyTotp(secret, totp.totpCode(secret, step - 2), { nowMs: now }), null);
  assert.equal(
    totp.verifyTotp(secret, totp.totpCode(secret, step), { nowMs: now, lastUsedStep: step }),
    null,
  );
  assert.equal(totp.verifyTotp(secret, "12345", { nowMs: now }), null);
  assert.equal(totp.verifyTotp(secret, "abcdef", { nowMs: now }), null);
});

test("otpauth URI carries the secret and issuer", () => {
  const uri = totp.otpauthUri("JBSWY3DPEHPK3PXP", "editor@example.com", "DeepTsight CMS");
  assert.match(uri, /^otpauth:\/\/totp\/DeepTsight%20CMS%3Aeditor%40example\.com\?/);
  assert.match(uri, /secret=JBSWY3DPEHPK3PXP/);
});

test("secrets are encrypted with AES-256-GCM and tampering is detected", () => {
  const stored = mfaCrypto.encryptSecret("JBSWY3DPEHPK3PXP");
  assert.ok(!stored.includes("JBSWY3DPEHPK3PXP"));
  assert.equal(mfaCrypto.decryptSecret(stored), "JBSWY3DPEHPK3PXP");
  const parts = stored.split(".");
  const ciphertext = Buffer.from(parts[3] ?? "", "base64url");
  ciphertext[0] = (ciphertext[0] ?? 0) ^ 1;
  parts[3] = ciphertext.toString("base64url");
  assert.throws(() => mfaCrypto.decryptSecret(parts.join(".")));
  assert.throws(() => mfaCrypto.decryptSecret(stored, crypto.randomBytes(32)));
});

test("recovery codes are hashed and matched case-insensitively", () => {
  const codes = mfaCrypto.generateRecoveryCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  const hashes = codes.map(mfaCrypto.hashRecoveryCode);
  assert.ok(hashes.every((hash, index) => hash !== codes[index]));
  assert.equal(mfaCrypto.findRecoveryCode((codes[3] ?? "").toUpperCase(), hashes), 3);
  assert.equal(mfaCrypto.findRecoveryCode("zzzzz-zzzzz", hashes), -1);
});

test("MFA cookie is bound to user, session and expiry", () => {
  const now = Date.now();
  const { value } = cookie.createMfaCookieValue(7, "session-a", now);
  assert.ok(cookie.isValidMfaCookie(value, 7, "session-a", now));
  assert.ok(!cookie.isValidMfaCookie(value, 8, "session-a", now), "other user");
  assert.ok(!cookie.isValidMfaCookie(value, 7, "session-b", now), "other session");
  assert.ok(!cookie.isValidMfaCookie(value, 7, undefined, now), "no session");
  assert.ok(
    !cookie.isValidMfaCookie(value, 7, "session-a", now + (cookie.MFA_LIFETIME_SECONDS + 1) * 1000),
    "expired",
  );
  const [id, , mac] = value.split(".");
  const forged = `${id}.${Math.floor(now / 1000) + 999999}.${mac}`;
  assert.ok(!cookie.isValidMfaCookie(forged, 7, "session-a", now), "extended expiry");
});

test("cookie header is HttpOnly and SameSite=Strict", () => {
  const header = cookie.serializeMfaCookie("x", 60, true);
  assert.match(header, /HttpOnly/);
  assert.match(header, /SameSite=Strict/);
  assert.match(header, /Secure/);
  assert.equal(cookie.readCookie("a=1; dts-mfa=abc.def; b=2", "dts-mfa"), "abc.def");
});
