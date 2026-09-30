import { z } from "zod";

export const seoEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  canonical: z.string(),
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

export const siteSchema = z.object({
  legalName: z.string(),
  displayName: z.string(),
  tagline: z.string(),
  abn: z.string().optional(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  linkedIn: z.string().optional(),
  nav: z.array(navItemSchema),
  ctaLabels: ctaLabelsSchema,
  insightsEnabled: z.boolean(),
});

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
  icon: z.string(),
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

export const articleSchema = articleSummarySchema.extend({
  updatedAt: z.string().optional(),
  status: z.enum(["draft", "published"]),
  body: z.string(),
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

export const finalCtaSchema = z.object({
  title: z.string(),
  supportingText: z.string(),
  ctaLabel: z.string(),
});

export const homeContentSchema = z.object({
  hero: z.object({
    headline: z.string(),
    supportingText: z.string(),
    primaryCta: z.string(),
    secondaryCta: z.string(),
    facts: z.array(
      z.object({ label: z.string(), value: z.string(), mono: z.boolean().optional() }),
    ),
  }),
  trustStrip: z.array(credentialSchema),
  media: z.object({
    hero: z.string(),
    problems: z.string(),
    perth: z.string(),
    close: z.string(),
    portrait: z.string(),
  }),
  coreCapabilitiesTitle: z.string(),
  coreCapabilitiesIntro: z.string(),
  coreCapabilities: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      outcome: z.string(),
      icon: z.string(),
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
  finalCta: finalCtaSchema,
  trustStripCopy: z.object({
    title: z.string(),
    registerLinkLabel: z.string(),
    /** Singular label per credential category. */
    categoryLabels: z.record(z.string(), z.string()),
  }),
});

export const aboutContentSchema = z.object({
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
  portrait: z.object({
    src: z.string(),
    alt: z.string(),
    caption: z.string(),
  }),
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
});

export const legalPageSchema = z.object({
  slug: z.enum(["privacy", "terms", "accessibility"]),
  title: z.string(),
  lastUpdated: z.string(),
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
});

/** Closing call to action copy. The button label is resolved from the site CTA labels by the adapter. */
const finalCtaCopySchema = finalCtaSchema.omit({ ctaLabel: true });

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
  }),
  contact: z.object({
    lead: z.string(),
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

export const enquiryOptionsSchema = z.object({
  /** Empty-value option shown before a selection is made. */
  placeholder: z.string(),
  types: z.array(z.string()),
});
