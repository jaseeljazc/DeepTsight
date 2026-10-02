/**
 * Deletes a CMS account and any audit-log entries that carry its address.
 *
 *   tsx scripts/cms/remove-user.ts --db DATABASE_URI --email someone@example.com
 *
 * Used to remove throwaway test accounts (admin-shots.ts) and accounts created by mistake.
 * Prints counts only.
 */
import { argValue, parseDbEnvName, redact } from "./lib/db";
import { payloadFor } from "./lib/payload";

async function main(): Promise<void> {
  const db = parseDbEnvName(argValue("--db") ?? "DATABASE_URI");
  const email = argValue("--email")?.trim().toLowerCase();
  if (!email) throw new Error("--email is required.");
  const payload = await payloadFor(db);
  try {
    const context = { disableRevalidate: true, skipAudit: true };
    const audit = await payload.delete({
      collection: "audit-log",
      where: { userEmail: { equals: email } },
      overrideAccess: true,
      context,
    });
    const users = await payload.delete({
      collection: "users",
      where: { email: { equals: email } },
      overrideAccess: true,
      context,
    });
    console.log(
      `Removed ${users.docs.length} account(s) and ${audit.docs.length} audit entr(ies) for ${email}.`,
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
