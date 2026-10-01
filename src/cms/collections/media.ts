import path from "node:path";
import type { Access, CollectionConfig, FieldAccess, Where } from "payload";
import { isProductionSite } from "../../lib/public-env";
import { adminOnlyField, isAdmin } from "../access";
import { approvalFlag } from "../fields";
import {
  collectionAfterChange,
  collectionAfterDelete,
  collectionBeforeChange,
} from "../hooks/lifecycle";
import { validateMedia } from "../hooks/validators";
import { GROUPS, contentAccess, contentVersions } from "./shared";

const tags = () => ["media"];

export const MEDIA_DIR = path.resolve(process.cwd(), ".data", "media");

/**
 * Files must be readable by visitors because pages show them. Outside production every file is
 * readable (unapproved images render as marked mocks, as today); on the live site only approved,
 * published images are (03 §8).
 */
const readMedia: Access = ({ req }) => {
  if (isAdmin(req)) return true;
  if (!isProductionSite) return true;
  const publicOnly: Where = {
    and: [{ approvedForPublic: { equals: true } }, { _status: { equals: "published" } }],
  };
  return publicOnly;
};

/** Rights records are internal: hidden from anonymous reads. */
const rightsField: FieldAccess = adminOnlyField;

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Media item", plural: "Media" },
  admin: {
    group: GROUPS.media,
    useAsTitle: "caption",
    defaultColumns: ["filename", "caption", "assetClass", "approvedForPublic", "_status"],
    description:
      "Images with their rights records. An image appears on the live site only once an approver marks it approved for public use. Never upload photographs that show a client site, plant, equipment tags or screens.",
  },
  access: { ...contentAccess, read: readMedia },
  versions: contentVersions,
  upload: {
    staticDir: MEDIA_DIR,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    // Reserved image positions (slots) have a brief but no file yet.
    filesRequiredOnCreate: false,
  },
  hooks: {
    beforeChange: [collectionBeforeChange("media", validateMedia)],
    afterChange: [collectionAfterChange("media", { flags: ["approvedForPublic"], tags })],
    afterDelete: [collectionAfterDelete("media", tags)],
  },
  fields: [
    {
      name: "legacyId",
      label: "Reference id",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set by the import. Pages refer to images by this id.",
      },
    },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "image",
      options: [
        { label: "Image", value: "image" },
        { label: "Reserved position (no image yet)", value: "slot" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "assetClass",
      label: "Type",
      type: "select",
      required: true,
      defaultValue: "photograph",
      options: [
        { label: "Photograph", value: "photograph" },
        { label: "Illustration", value: "illustration" },
        { label: "Issuer badge", value: "issuer-badge" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "alt",
      label: "Alternative text",
      type: "text",
      admin: {
        description:
          "Describe what the image shows for people who cannot see it. Required unless decorative.",
        condition: (data) => data?.["kind"] !== "slot",
      },
    },
    {
      name: "decorative",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Tick only if the image adds nothing to the text; it is then hidden from screen readers.",
        condition: (data) => data?.["kind"] !== "slot",
      },
    },
    {
      name: "caption",
      type: "text",
      admin: {
        description:
          "Shown under the image as a numbered figure caption. Doubles as the attribution line.",
      },
    },
    {
      name: "subject",
      type: "text",
      admin: {
        description: "What the photograph for this position should show.",
        condition: (data) => data?.["kind"] === "slot",
      },
    },
    {
      name: "promptRef",
      label: "Brief",
      type: "text",
      admin: {
        description: "Path of the photography brief under docs/image-prompts/.",
        condition: (data) => data?.["kind"] === "slot",
      },
    },
    {
      name: "source",
      type: "text",
      access: { read: rightsField },
      admin: { description: "Where the image came from." },
    },
    { name: "licence", type: "text", access: { read: rightsField } },
    { name: "usageRights", label: "Usage rights", type: "text", access: { read: rightsField } },
    { name: "attribution", type: "text", access: { read: rightsField } },
    approvalFlag(
      "approvedForPublic",
      "Approved for public use",
      "Rights confirmed and the image is safe to publish. Unapproved images never appear on the live site.",
    ),
  ],
};
