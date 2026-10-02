/**
 * Adds or removes throwaway enquiries for design review (used by admin-shots.ts).
 *
 *   tsx scripts/cms/demo-enquiries.ts --db DATABASE_URI add|remove
 *
 * Every entry uses an example.com address starting "design-demo-", so removal touches nothing else.
 * Prints counts only.
 */
import { argValue, parseDbEnvName, redact } from "./lib/db";
import { payloadFor } from "./lib/payload";

const MARK = "design-demo-";
const DAY = 86_400_000;
// Days ago, and whether still unread: spread over several months.
const ROWS: [number, boolean][] = [
  [2, true],
  [9, true],
  [21, false],
  [40, false],
  [48, true],
  [75, false],
  [82, false],
  [110, true],
  [140, false],
  [150, false],
  [190, false],
  [260, true],
];

async function main(): Promise<void> {
  const db = parseDbEnvName(argValue("--db") ?? "DATABASE_URI");
  const mode = process.argv.includes("remove") ? "remove" : "add";
  const payload = await payloadFor(db);
  const context = { disableRevalidate: true, skipAudit: true };
  try {
    if (mode === "add") {
      for (const [index, [daysAgo, unread]] of ROWS.entries()) {
        await payload.create({
          collection: "enquiries",
          overrideAccess: true,
          context,
          data: {
            submittedAt: new Date(Date.now() - daysAgo * DAY).toISOString(),
            read: !unread,
            name: `Test person ${index + 1}`,
            workEmail: `${MARK}${index + 1}@example.com`,
            enquiryTypeValue: "general",
            enquiryTypeLabel: "General enquiry",
            message: "Design review sample. Not a real enquiry.",
            consent: true,
            emailStatus: "simulated",
          },
        });
      }
      console.log(`Added ${ROWS.length} demo enquiries.`);
    } else {
      const removed = await payload.delete({
        collection: "enquiries",
        overrideAccess: true,
        context,
        where: { workEmail: { like: MARK } },
      });
      console.log(`Removed ${removed.docs.length} demo enquiries.`);
    }
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
