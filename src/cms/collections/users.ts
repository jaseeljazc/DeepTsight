import type { CollectionConfig } from "payload";

/**
 * CMS accounts. Minimal for Phase 1; roles, MFA, lockout and access rules arrive in Phase 2
 * (docs/cms/03_SECURITY_AND_OPS.md §2–§4).
 */
export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    group: "System",
  },
  auth: true,
  fields: [],
};
