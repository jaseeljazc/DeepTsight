import type { CollectionConfig } from "payload";
import { legalStatuses } from "../../content/schema";
import { previewUrl } from "../preview-url";
import { approverOnlyField } from "../access";
import {
  collectionAfterChange,
  collectionAfterDelete,
  collectionBeforeChange,
  type TagsFor,
} from "../hooks/lifecycle";
import { validateLegalPage } from "../hooks/validators";
import { GROUPS, contentAccess, contentVersions } from "./shared";

const tags: TagsFor = (doc) => [`legal:${String(doc["slug"] ?? "")}`, "seo"];

export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
  labels: { singular: "Legal page", plural: "Legal pages" },
  admin: {
    group: GROUPS.website,
    preview: (doc) => previewUrl(`/legal/${String(doc["slug"] ?? "")}`),
    useAsTitle: "title",
    defaultColumns: ["title", "status", "lastUpdated", "_status"],
    description:
      "Privacy notice, terms of use and accessibility statement. Wording must come from the client's adviser; do not edit it yourself.",
  },
  access: contentAccess,
  versions: contentVersions,
  hooks: {
    beforeChange: [collectionBeforeChange("legal-pages", validateLegalPage)],
    afterChange: [collectionAfterChange("legal-pages", { flags: ["status"], tags })],
    afterDelete: [collectionAfterDelete("legal-pages", tags)],
  },
  fields: [
    {
      name: "slug",
      type: "select",
      required: true,
      unique: true,
      options: [
        { label: "Privacy notice", value: "privacy" },
        { label: "Terms of use", value: "terms" },
        { label: "Accessibility statement", value: "accessibility" },
      ],
      admin: { description: "Which page this is. The web address is fixed." },
    },
    { name: "title", type: "text", required: true },
    {
      name: "lastUpdated",
      label: "Last updated",
      type: "text",
      required: true,
      admin: { description: "As shown on the page, for example “September 2026”." },
    },
    {
      name: "reference",
      type: "text",
      required: true,
      admin: {
        description: "Shown in the document details, for example “Privacy Act 1988 (Cth), APPs”.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending-adviser",
      options: legalStatuses.map((value) => ({
        value,
        label: value === "approved" ? "Approved by adviser" : "Pending adviser approval",
      })),
      access: { create: approverOnlyField, update: approverOnlyField },
      admin: {
        position: "sidebar",
        description:
          "Approvers only; every change is logged. Set to approved only when the adviser has approved the wording.",
      },
    },
    {
      name: "sections",
      type: "array",
      minRows: 1,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "content", type: "textarea", required: true },
      ],
    },
  ],
};
