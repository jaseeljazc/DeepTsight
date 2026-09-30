import { z } from "zod";

/** Enquiry areas. The values are stored in the enquiry email, so changing one is a data change. */
export const enquiryTypes = [
  "Control systems and E&I engineering",
  "OT cybersecurity and network architecture",
  "IT/OT segregation and IDMZ design",
  "Plant reliability and asset lifecycle",
  "Something else",
] as const;

export const enquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  workEmail: z
    .string()
    .min(1, "Work email is required")
    .email("Enter a valid email address")
    .max(255, "Email is too long"),
  organisation: z.string().max(100, "Organisation name is too long").optional(),
  phone: z.string().max(50, "Phone number is too long").optional(),
  enquiryType: z.enum(enquiryTypes, {
    errorMap: () => ({ message: "Select an area of enquiry" }),
  }),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message cannot exceed 2000 characters"),
  consent: z.boolean().refine((val) => val === true, {
    message: "Tick the consent box to send your enquiry",
  }),
});

export type EnquiryData = z.infer<typeof enquirySchema>;
