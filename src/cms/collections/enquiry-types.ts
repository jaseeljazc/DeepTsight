import type { CollectionConfig, FieldAccess } from "payload";
import { sortOrderField } from "../fields";
import { collectionAfterChange, collectionAfterDelete } from "../hooks/lifecycle";
import { GROUPS, contentAccess } from "./shared";

const tags = () => ["enquiry-types"];

/** The value is posted by the form and recorded with every enquiry, so it never changes (D-33). */
const setOnCreateOnly: FieldAccess = ({ doc }) => !doc;

/** Areas of enquiry in the contact form. No drafts: a change applies to the form straight away. */
export const EnquiryTypes: CollectionConfig = {
  slug: "enquiry-types",
  labels: { singular: "Enquiry type", plural: "Enquiry types" },
  admin: {
    group: GROUPS.enquiries,
    useAsTitle: "label",
    defaultColumns: ["label", "enabled", "sortOrder"],
    description:
      "Options in the contact form's “Area of enquiry” list. Switch one off rather than deleting it; old enquiries keep their own copy of the label.",
  },
  access: contentAccess,
  defaultSort: "sortOrder",
  hooks: {
    afterChange: [collectionAfterChange("enquiry-types", { tags })],
    afterDelete: [collectionAfterDelete("enquiry-types", tags)],
  },
  fields: [
    {
      name: "value",
      type: "text",
      required: true,
      unique: true,
      access: { update: setOnCreateOnly },
      admin: {
        description: "Stored with each enquiry. Cannot be changed after the type is created.",
      },
    },
    {
      name: "label",
      type: "text",
      required: true,
      admin: { description: "What the visitor sees." },
    },
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Off: removed from the form and refused by the server.",
      },
    },
    sortOrderField(),
  ],
};
