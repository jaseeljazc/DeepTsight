import type { CollectionConfig } from "payload";
import { serviceIconNames } from "../../content/schema";
import { previewUrl } from "../preview-url";
import {
  firstPublishedAtField,
  mediaField,
  seoGroup,
  slugField,
  sortOrderField,
  stringList,
} from "../fields";
import {
  collectionAfterChange,
  collectionAfterDelete,
  collectionBeforeChange,
  type TagsFor,
} from "../hooks/lifecycle";
import { validateService } from "../hooks/validators";
import { GROUPS, contentAccess, contentVersions } from "./shared";

/** Every page lists services in the header and footer, so `services` covers the shared layout. */
const tags: TagsFor = (doc, previous) => [
  "services",
  `service:${String(doc["slug"] ?? "")}`,
  ...(previous?.["slug"] && previous["slug"] !== doc["slug"]
    ? [`service:${String(previous["slug"])}`]
    : []),
];

export const Services: CollectionConfig = {
  slug: "services",
  labels: { singular: "Service", plural: "Services" },
  admin: {
    group: GROUPS.services,
    preview: (doc) => previewUrl(`/services/${String(doc["slug"] ?? "")}`),
    useAsTitle: "title",
    defaultColumns: ["title", "enabled", "sortOrder", "_status"],
    description:
      "Each service page follows the same nine-part layout. The layout is fixed; everything written here is editable.",
  },
  access: contentAccess,
  versions: contentVersions,
  defaultSort: "sortOrder",
  hooks: {
    beforeChange: [collectionBeforeChange("services", validateService)],
    afterChange: [collectionAfterChange("services", { tags })],
    afterDelete: [collectionAfterDelete("services", tags)],
  },
  fields: [
    slugField("Web address of the service page, after /services/."),
    {
      name: "title",
      type: "text",
      required: true,
      admin: { description: "Full name of the service." },
    },
    {
      name: "shortTitle",
      label: "Short title",
      type: "text",
      required: true,
      admin: { description: "Used in the footer, tables and the “View …” links." },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: { description: "One or two sentences shown in service lists." },
    },
    {
      name: "outcome",
      type: "textarea",
      required: true,
      admin: { description: "What the client gains." },
    },
    {
      name: "icon",
      type: "select",
      required: true,
      options: serviceIconNames.map((name) => ({ label: name, value: name })),
      admin: {
        description:
          "Line icon shown beside the service title (FR-45). A fixed set; no shields, padlocks or globes.",
        components: { Field: "/cms/fields/icon-picker#IconPicker" },
      },
    },
    { name: "challenge", label: "1.0 Client challenge", type: "textarea", required: true },
    { name: "whyItMatters", label: "2.0 Why it matters", type: "textarea", required: true },
    { name: "capability", label: "3.0 Capability", type: "textarea", required: true },
    {
      name: "scopeAndOutputs",
      label: "4.0 Scope and outputs",
      type: "array",
      minRows: 1,
      admin: { description: "Each row is one area of scope with the outputs it produces." },
      fields: [
        { name: "scope", type: "text", required: true },
        stringList("outputs", "Outputs", "Deliverables for this scope.", { required: true }),
      ],
    },
    {
      name: "deliveryApproach",
      label: "5.0 Delivery approach",
      type: "array",
      minRows: 4,
      maxRows: 4,
      admin: { description: "Exactly four steps: the page's process animation shows four (D-10)." },
      fields: [
        { name: "step", type: "text", required: true, admin: { description: "For example 01." } },
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
      ],
    },
    stringList("standards", "6.0 Standards", "Standards references, the most important first.", {
      required: true,
    }),
    {
      name: "evidence",
      label: "7.0 Representative experience",
      type: "textarea",
      admin: {
        description:
          "Optional. Never name a client, site, plant or network (CLAUDE.md §6). Leave empty to show the placeholder.",
      },
    },
    {
      name: "relatedServices",
      label: "8.0 Related services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: "media",
      type: "group",
      fields: [
        mediaField("hero", "Hero image", "Wide image under the page header."),
        mediaField("detail", "Detail image", "Shown beside part 3.0 Capability."),
      ],
    },
    seoGroup(),
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description:
          "Off: the service disappears from the site, menus, related links and the sitemap.",
      },
    },
    sortOrderField(),
    firstPublishedAtField,
  ],
};
