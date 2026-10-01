/**
 * Deletes enquiries older than the retention period (PRIV-04, PRIV-09).
 *
 *   tsx scripts/cms/purge-enquiries.ts --db DATABASE_URI [--dry-run]
 *
 * Reads ENQUIRY_RETENTION_DAYS. When it is not set, nothing is deleted and a warning is printed:
 * the retention period is the owner's decision (U-17). Deleted enquiries remain in database backups
 * until those backups expire, so the backup retention must follow the same rule.
 * Prints counts only, never enquiry content.
 */
import { argValue, parseDbEnvName, redact } from "./lib/db";
import { payloadFor } from "./lib/payload";

async function main(): Promise<void> {
  const db = parseDbEnvName(argValue("--db") ?? "DATABASE_URI");
  const raw = process.env["ENQUIRY_RETENTION_DAYS"]?.trim();
  if (!raw) {
    console.warn(
      "ENQUIRY_RETENTION_DAYS is not set: no enquiries were deleted. Set the agreed retention period (U-17) to enable purging.",
    );
    return;
  }
  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1) {
    throw new Error("ENQUIRY_RETENTION_DAYS must be a whole number of days, 1 or more.");
  }

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const where = { submittedAt: { less_than: cutoff } };
  const payload = await payloadFor(db);
  try {
    const due = await payload.count({ collection: "enquiries", where, overrideAccess: true });
    if (process.argv.includes("--dry-run")) {
      console.log(`Dry run: ${due.totalDocs} enquiries are older than ${days} days.`);
      return;
    }
    if (due.totalDocs > 0) {
      await payload.delete({
        collection: "enquiries",
        where,
        overrideAccess: true,
        context: { disableRevalidate: true },
      });
    }
    console.log(`Deleted ${due.totalDocs} enquiries older than ${days} days from ${db}.`);
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
