import type { EmailAdapter } from "payload";

/**
 * The CMS sends no email (no password-reset or verification mail, 03 §2). Without an adapter
 * Payload would print messages, tokens included, to the server log; this adapter refuses instead.
 * Enquiry notifications are sent by the site's own Server Action, not by Payload.
 */
export const noEmailAdapter: EmailAdapter = () => ({
  name: "disabled",
  defaultFromAddress: "no-reply@example.com",
  defaultFromName: "DeepTsight CMS",
  sendEmail: async () => {
    throw new Error("The CMS does not send email.");
  },
});
