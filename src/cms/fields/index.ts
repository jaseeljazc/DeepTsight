import type { ArrayField, Field, FieldAccess, GroupField, TextField, UploadField } from "payload";
import { approverOnlyField } from "../access";

/*
 * Field builders shared by the collections and globals, so each rule is written once:
 * plain-English descriptions, string lists, slugs locked after publish (D-09), approval flags
 * (approver only, audited), media references and SEO groups.
 */

/** A Zod `string[]` as a Payload array with one text column. Mappers flatten it back. */
export function stringList(
  name: string,
  label: string,
  description: string,
  options: { required?: boolean; textarea?: boolean; minRows?: number } = {},
): ArrayField {
  return {
    name,
    label,
    type: "array",
    minRows: options.minRows ?? (options.required ? 1 : 0),
    admin: { description },
    fields: [
      options.textarea
        ? { name: "value", label: "Text", type: "textarea", required: true }
        : { name: "value", label: "Text", type: "text", required: true },
    ],
  };
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Web address part. Lowercase letters, digits and hyphens. Locked once the document has been
 * published, because there is no redirect manager yet (D-09, SEO-10).
 */
export function slugField(description: string): TextField {
  const lockedAfterPublish: FieldAccess = ({ doc }) =>
    !(doc as { firstPublishedAt?: string | null } | undefined)?.firstPublishedAt;
  return {
    name: "slug",
    type: "text",
    required: true,
    unique: true,
    index: true,
    access: { update: lockedAfterPublish },
    admin: {
      description: `${description} Lowercase letters, numbers and hyphens. Cannot be changed after the first publish.`,
    },
    validate: (value: unknown) =>
      typeof value === "string" && SLUG_PATTERN.test(value)
        ? true
        : "Use lowercase letters, numbers and single hyphens only.",
  };
}

/** Set on the first publish; locks the slug. Not editable. */
export const firstPublishedAtField: Field = {
  name: "firstPublishedAt",
  type: "date",
  admin: {
    readOnly: true,
    position: "sidebar",
    description: "Set automatically on first publish.",
  },
  access: { update: () => false, create: () => false },
};

export function sortOrderField(): Field {
  return {
    name: "sortOrder",
    type: "number",
    defaultValue: 100,
    required: true,
    admin: {
      position: "sidebar",
      description: "Lower numbers appear first. Items with the same number are sorted by title.",
    },
  };
}

/**
 * An approval flag (verified, disclosure approved, approved for public, insights enabled). Only an
 * approver with a verified second factor can change it; editors see it read-only. Every change is
 * written to the audit log by the owning collection's hooks (03 §4–§5).
 */
export function approvalFlag(name: string, label: string, description: string): Field {
  return {
    name,
    label,
    type: "checkbox",
    defaultValue: false,
    access: { create: approverOnlyField, update: approverOnlyField },
    admin: {
      position: "sidebar",
      description: `${description} Approvers only; every change is logged.`,
    },
  };
}

export function mediaField(
  name: string,
  label: string,
  description: string,
  options: { required?: boolean; badge?: boolean } = {},
): UploadField {
  return {
    name,
    label,
    type: "upload",
    relationTo: "media",
    required: options.required ?? true,
    ...(options.badge ? { filterOptions: { assetClass: { equals: "issuer-badge" } } } : {}),
    admin: {
      description: `${description} Never upload photographs that show a client site, plant, equipment tags or screens (CLAUDE.md §6).`,
    },
  };
}

/** Title and description for search results. Length hints only; nothing is blocked. */
export function seoGroup(
  name = "seo",
  label = "Search result",
  options: { shareImage?: boolean } = {},
): GroupField {
  return {
    name,
    label,
    type: "group",
    admin: {
      description:
        "How this page appears in search results. The web address is generated from the page, not typed here.",
    },
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
        admin: {
          description: "Aim for 60 characters or fewer. The site name is added automatically.",
        },
      },
      {
        name: "description",
        type: "textarea",
        required: true,
        admin: { description: "Aim for 160 characters or fewer." },
      },
      ...(options.shareImage
        ? [
            mediaField(
              "ogImage",
              "Share image",
              "Optional picture shown when a link to this page is shared. Only approved images are used.",
              { required: false },
            ),
          ]
        : []),
    ],
  };
}

export function finalCtaGroup(name = "finalCta", label = "Closing call to action"): GroupField {
  return {
    name,
    label,
    type: "group",
    admin: { description: "The button wording comes from Site settings → Call-to-action labels." },
    fields: [
      { name: "title", type: "text", required: true },
      { name: "supportingText", label: "Supporting text", type: "textarea", required: true },
    ],
  };
}

/** Optional https link. */
export function httpsUrlField(name: string, label: string, description: string): TextField {
  return {
    name,
    label,
    type: "text",
    admin: { description },
    validate: (value: unknown) =>
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "string" && /^https:\/\/\S+$/.test(value))
        ? true
        : "Use a full https:// address.",
  };
}
