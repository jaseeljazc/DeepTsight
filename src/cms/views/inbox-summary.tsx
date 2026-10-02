import * as React from "react";
import type { BeforeListServerProps } from "payload";

/**
 * Above the enquiry list: how many are unread, and how many email notifications failed (D-14).
 * A failed notification means the enquiry is saved here but did not reach the mailbox.
 */
export async function InboxSummary({ payload }: BeforeListServerProps) {
  const [unread, failed] = await Promise.all([
    payload.count({
      collection: "enquiries",
      where: { read: { equals: false } },
      overrideAccess: true,
    }),
    payload.count({
      collection: "enquiries",
      where: { emailStatus: { equals: "failed" } },
      overrideAccess: true,
    }),
  ]);
  return (
    <div role="status" style={{ display: "flex", gap: "2rem", margin: "0 0 1.5rem" }}>
      <p>
        <strong>{unread.totalDocs}</strong> unread
      </p>
      <p>
        <strong>{failed.totalDocs}</strong> email notification{failed.totalDocs === 1 ? "" : "s"}{" "}
        failed
        {failed.totalDocs > 0 ? ": these enquiries are only here, not in the mailbox." : ""}
      </p>
    </div>
  );
}
