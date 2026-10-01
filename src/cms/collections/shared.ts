import type { CollectionConfig } from "payload";
import { adminOnly } from "../access";

/** Access for content collections: everything requires an MFA-verified admin. Public pages read
 * through the Local API on the server, never through the REST API. */
export const contentAccess: CollectionConfig["access"] = {
  read: adminOnly,
  readVersions: adminOnly,
  create: adminOnly,
  update: adminOnly,
  delete: adminOnly,
};

/** Drafts and up to 25 saved versions per document (02 Conventions). */
export const contentVersions: CollectionConfig["versions"] = {
  drafts: true,
  maxPerDoc: 25,
};

export const CREDENTIAL_CATEGORIES = [
  { label: "Qualifications", value: "qualifications" },
  { label: "Registrations", value: "registrations" },
  { label: "Certifications", value: "certifications" },
  { label: "Platforms", value: "platforms" },
];

export const GROUPS = {
  website: "Website content",
  services: "Services and proof",
  credentials: "Credentials",
  media: "Media",
  insights: "Insights",
  enquiries: "Enquiries",
  system: "System",
} as const;
