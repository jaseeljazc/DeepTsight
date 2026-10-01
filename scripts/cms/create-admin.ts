/**
 * Creates a CMS account with MFA already enrolled. The only way to create an account
 * (docs/cms/03_SECURITY_AND_OPS.md §2).
 *
 *   tsx scripts/cms/create-admin.ts --db DATABASE_URI --email editor@example.com \
 *     [--name "Test Editor"] [--roles editor,approver] [--out .data/dev-admin.txt] [--json]
 *
 * Writes the password, the TOTP key and the recovery codes to the --out file (git-ignored, owner
 * read/write only) and prints only the file path. Add the TOTP key to an authenticator app, then
 * delete the file or move its contents to a password manager.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { argValue, parseDbEnvName, redact } from "./lib/db";
import { payloadFor } from "./lib/payload";
import { ALLOW_ACCOUNT_CREATION } from "../../src/cms/collections/users";
import { ROLES, type Role } from "../../src/cms/access";
import { encryptSecret, generateRecoveryCodes, hashRecoveryCode } from "../../src/cms/mfa/crypto";
import { generateTotpSecret, otpauthUri } from "../../src/cms/mfa/totp";

async function main(): Promise<void> {
  const db = parseDbEnvName(argValue("--db") ?? "DATABASE_URI");
  const email = argValue("--email")?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("--email is required.");
  const name = argValue("--name") ?? "";
  const roles = (argValue("--roles") ?? "editor,approver").split(",").map((role) => role.trim());
  if (roles.length === 0 || !roles.every((role) => (ROLES as readonly string[]).includes(role))) {
    throw new Error(`--roles must be a comma-separated list of ${ROLES.join(", ")}.`);
  }
  const out = path.resolve(argValue("--out") ?? path.join(".data", "dev-admin.txt"));
  if (!out.startsWith(path.resolve(".data") + path.sep)) {
    throw new Error("--out must be inside .data/ (git-ignored).");
  }

  const payload = await payloadFor(db);
  try {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    });
    if (existing.totalDocs > 0) throw new Error(`An account for ${email} already exists.`);

    const password = crypto.randomBytes(18).toString("base64url");
    const secret = generateTotpSecret();
    const codes = generateRecoveryCodes();
    const user = await payload.create({
      collection: "users",
      overrideAccess: true,
      showHiddenFields: true,
      context: { [ALLOW_ACCOUNT_CREATION]: true },
      data: {
        email,
        password,
        name,
        roles: roles as Role[],
        totpSecret: encryptSecret(secret),
        recoveryCodeHashes: codes.map(hashRecoveryCode),
        mfaEnrolledAt: new Date().toISOString(),
      },
    });

    fs.mkdirSync(path.dirname(out), { recursive: true });
    const details = process.argv.includes("--json")
      ? JSON.stringify(
          { email, password, roles, totpSecret: secret, recoveryCodes: codes },
          null,
          2,
        )
      : [
          `CMS account (created ${new Date().toISOString()}, database ${db})`,
          `Email: ${email}`,
          `Password: ${password}`,
          `Roles: ${roles.join(", ")}`,
          "",
          "Authenticator app: add an account by key (time-based, 6 digits, SHA-1, 30 s).",
          `Key: ${secret}`,
          `otpauth URI: ${otpauthUri(secret, email, "DeepTsight CMS")}`,
          "",
          "Recovery codes (each works once):",
          ...codes,
          "",
        ].join("\n");
    fs.writeFileSync(out, details, { mode: 0o600 });
    console.log(
      `Created account ${user.id} for ${email}. Sign-in details written to ${path.relative(process.cwd(), out)}.`,
    );
  } finally {
    await payload.destroy();
  }
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(redact(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  },
);
