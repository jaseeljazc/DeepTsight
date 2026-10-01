/**
 * Resets a CMS account's password and clears any lockout. There is no reset email
 * (docs/cms/03_SECURITY_AND_OPS.md §2); this script is the reset path.
 *
 *   tsx scripts/cms/reset-admin-password.ts --db DATABASE_URI --email editor@example.com [--reset-mfa]
 *
 * --reset-mfa also removes the authenticator and recovery codes, so the account sets up a new
 * authenticator at its next sign-in. Use it only when the phone and the recovery codes are lost.
 * The new password goes to a file in .data/ (git-ignored); only the path is printed.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { argValue, parseDbEnvName, redact, timestamp } from "./lib/db";
import { payloadFor } from "./lib/payload";

async function main(): Promise<void> {
  const db = parseDbEnvName(argValue("--db") ?? "DATABASE_URI");
  const email = argValue("--email")?.trim().toLowerCase();
  if (!email) throw new Error("--email is required.");
  const resetMfa = process.argv.includes("--reset-mfa");

  const payload = await payloadFor(db);
  try {
    const found = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    });
    const user = found.docs[0];
    if (!user) throw new Error(`No account for ${email}.`);

    const password = crypto.randomBytes(18).toString("base64url");
    await payload.update({
      collection: "users",
      id: user.id,
      overrideAccess: true,
      showHiddenFields: true,
      data: {
        password,
        ...(resetMfa
          ? {
              totpSecret: null,
              pendingTotpSecret: null,
              recoveryCodeHashes: [],
              totpLastStep: null,
            }
          : {}),
      },
    });
    await payload.unlock({ collection: "users", data: { email }, overrideAccess: true });

    const out = path.resolve(".data", `password-reset-${timestamp()}.txt`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(
      out,
      `CMS password reset ${new Date().toISOString()} (${db})\nEmail: ${email}\nPassword: ${password}\n${resetMfa ? "Authenticator removed: set up a new one at the next sign-in.\n" : ""}`,
      { mode: 0o600 },
    );
    console.log(`Password reset for ${email}; details in ${path.relative(process.cwd(), out)}.`);
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
