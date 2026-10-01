import type { EnquiryType } from "../types";

/**
 * Areas of enquiry offered by the contact form. `value` is posted by the form and written into the
 * enquiry email, so it never changes once in use; `label` is what the visitor sees. The existing
 * values are the original wording, kept so nothing downstream changes.
 */
export const enquiryTypesSource: EnquiryType[] = [
  {
    value: "Control systems and E&I engineering",
    label: "Control systems and E&I engineering",
    enabled: true,
    sortOrder: 10,
  },
  {
    value: "OT cybersecurity and network architecture",
    label: "OT cybersecurity and network architecture",
    enabled: true,
    sortOrder: 20,
  },
  {
    value: "IT/OT segregation and IDMZ design",
    label: "IT/OT segregation and IDMZ design",
    enabled: true,
    sortOrder: 30,
  },
  {
    value: "Plant reliability and asset lifecycle",
    label: "Plant reliability and asset lifecycle",
    enabled: true,
    sortOrder: 40,
  },
  { value: "Something else", label: "Something else", enabled: true, sortOrder: 50 },
];
