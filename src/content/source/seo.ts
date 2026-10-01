import type { SeoEntry } from "../types";

/*
 * Titles are page names only. The root layout's title template appends
 * "| DeepTsight Consulting", so the brand is not repeated here.
 * Canonicals are paths; the origin comes from NEXT_PUBLIC_SITE_URL (src/lib/site-url.ts).
 * Service pages take their metadata from `seo` in services.ts, so they have no entry here.
 */
export const seoSource: Record<string, SeoEntry> = {
  "/": {
    title: "Industrial engineering and OT cybersecurity",
    description:
      "Engineering consulting for critical infrastructure and heavy industry: control systems, ISA/IEC 62443 cybersecurity, IT/OT segregation and plant reliability.",
    canonical: "/",
  },
  "/about": {
    title: "About Deepak Pazhoor",
    description:
      "Founder-led industrial engineering consultancy in Perth, drawing on control systems and OT work in oil and gas, mining and power generation.",
    canonical: "/about",
  },
  "/services": {
    title: "Engineering and cybersecurity services",
    description:
      "Four services: control systems and E&I engineering, OT cybersecurity, IT/OT segregation and plant reliability.",
    canonical: "/services",
  },
  "/credentials": {
    title: "Credentials",
    description:
      "Qualifications, registrations, certifications and platforms, each listed with its issuer so it can be checked.",
    canonical: "/credentials",
  },
  "/insights": {
    title: "Technical insights",
    description:
      "Engineering notes on industrial automation, network segregation, functional safety and operational cyber resilience.",
    canonical: "/insights",
  },
  "/contact": {
    title: "Contact",
    description:
      "Discuss your challenge directly with the engineer who would do the work. Based in Perth.",
    canonical: "/contact",
  },
  "/contact/thank-you": {
    title: "Enquiry received",
    description: "Your enquiry to DeepTsight Consulting has been received.",
    canonical: "/contact/thank-you",
  },
  "/legal/privacy": {
    title: "Privacy notice",
    description:
      "How DeepTsight Consulting handles enquiry data under the Australian Privacy Principles.",
    canonical: "/legal/privacy",
  },
  "/legal/terms": {
    title: "Website terms of use",
    description:
      "Terms of use, intellectual property and disclaimer for the DeepTsight Consulting website.",
    canonical: "/legal/terms",
  },
  "/legal/accessibility": {
    title: "Accessibility statement",
    description: "WCAG 2.2 Level AA target, conformance details and how to report a barrier.",
    canonical: "/legal/accessibility",
  },
};
