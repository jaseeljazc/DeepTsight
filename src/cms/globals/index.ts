import type { Field, GlobalConfig } from "payload";
import { socialPlatforms, weekdays, isMapsUrl } from "../../content/schema";
import { SEO_ROUTES } from "../../content/mappers";
import { adminOnly } from "../access";
import { approvalFlag, finalCtaGroup, httpsUrlField, mediaField, stringList } from "../fields";
import { globalAfterChange, globalBeforeChange } from "../hooks/lifecycle";
import {
  validateAbout,
  validateHome,
  validatePages,
  validateSeo,
  validateSite,
} from "../hooks/validators";
import { GROUPS } from "../collections/shared";

/* Singletons: site settings, Home, About, page copy and SEO by route (02 Globals). */

const globalAccess: GlobalConfig["access"] = {
  read: adminOnly,
  readVersions: adminOnly,
  update: adminOnly,
};

const globalVersions: GlobalConfig["versions"] = { drafts: true, max: 25 };

const text = (name: string, label?: string, description?: string, required = true): Field => ({
  name,
  ...(label ? { label } : {}),
  type: "text",
  required,
  ...(description ? { admin: { description } } : {}),
});

const area = (name: string, label?: string, description?: string, required = true): Field => ({
  name,
  ...(label ? { label } : {}),
  type: "textarea",
  required,
  ...(description ? { admin: { description } } : {}),
});

const titled = (name: string, label: string, extra: Field[] = []): Field => ({
  name,
  label,
  type: "array",
  fields: [text("title"), area("description"), ...extra],
});

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: {
    group: GROUPS.website,
    description: "Company and contact details, labels and switches used on every page.",
  },
  access: globalAccess,
  versions: globalVersions,
  hooks: {
    beforeChange: [globalBeforeChange("site-settings", validateSite)],
    afterChange: [
      globalAfterChange("site-settings", { flags: ["insightsEnabled"], tags: ["site"] }),
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Company",
          fields: [
            text("legalName", "Legal name", "As registered, for the footer and copyright line."),
            text("displayName", "Display name", "Short name used in emails and headings."),
            area("tagline", "Tagline"),
            text("abn", "ABN", undefined, false),
            text("address", "Address (legacy)", "Not shown on the site.", false),
          ],
        },
        {
          label: "Contact",
          fields: [
            text("phone", "Phone"),
            { name: "email", label: "Email", type: "email", required: true },
            httpsUrlField("linkedIn", "LinkedIn", "Profile or company page (https)."),
            {
              name: "socialLinks",
              label: "Other social links",
              type: "array",
              admin: { description: "Further profiles. Not shown on the site yet (FR-41)." },
              fields: [
                {
                  name: "platform",
                  type: "select",
                  required: true,
                  options: socialPlatforms.map((value) => ({ label: value, value })),
                },
                { ...httpsUrlField("url", "Address", "https only."), required: true },
              ],
            },
            text("locationLabel", "Location", "Shown wherever the site gives its location."),
            {
              name: "mapsUrl",
              label: "Google Maps link",
              type: "text",
              admin: {
                description:
                  "A plain “Open in Google Maps” link on the contact page (no embedded map). google.com/maps, maps.google.com, maps.app.goo.gl or goo.gl/maps only.",
              },
              validate: (value: unknown) =>
                value === undefined ||
                value === null ||
                value === "" ||
                (typeof value === "string" && isMapsUrl(value))
                  ? true
                  : "Use an https Google Maps link.",
            },
            text("responseTime", "Response time"),
            text("serviceArea", "Service area"),
          ],
        },
        {
          label: "Address and hours",
          description:
            "For a later release (FR-41, FR-43). Nothing here is shown until its switch is on.",
          fields: [
            {
              name: "officeAddress",
              label: "Office address",
              type: "group",
              fields: [
                text("street", "Street", undefined, false),
                text("locality", "Suburb", undefined, false),
                text("region", "State", undefined, false),
                text("postcode", "Postcode", undefined, false),
              ],
            },
            {
              name: "showOfficeAddress",
              label: "Show the office address",
              type: "checkbox",
              defaultValue: false,
            },
            {
              name: "businessHours",
              label: "Business hours",
              type: "array",
              fields: [
                {
                  name: "day",
                  type: "select",
                  required: true,
                  options: weekdays.map((value) => ({ label: value, value })),
                },
                text("opens", "Opens", "24-hour time, for example 08:30.", false),
                text("closes", "Closes", undefined, false),
                { name: "closed", type: "checkbox", defaultValue: false },
              ],
            },
            {
              name: "showBusinessHours",
              label: "Show business hours",
              type: "checkbox",
              defaultValue: false,
            },
          ],
        },
        {
          label: "Labels",
          fields: [
            {
              name: "navLabels",
              label: "Menu labels",
              type: "group",
              admin: {
                description: "The pages and their order are fixed; only the wording changes.",
              },
              fields: ["home", "about", "services", "credentials", "insights", "contact"].map(
                (key) => text(key),
              ),
            },
            {
              name: "ctaLabels",
              label: "Call-to-action labels",
              type: "group",
              fields: [
                text("primary", "Primary", "Main button, leads to the contact page."),
                text("secondary", "Secondary", "Leads to the services page."),
                text("credentials", "Credentials link"),
                text("header", "Header button"),
              ],
            },
            {
              name: "uiLabels",
              label: "Link wording",
              type: "group",
              fields: [
                text("allServices", "“All services” link"),
                text("viewService", "“View service” link"),
                text("viewPrefix", "Prefix before a service name", "For example “View”."),
                text("returnHome", "Link back to the home page"),
                text("connectOnLinkedIn", "LinkedIn link on About"),
                text(
                  "onLinkedInSuffix",
                  "After the founder's name on Contact",
                  "For example “on LinkedIn”.",
                ),
                text("orEmail", "Before the email address", "For example “Or email”."),
                text("orCall", "Before the phone number", "For example “or call”."),
                text("openInMaps", "Google Maps link"),
              ],
            },
          ],
        },
      ],
    },
    approvalFlag(
      "insightsEnabled",
      "Insights switched on",
      "Shows the Insights section and its menu link.",
    ),
  ],
};

export const Home: GlobalConfig = {
  slug: "home",
  label: "Home page",
  admin: {
    group: GROUPS.website,
    description: "Text for the nine Home sections. Their order is fixed.",
  },
  access: globalAccess,
  versions: globalVersions,
  hooks: {
    beforeChange: [globalBeforeChange("home", validateHome)],
    afterChange: [globalAfterChange("home", { tags: ["home"] })],
  },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        area("headline"),
        area("supportingText", "Supporting text"),
        {
          name: "facts",
          label: "Practice particulars",
          type: "array",
          fields: [
            text("label"),
            text("value"),
            {
              name: "mono",
              label: "Show as data (monospace)",
              type: "checkbox",
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: "trustStrip",
      label: "Credentials on record",
      type: "relationship",
      relationTo: "credentials",
      hasMany: true,
      admin: {
        description:
          "Credentials shown under the hero, in this order. Only verified ones appear on the live site.",
      },
    },
    {
      name: "trustStripCopy",
      label: "Credentials on record: wording",
      type: "group",
      fields: [
        text("title"),
        text("registerLinkLabel", "Register link"),
        {
          name: "categoryLabels",
          label: "Category labels (singular)",
          type: "group",
          fields: ["qualifications", "registrations", "certifications", "platforms"].map((key) =>
            text(key),
          ),
        },
      ],
    },
    text("coreCapabilitiesTitle", "Core capabilities: title"),
    area("coreCapabilitiesIntro", "Core capabilities: introduction"),
    {
      name: "coreCapabilities",
      label: "Core capabilities: Home wording per service",
      type: "array",
      admin: { description: "Optional shorter title and outcome for a service on Home." },
      fields: [
        { name: "service", type: "relationship", relationTo: "services", required: true },
        text("title"),
        area("outcome"),
      ],
    },
    {
      name: "whyDeepTsight",
      label: "Why DeepTsight",
      type: "group",
      fields: [
        text("title"),
        text("convergenceLabel", "Convergence label"),
        stringList("paragraphs", "Paragraphs", "One paragraph per row.", {
          required: true,
          textarea: true,
        }),
        titled("pillars", "Pillars"),
      ],
    },
    {
      name: "problemsAddressed",
      label: "Problems addressed",
      type: "group",
      fields: [
        text("title"),
        { name: "items", type: "array", fields: [area("challenge"), area("solution")] },
      ],
    },
    {
      name: "deliveryApproach",
      label: "Delivery approach",
      type: "group",
      fields: [
        text("title"),
        area("intro"),
        {
          name: "steps",
          type: "array",
          fields: [text("step"), text("title"), area("description")],
        },
      ],
    },
    text("selectedProofTitle", "Selected proof: title"),
    {
      name: "selectedProof",
      label: "Selected proof",
      type: "relationship",
      relationTo: "proof-items",
      hasMany: true,
      admin: {
        description:
          "Project notes shown on Home. Only disclosure-approved notes appear on the live site.",
      },
    },
    {
      name: "perthContext",
      label: "Location and sectors",
      type: "group",
      fields: [
        text("title"),
        area("description"),
        text("officeArea", "Office area"),
        stringList("sectors", "Sectors", "One sector per row.", { required: true }),
      ],
    },
    finalCtaGroup(),
    {
      name: "media",
      label: "Images",
      type: "group",
      fields: [
        mediaField("problems", "Problems addressed image", "Beside the problems section."),
        mediaField("why", "Why DeepTsight image", "Beside the why section."),
        mediaField("close", "Closing image", "Wide image above the closing call to action."),
      ],
    },
  ],
};

export const About: GlobalConfig = {
  slug: "about",
  label: "About page",
  admin: {
    group: GROUPS.website,
    description: "Founder, narrative, principles and career record.",
  },
  access: globalAccess,
  versions: globalVersions,
  hooks: {
    beforeChange: [globalBeforeChange("about", validateAbout)],
    afterChange: [globalAfterChange("about", { tags: ["about"] })],
  },
  fields: [
    {
      name: "founder",
      type: "group",
      admin: { description: "Also used in the search-engine description of the founder." },
      fields: [text("name"), text("jobTitle", "Job title")],
    },
    {
      name: "narrative",
      type: "group",
      fields: [
        text("title"),
        stringList("paragraphs", "Paragraphs", "The first paragraph is the page introduction.", {
          required: true,
          textarea: true,
        }),
      ],
    },
    titled("principles", "Principles"),
    {
      name: "timeline",
      label: "Career record",
      type: "array",
      admin: { description: "Never name a client site or plant (CLAUDE.md §6)." },
      fields: [text("period"), text("role"), area("context")],
    },
    {
      name: "media",
      label: "Images",
      type: "group",
      fields: [
        mediaField("portrait", "Portrait", "Founder portrait."),
        mediaField("site", "Site image", "Lower image, left."),
        mediaField("desk", "Desk image", "Lower image, right."),
      ],
    },
  ],
};

export const Pages: GlobalConfig = {
  slug: "pages",
  label: "Page introductions",
  admin: {
    group: GROUPS.website,
    description:
      "Introductions and closing text for Services, Credentials, Contact, thank-you and the service template.",
  },
  access: globalAccess,
  versions: globalVersions,
  hooks: {
    beforeChange: [globalBeforeChange("pages", validatePages)],
    afterChange: [globalAfterChange("pages", { tags: ["pages"] })],
  },
  fields: [
    { name: "about", label: "About", type: "group", fields: [finalCtaGroup()] },
    {
      name: "services",
      label: "Services",
      type: "group",
      fields: [
        text("title"),
        area("lead"),
        finalCtaGroup(),
        mediaField("figure", "Image", "Wide image under the page header."),
      ],
    },
    {
      name: "serviceTemplate",
      label: "Every service page",
      type: "group",
      fields: [
        text("engagement", "Engagement", "Value of the “Engagement” row."),
        text("enquiryTitlePrefix", "Closing title prefix", "The service name follows it."),
        area("supportingText", "Closing supporting text"),
      ],
    },
    {
      name: "credentials",
      label: "Credentials",
      type: "group",
      fields: [
        text("title"),
        area("lead"),
        finalCtaGroup(),
        mediaField("figure", "Image", "Image under the page header."),
      ],
    },
    {
      name: "contact",
      label: "Contact",
      type: "group",
      fields: [
        area("lead"),
        {
          name: "beforeYouWrite",
          label: "Before you write",
          type: "group",
          fields: [text("title"), area("body")],
        },
        mediaField("figure", "Image", "Image beside the form on wide screens."),
      ],
    },
    {
      name: "thankYou",
      label: "Thank-you page",
      type: "group",
      fields: [
        text("title"),
        area("lead"),
        text("nextStepsTitle", "Next steps: title"),
        titled("nextSteps", "Next steps"),
      ],
    },
  ],
};

const SEO_LABELS: Record<string, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  credentials: "Credentials",
  insights: "Insights",
  contact: "Contact",
  thankYou: "Thank-you page",
  privacy: "Privacy notice",
  terms: "Terms of use",
  accessibility: "Accessibility statement",
};

export const Seo: GlobalConfig = {
  slug: "seo",
  label: "Search results",
  admin: {
    group: GROUPS.website,
    description:
      "Title and description in search results for each fixed page. Service pages have their own on each service. Web addresses are generated, not typed.",
  },
  access: globalAccess,
  versions: globalVersions,
  hooks: {
    beforeChange: [globalBeforeChange("seo", validateSeo)],
    afterChange: [globalAfterChange("seo", { tags: ["seo"] })],
  },
  fields: Object.entries(SEO_ROUTES).map(([route, key]) => ({
    name: key,
    label: `${SEO_LABELS[key] ?? key} (${route})`,
    type: "group" as const,
    fields: [
      {
        name: "title",
        type: "text" as const,
        required: true,
        admin: {
          description: "Aim for 60 characters or fewer. The site name is added automatically.",
        },
      },
      {
        name: "description",
        type: "textarea" as const,
        required: true,
        admin: { description: "Aim for 160 characters or fewer." },
      },
      mediaField("ogImage", "Share image", "Optional image for social sharing.", {
        required: false,
      }),
    ],
  })),
};
