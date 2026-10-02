import { z } from "zod";
import { enquiryTypesSource } from "./source/enquiry-types";

const AREA_MESSAGE = "Select an area of enquiry";

/**
 * The enquiry form schema for a given list of enquiry-type values. The client and the Server
 * Action build it from the same list (the enabled types), so a disabled type is refused by both.
 */
export function buildEnquirySchema(values: readonly string[]) {
  const allowed = new Set(values);
  return z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    workEmail: z
      .string()
      .min(1, "Work email is required")
      .email("Enter a valid email address")
      .max(255, "Email is too long"),
    organisation: z.string().max(100, "Organisation name is too long").optional(),
    phone: z.string().max(50, "Phone number is too long").optional(),
    enquiryType: z
      .string({ errorMap: () => ({ message: AREA_MESSAGE }) })
      .refine((value) => allowed.has(value), { message: AREA_MESSAGE }),
    message: z
      .string()
      .min(1, "Message is required")
      .max(2000, "Message cannot exceed 2000 characters"),
    consent: z.boolean().refine((val) => val === true, {
      message: "Tick the consent box to send your enquiry",
    }),
  });
}

/** Enabled enquiry types from the static source, in display order. */
export const staticEnquiryTypes = enquiryTypesSource
  .filter((type) => type.enabled)
  .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

/** The schema for the static source's enabled types. */
export const enquirySchema = buildEnquirySchema(staticEnquiryTypes.map((type) => type.value));

export type EnquiryData = z.infer<typeof enquirySchema>;
