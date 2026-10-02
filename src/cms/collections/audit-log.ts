import type { CollectionConfig } from "payload";
import { adminOnly, nobody } from "../access";

export const AUDIT_ACTIONS = [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "login",
  "login-blocked",
  "mfa-enrolled",
  "mfa-verified",
  "mfa-failed",
  "recovery-code-used",
  "flag-change",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/**
 * Append-only record of who did what (docs/cms/03_SECURITY_AND_OPS.md §5). Written only by server
 * hooks through the Local API. Nobody can create, change or delete entries through the API or the
 * admin. Enquiry entries carry the record id and the action, never personal data.
 */
export const AuditLog: CollectionConfig = {
  slug: "audit-log",
  labels: { singular: "Audit entry", plural: "Audit log" },
  admin: {
    group: "System",
    useAsTitle: "action",
    defaultColumns: ["at", "action", "userEmail", "targetCollection", "docId", "field"],
    description:
      "Every sign-in, publish, deletion and approval change. Entries cannot be edited or deleted.",
  },
  access: {
    read: adminOnly,
    create: nobody,
    update: nobody,
    delete: nobody,
  },
  timestamps: false,
  fields: [
    {
      name: "at",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    { name: "userId", type: "text" },
    { name: "userEmail", type: "text" },
    {
      name: "action",
      type: "select",
      required: true,
      options: AUDIT_ACTIONS.map((value) => ({ label: value, value })),
    },
    { name: "targetCollection", label: "Collection or global", type: "text" },
    { name: "docId", type: "text" },
    { name: "field", type: "text" },
    { name: "from", type: "text" },
    { name: "to", type: "text" },
  ],
};
