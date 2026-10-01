import type { CollectionConfig } from "payload";
import { approvalFlag, httpsUrlField, mediaField, sortOrderField } from "../fields";
import {
  collectionAfterChange,
  collectionAfterDelete,
  collectionBeforeChange,
} from "../hooks/lifecycle";
import { validateCredential, validateCredentialGroup } from "../hooks/validators";
import { CREDENTIAL_CATEGORIES, GROUPS, contentAccess, contentVersions } from "./shared";

const tags = () => ["credentials", "home"];

export const CredentialGroups: CollectionConfig = {
  slug: "credential-groups",
  labels: { singular: "Credential group", plural: "Credential groups" },
  admin: {
    group: GROUPS.credentials,
    useAsTitle: "title",
    defaultColumns: ["title", "category", "sortOrder"],
    description: "The four headings of the credentials register. One group per category.",
  },
  access: contentAccess,
  versions: contentVersions,
  defaultSort: "sortOrder",
  hooks: {
    beforeChange: [collectionBeforeChange("credential-groups", validateCredentialGroup)],
    afterChange: [collectionAfterChange("credential-groups", { tags })],
    afterDelete: [collectionAfterDelete("credential-groups", tags)],
  },
  fields: [
    {
      name: "category",
      type: "select",
      required: true,
      unique: true,
      options: CREDENTIAL_CATEGORIES,
    },
    {
      name: "title",
      type: "text",
      required: true,
      admin: { description: "Heading shown on the credentials page." },
    },
    sortOrderField(),
  ],
};

export const Credentials: CollectionConfig = {
  slug: "credentials",
  labels: { singular: "Credential", plural: "Credentials" },
  admin: {
    group: GROUPS.credentials,
    useAsTitle: "title",
    defaultColumns: ["title", "category", "issuer", "verified", "_status"],
    description:
      "Qualifications, registrations, certifications and platforms. Only verified entries appear on the live site.",
  },
  access: contentAccess,
  versions: contentVersions,
  defaultSort: "sortOrder",
  hooks: {
    beforeChange: [collectionBeforeChange("credentials", validateCredential)],
    afterChange: [collectionAfterChange("credentials", { flags: ["verified"], tags })],
    afterDelete: [collectionAfterDelete("credentials", tags)],
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
        description: "Set by the import. Not shown on the site.",
      },
    },
    { name: "category", type: "select", required: true, options: CREDENTIAL_CATEGORIES },
    { name: "title", type: "text", required: true },
    {
      name: "issuer",
      type: "text",
      required: true,
      admin: { description: "The body that issued it." },
    },
    {
      name: "identifier",
      type: "text",
      admin: { description: "Registration or certificate number, so a reader can check it." },
    },
    { name: "year", type: "text", admin: { description: "Year awarded, four digits." } },
    {
      name: "expiry",
      type: "text",
      admin: {
        description: "Expiry year, four digits. The site marks it expired after that year.",
      },
    },
    httpsUrlField("url", "Verify link", "Public page where the credential can be checked (https)."),
    mediaField("badge", "Badge", "Issuer badge artwork.", { required: false, badge: true }),
    approvalFlag(
      "verified",
      "Verified",
      "Confirmed against the issuer. Unverified credentials never appear on the live site.",
    ),
    sortOrderField(),
  ],
};
