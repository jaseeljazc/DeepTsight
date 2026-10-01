import type { CollectionConfig, Field, FieldAccess } from "payload";
import { adminOnly, adminOnlyField, nobody } from "../access";
import { collectionAfterChange, collectionAfterDelete } from "../hooks/lifecycle";
import { GROUPS } from "./shared";

/*
 * Enquiry inbox (FR-44, PRIV-09, docs/cms/03_SECURITY_AND_OPS.md §7). Every enquiry from the
 * contact form is saved here by the Server Action (through src/content/enquiries.ts), then emailed.
 * Admin only, with MFA. No versions: deleting an enquiry removes it completely (it stays in database
 * backups until they expire). Never stored: IP address, user agent, CAPTCHA token, honeypot value.
 */

export const EMAIL_STATUSES = ["pending", "sent", "failed", "simulated"] as const;

/** Submitted data is never edited; only the read flag changes. */
const readOnly: FieldAccess = () => false;

const submitted = (field: Field): Field =>
  ({ ...field, access: { create: readOnly, update: readOnly, read: adminOnlyField } }) as Field;

const noTags = () => [];

export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "Enquiry", plural: "Enquiries" },
  admin: {
    group: GROUPS.enquiries,
    useAsTitle: "name",
    defaultColumns: ["submittedAt", "name", "workEmail", "enquiryTypeLabel", "read", "emailStatus"],
    listSearchableFields: ["name", "workEmail", "organisation", "message"],
    description:
      "Every enquiry sent through the contact form. Search by name, email or keyword. Delete an enquiry when it is no longer needed or when the sender asks.",
    components: { beforeList: ["/cms/views/inbox-summary#InboxSummary"] },
  },
  access: {
    // Created only by the site's Server Action through the Local API (overrideAccess).
    create: nobody,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  defaultSort: "-submittedAt",
  timestamps: true,
  hooks: {
    // Audit entries for enquiries carry the record id and action only, never personal data.
    afterChange: [collectionAfterChange("enquiries", { tags: noTags })],
    afterDelete: [collectionAfterDelete("enquiries", noTags)],
  },
  fields: [
    submitted({
      name: "submittedAt",
      label: "Received",
      type: "date",
      required: true,
      admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } },
    }),
    {
      name: "read",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Tick once you have dealt with it." },
    },
    submitted({ name: "name", type: "text", required: true, admin: { readOnly: true } }),
    submitted({
      name: "workEmail",
      label: "Work email",
      type: "email",
      required: true,
      admin: { readOnly: true },
    }),
    submitted({ name: "organisation", type: "text", admin: { readOnly: true } }),
    submitted({ name: "phone", type: "text", admin: { readOnly: true } }),
    submitted({
      name: "enquiryTypeValue",
      label: "Area of enquiry (value)",
      type: "text",
      required: true,
      admin: { readOnly: true, hidden: true },
    }),
    submitted({
      name: "enquiryTypeLabel",
      label: "Area of enquiry",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
        description: "As the form showed it, so it stays readable if the type is later changed.",
      },
    }),
    submitted({ name: "message", type: "textarea", required: true, admin: { readOnly: true } }),
    submitted({
      name: "consent",
      label: "Agreed to the privacy notice",
      type: "checkbox",
      required: true,
      admin: { readOnly: true },
    }),
    submitted({
      name: "emailStatus",
      label: "Email notification",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: EMAIL_STATUSES.map((value) => ({ value, label: value })),
      admin: { readOnly: true, position: "sidebar" },
    }),
    submitted({
      name: "emailError",
      label: "Email problem",
      type: "text",
      admin: { readOnly: true, position: "sidebar", description: "Short reason only." },
    }),
  ],
};
