import type { PagesContent } from "../types";

/*
 * Copy that belongs to one page or template. Closing call-to-action button labels are not
 * stored here: pages take them from the site CTA labels so they stay in one place.
 */
export const pagesSource: PagesContent = {
  about: {
    finalCta: {
      title: "Talk to the engineer, not an account manager",
      supportingText:
        "Every enquiry is read by the practitioner who would do the work. Describe the challenge and the constraints around it.",
    },
  },
  services: {
    title: "Engineering, security and reliability for operating plant",
    lead: "Four disciplines delivered by one practitioner, each written around plant availability, lifecycle value and what can actually be implemented on site.",
    finalCta: {
      title: "Problems that cross disciplines",
      supportingText:
        "Most operational problems cross more than one. Describe the situation and the scope follows from it.",
    },
  },
  serviceTemplate: {
    engagement: "Founder-led",
    enquiryTitlePrefix: "Enquire about",
    supportingText:
      "Speak directly with the engineer who would do the work about your requirements, current configuration or an upcoming turnaround.",
  },
  credentials: {
    title: "Credentials and publications",
    lead: "Each item is listed with its issuer and identifier so it can be checked independently. Nothing appears here until its wording, status and expiry have been confirmed.",
    finalCta: {
      title: "Capability statements for tenders and prequalification",
      supportingText:
        "Detailed CVs, project references and supporting documents can be provided in response to a formal enquiry.",
    },
  },
  contact: {
    lead: "Describe the situation, the asset and the constraints around it. The enquiry goes directly to the practitioner who would do the work.",
    beforeYouWrite: {
      title: "Before you write",
      body: "Please do not include site names, network details or vulnerability information in this form. If the work goes ahead, a suitable channel for sensitive material is agreed first.",
    },
  },
  thankYou: {
    title: "Thank you, your enquiry has been sent",
    lead: "It has gone directly to the practitioner who would carry out the work.",
    nextStepsTitle: "What happens next",
    nextSteps: [
      {
        title: "DeepTsight reads your enquiry",
        description:
          "The practitioner reviews what you have described and whether it fits the work DeepTsight does. Response time: TBD — CLIENT.",
      },
      {
        title: "A technical conversation",
        description:
          "If it fits, you will be contacted to discuss the operational context, constraints and timing.",
      },
      {
        title: "Sensitive detail comes later",
        description:
          "Drawings, network information and site specifics are only exchanged once an appropriate agreement and channel are in place.",
      },
    ],
  },
};
