import type { EnquiryType } from "../types";

/**
 * Areas of enquiry offered by the contact form. `value` is posted by the form and written into the
 * enquiry email, so it never changes once in use; `label` is what the visitor sees.
 * The first four follow the capability statement's four capabilities (2026-10-11). The earlier
 * four are kept, switched off, so enquiries already received still read correctly.
 */
export const enquiryTypesSource: EnquiryType[] = [
  {
    value: "Control systems engineering",
    label: "Control systems engineering",
    enabled: true,
    sortOrder: 10,
  },
  {
    value: "Electrical and instrumentation",
    label: "Electrical and instrumentation",
    enabled: true,
    sortOrder: 20,
  },
  {
    value: "OT governance and asset resilience",
    label: "OT governance and asset resilience",
    enabled: true,
    sortOrder: 30,
  },
  {
    value: "OT cybersecurity and ISA/IEC 62443",
    label: "OT cybersecurity and ISA/IEC 62443",
    enabled: true,
    sortOrder: 40,
  },
  { value: "Something else", label: "Something else", enabled: true, sortOrder: 50 },
  {
    value: "Control systems and E&I engineering",
    label: "Control systems and E&I engineering",
    enabled: false,
    sortOrder: 110,
  },
  {
    value: "OT cybersecurity and network architecture",
    label: "OT cybersecurity and network architecture",
    enabled: false,
    sortOrder: 120,
  },
  {
    value: "IT/OT segregation and IDMZ design",
    label: "IT/OT segregation and IDMZ design",
    enabled: false,
    sortOrder: 130,
  },
  {
    value: "Plant reliability and asset lifecycle",
    label: "Plant reliability and asset lifecycle",
    enabled: false,
    sortOrder: 140,
  },
];
