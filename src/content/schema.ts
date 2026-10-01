import { z } from "zod";

export const seoEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  /** Site path ("/about"). The origin is added from NEXT_PUBLIC_SITE_URL. */
  canonical: z.string().startsWith("/"),
  ogImage: z.string().optional(),
});

export const navItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const ctaLabelsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  credentials: z.string(),
  header: z.string(),
});

/** Routes in the main navigation. Routes and order are fixed in code; editors change labels (D-07). */
export const navRoutes = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "credentials", href: "/credentials" },
  { key: "insights", href: "/insights" },
  { key: "contact", href: "/contact" },
] as const;

export const navLabelsSchema = z.object({
  home: z.string(),
  about: z.string(),
  services: z.string(),
  credentials: z.string(),
  insights: z.string(),
  contact: z.string(),
});

/** Button and link wording that components used to hard-code (D-08). Destinations stay in code. */
export const uiLabelsSchema = z.object({
  allServices: z.string(),
  viewService: z.string(),
  /** Followed by the service's short title: "View control systems ...". */
  viewPrefix: z.string(),
  returnHome: z.string(),
  connectOnLinkedIn: z.string(),
  /** Follows the founder's name: "<name> on LinkedIn". */
  onLinkedInSuffix: z.string(),
  orEmail: z.string(),
  orCall: z.string(),
  openInMaps: z.string(),
});

export const socialPlatforms = [
  "linkedin",
  "x",
  "youtube",
  "github",
  "facebook",
  "instagram",
] as const;

export const socialLinkSchema = z.object({
  platform: z.enum(socialPlatforms),
  url: z.string().url().startsWith("https://"),
});

/** Hosts a Google Maps link may point to (FR-42). A plain link, never an embed. */
export const mapsHosts = [
  "www.google.com",
  "google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
];

export function isMapsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !mapsHosts.includes(url.hostname)) return false;
    if (
      url.hostname === "www.google.com" ||
      url.hostname === "google.com" ||
      url.hostname === "goo.gl"
    ) {
      return url.pathname.startsWith("/maps");
    }
    return true;
  } catch {
    return false;
  }
}

export const mapsUrlSchema = z
  .string()
  .refine(
    isMapsUrl,
    "Use an https Google Maps link (google.com/maps, maps.google.com, maps.app.goo.gl or goo.gl/maps).",
  );

export const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/** Later release (FR-41, FR-43): stored now, shown only when the matching flag is on. */
export const officeAddressSchema = z.object({
  street: z.string(),
  locality: z.string(),
  region: z.string(),
  postcode: z.string(),
});

export const businessHoursSchema = z.array(
  z.object({
    day: z.enum(weekdays),
    opens: z.string().optional(),
    closes: z.string().optional(),
    closed: z.boolean(),
  }),
);

/** Site settings as stored. The adapter adds `nav`, built from `navRoutes` and `navLabels`. */
export const siteSourceSchema = z.object({
  legalName: z.string(),
  displayName: z.string(),
  tagline: z.string(),
  abn: z.string().optional(),
  address: z.string().optional(),
  phone: z.string(),
  email: z.string().email(),
  linkedIn: z.string().optional(),
  /** Stated reply time for enquiries. */
  responseTime: z.string(),
  serviceArea: z.string(),
  /** Shown wherever the site gives its location ("Perth, Western Australia"). */
  locationLabel: z.string(),
  socialLinks: z.array(socialLinkSchema),
  mapsUrl: mapsUrlSchema.optional(),
  officeAddress: officeAddressSchema.optional(),
  showOfficeAddress: z.boolean(),
  businessHours: businessHoursSchema.optional(),
  showBusinessHours: z.boolean(),
  navLabels: navLabelsSchema,
  ctaLabels: ctaLabelsSchema,
  uiLabels: uiLabelsSchema,
  insightsEnabled: z.boolean(),
  /** Last change (CMS only). The footer's revision date when present (D-11). */
  updatedAt: z.string().optional(),
});

export const siteSchema = siteSourceSchema.extend({
  nav: z.array(navItemSchema),
});

/**
 * Icons a service may use, shown beside its title. A fixed set of Lucide line icons: no shields,
 * padlocks or globes (DESIGN.md §0.2 #6). The CMS offers these as a choice, never free text.
 */
export const serviceIconNames = [
  "Cpu",
  "Network",
  "Split",
  "Gauge",
  "Activity",
  "Cable",
  "Server",
  "Workflow",
  "Waypoints",
  "Router",
  "Cog",
  "Wrench",
] as const;

export const serviceScopeOutputSchema = z.object({
  scope: z.string(),
  outputs: z.array(z.string()),
});

export const serviceDeliveryStepSchema = z.object({
  step: z.string(),
  title: z.string(),
  description: z.string(),
});

export const serviceSchema = z.object({
  slug: z.string(),
  title: z.string(),
  shortTitle: z.string(),
  summary: z.string(),
  outcome: z.string(),
  icon: z.enum(serviceIconNames),
  challenge: z.string(),
  whyItMatters: z.string(),
  capability: z.string(),
  scopeAndOutputs: z.array(serviceScopeOutputSchema),
  deliveryApproach: z.array(serviceDeliveryStepSchema),
  standards: z.array(z.string()),
  evidence: z.string().optional(),
  relatedSlugs: z.array(z.string()),
  /** Figure ids from the media register: a photograph or a placeholder frame. */
  media: z.object({
    hero: z.string(),
    detail: z.string(),
  }),
  seo: seoEntrySchema,
  /** Off: the service disappears from every list, link and the sitemap (FR-19). */
  enabled: z.boolean(),
  /** Ascending; ties are broken by title. */
  sortOrder: z.number(),
  updatedAt: z.string().optional(),
});

export const credentialSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  issuer: z.string(),
  identifier: z.string().optional(),
  year: z.string().optional(),
  expiry: z.string().optional(),
  url: z.string().optional(),
  /** Issuer's badge artwork in public/badges, supplied by the founder. */
  badge: z.string().optional(),
  verified: z.boolean(),
});

export const credentialGroupSchema = z.object({
  category: z.string(),
  title: z.string(),
  items: z.array(credentialSchema),
});

export const proofItemSchema = z.object({
  id: z.string(),
  sector: z.string(),
  challenge: z.string(),
  outcome: z.string(),
  metric: z.string().optional(),
  disclosureApproved: z.boolean(),
});

export const articleSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  publishedAt: z.string(),
  readingMinutes: z.number(),
  tags: z.array(z.string()),
});

/** Rich text as stored by the CMS editor (Lexical JSON). Rendered to React nodes, never HTML strings. */
export const richTextSchema = z
  .object({
    root: z.object({ children: z.array(z.unknown()) }).passthrough(),
  })
  .passthrough();

export const articleSchema = articleSummarySchema.extend({
  updatedAt: z.string().optional(),
  status: z.enum(["draft", "published"]),
  body: richTextSchema,
});

export const mediaAssetSchema = z.object({
  id: z.string(),
  src: z.string(),
  alt: z.string(),
  /** Figure caption shown beneath the image. Doubles as the rights attribution line. */
  caption: z.string(),
  width: z.number(),
  height: z.number(),
  source: z.string(),
  licence: z.string(),
  usageRights: z.string(),
  attribution: z.string().optional(),
  approvedForPublic: z.boolean(),
});

/** A reserved image position with no approved photograph yet. Renders as a marked frame. */
export const imageSlotSchema = z.object({
  id: z.string(),
  subject: z.string(),
  caption: z.string(),
  /** Relative path of the generation brief under docs/image-prompts/. */
  promptRef: z.string(),
});

export const figureSchema = z.discriminatedUnion("kind", [
  mediaAssetSchema.extend({ kind: z.literal("image") }),
  imageSlotSchema.extend({ kind: z.literal("slot") }),
]);

/** Closing call to action as rendered. The button label always comes from `site.ctaLabels`. */
export const finalCtaSchema = z.object({
  title: z.string(),
  supportingText: z.string(),
  ctaLabel: z.string(),
});

/** Closing call to action copy as stored. The adapter's callers add the label from the site. */
const finalCtaCopySchema = finalCtaSchema.omit({ ctaLabel: true });

export const homeContentSchema = z.object({
  hero: z.object({
    headline: z.string(),
    supportingText: z.string(),
    facts: z.array(
      z.object({ label: z.string(), value: z.string(), mono: z.boolean().optional() }),
    ),
  }),
  trustStrip: z.array(credentialSchema),
  media: z.object({
    problems: z.string(),
    why: z.string(),
    close: z.string(),
  }),
  coreCapabilitiesTitle: z.string(),
  coreCapabilitiesIntro: z.string(),
  /**
   * Home-specific short title and outcome per service, keyed by service slug. Optional: a
   * service without an entry shows its own title and outcome (FR-19).
   */
  coreCapabilities: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      outcome: z.string(),
    }),
  ),
  whyDeepTsight: z.object({
    title: z.string(),
    convergenceLabel: z.string(),
    paragraphs: z.array(z.string()),
    pillars: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    ),
  }),
  problemsAddressed: z.object({
    title: z.string(),
    items: z.array(
      z.object({
        challenge: z.string(),
        solution: z.string(),
      }),
    ),
  }),
  deliveryApproach: z.object({
    title: z.string(),
    intro: z.string(),
    steps: z.array(
      z.object({
        step: z.string(),
        title: z.string(),
        description: z.string(),
      }),
    ),
  }),
  selectedProofTitle: z.string(),
  selectedProof: z.array(proofItemSchema),
  perthContext: z.object({
    title: z.string(),
    description: z.string(),
    officeArea: z.string(),
    sectors: z.array(z.string()),
  }),
  finalCta: finalCtaCopySchema,
  updatedAt: z.string().optional(),
  trustStripCopy: z.object({
    title: z.string(),
    registerLinkLabel: z.string(),
    /** Singular label per credential category. */
    categoryLabels: z.record(z.string(), z.string()),
  }),
});

/**
 * Home content as stored. The trust strip holds credential ids; the adapter resolves them against
 * the credentials register, so each credential is recorded once.
 */
export const homeSourceSchema = homeContentSchema
  .omit({ trustStrip: true })
  .extend({ trustStripIds: z.array(z.string()) });

export const aboutContentSchema = z.object({
  /** For the Person structured data on About. */
  founder: z.object({
    name: z.string(),
    jobTitle: z.string(),
  }),
  narrative: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()),
  }),
  principles: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
  /** Figure ids from the media register. */
  media: z.object({
    portrait: z.string(),
    site: z.string(),
    desk: z.string(),
  }),
  timeline: z.array(
    z.object({
      period: z.string(),
      role: z.string(),
      context: z.string(),
    }),
  ),
  updatedAt: z.string().optional(),
});

export const legalStatuses = ["pending-adviser", "approved"] as const;

export const legalPageSchema = z.object({
  slug: z.enum(["privacy", "terms", "accessibility"]),
  title: z.string(),
  lastUpdated: z.string(),
  /** Shown in the document details ("Privacy Act 1988 (Cth), APPs"). */
  reference: z.string(),
  /** Set by an approver only once the client's adviser has approved the wording. */
  status: z.enum(legalStatuses),
  updatedAt: z.string().optional(),
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
});

const pageIntroSchema = z.object({
  title: z.string(),
  lead: z.string(),
});

/** Copy that belongs to a single page or template rather than to a shared entity. */
export const pagesContentSchema = z.object({
  about: z.object({
    finalCta: finalCtaCopySchema,
  }),
  services: pageIntroSchema.extend({
    finalCta: finalCtaCopySchema,
    /** Figure id from the media register, shown under the page header. */
    figure: z.string(),
  }),
  serviceTemplate: z.object({
    /** Value of the "Engagement" row in the service particulars block. */
    engagement: z.string(),
    /** The service name follows this prefix in the closing call to action title. */
    enquiryTitlePrefix: z.string(),
    supportingText: z.string(),
  }),
  credentials: pageIntroSchema.extend({
    finalCta: finalCtaCopySchema,
    figure: z.string(),
  }),
  contact: z.object({
    lead: z.string(),
    figure: z.string(),
    beforeYouWrite: z.object({
      title: z.string(),
      body: z.string(),
    }),
  }),
  thankYou: pageIntroSchema.extend({
    nextStepsTitle: z.string(),
    nextSteps: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    ),
  }),
});

/**
 * An area of enquiry as stored. `value` is what the form posts and the email records, so it never
 * changes once created; `label` is what the visitor sees.
 */
export const enquiryTypeSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  enabled: z.boolean(),
  sortOrder: z.number(),
});

export const enquiryOptionsSchema = z.object({
  /** Empty-value option shown before a selection is made. */
  placeholder: z.string(),
  types: z.array(z.object({ value: z.string(), label: z.string() })),
});
