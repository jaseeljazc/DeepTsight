import type { CollectionConfig } from "payload";
import { approvalFlag } from "../fields";
import {
  collectionAfterChange,
  collectionAfterDelete,
  collectionBeforeChange,
} from "../hooks/lifecycle";
import { validateProofItem } from "../hooks/validators";
import { GROUPS, contentAccess, contentVersions } from "./shared";

const tags = () => ["home"];

/** Selected project notes on Home. Never a client, site, plant or network name (CLAUDE.md §6). */
export const ProofItems: CollectionConfig = {
  slug: "proof-items",
  labels: { singular: "Project note", plural: "Project notes" },
  admin: {
    group: GROUPS.services,
    useAsTitle: "sector",
    defaultColumns: ["sector", "disclosureApproved", "_status"],
    description:
      "Short, anonymised project notes for the Home page. Never include a client, site, plant or network name, or anything that identifies a third party's infrastructure.",
  },
  access: contentAccess,
  versions: contentVersions,
  hooks: {
    beforeChange: [collectionBeforeChange("proof-items", validateProofItem)],
    afterChange: [collectionAfterChange("proof-items", { flags: ["disclosureApproved"], tags })],
    afterDelete: [collectionAfterDelete("proof-items", tags)],
  },
  fields: [
    {
      name: "legacyId",
      label: "Reference id",
      type: "text",
      unique: true,
      index: true,
      admin: { position: "sidebar", readOnly: true, description: "Set by the import." },
    },
    {
      name: "sector",
      type: "text",
      required: true,
      admin: { description: "For example “Mining”." },
    },
    { name: "challenge", type: "textarea", required: true },
    { name: "outcome", type: "textarea", required: true },
    { name: "metric", type: "text", admin: { description: "Optional measurable result." } },
    approvalFlag(
      "disclosureApproved",
      "Disclosure approved",
      "The client has agreed this may be published. Unapproved notes never appear on the live site.",
    ),
    {
      name: "noIdentifyingDetailsConfirmed",
      label: "Contains no client, site or plant names",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Must be ticked before this note can be published.",
      },
    },
  ],
};
