import type { EnquiryData } from "./enquiry-schema";

/*
 * Saving enquiries (FR-44), inside the content seam so the Server Action never talks to Payload
 * directly. In static mode there is no database and nothing is stored (as before the CMS); in CMS
 * mode each enquiry is saved before the email is sent, so a failed email never loses it.
 * Only the form's own fields are stored: never the IP address, user agent, CAPTCHA token or
 * honeypot (03 §7, PRIV-09).
 */

export type EmailStatus = "pending" | "sent" | "failed" | "simulated";

export interface SavedEnquiry {
  id: number | string;
}

function cmsEnabled(): boolean {
  return process.env["CONTENT_SOURCE"]?.trim() === "cms";
}

/** Saves an enquiry with emailStatus "pending". Returns null in static mode. Throws if saving fails. */
export async function saveEnquiry(
  data: EnquiryData,
  typeLabel: string,
): Promise<SavedEnquiry | null> {
  if (!cmsEnabled()) return null;
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });
  const doc = await payload.create({
    collection: "enquiries",
    overrideAccess: true,
    context: { disableRevalidate: true },
    data: {
      submittedAt: new Date().toISOString(),
      name: data.name,
      workEmail: data.workEmail,
      organisation: data.organisation,
      phone: data.phone,
      enquiryTypeValue: data.enquiryType,
      enquiryTypeLabel: typeLabel,
      message: data.message,
      consent: data.consent,
      read: false,
      emailStatus: "pending",
    },
  });
  return { id: doc.id };
}

/** Records how the email notification went. `reason` is a short code, never a response body. */
export async function recordEnquiryEmail(
  saved: SavedEnquiry | null,
  status: Exclude<EmailStatus, "pending">,
  reason?: string,
): Promise<void> {
  if (!saved || !cmsEnabled()) return;
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });
  await payload.update({
    collection: "enquiries",
    id: saved.id,
    overrideAccess: true,
    context: { disableRevalidate: true },
    data: { emailStatus: status, emailError: reason ? reason.slice(0, 120) : null },
  });
}
