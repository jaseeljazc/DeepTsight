import type { SeoEntry } from "../types";

/*
 * Titles are page names only. The root layout's title template appends
 * "| DeepTsight Consulting", so the brand is not repeated here.
 */
export const seoSource: Record<string, SeoEntry> = {
  "/": {
    title: "Industrial engineering and OT cybersecurity",
    description:
      "Engineering consulting for critical infrastructure and heavy industry: control systems, ISA/IEC 62443 cybersecurity, IT/OT segregation and plant reliability.",
    canonical: "https://deeptsight.com.au",
  },
  "/about": {
    title: "About Deepak Pazhoor",
    description:
      "Founder-led industrial engineering consultancy in Perth, drawing on site commissioning and control systems work in oil and gas and mining.",
    canonical: "https://deeptsight.com.au/about",
  },
  "/services": {
    title: "Engineering and cybersecurity services",
    description:
      "Four services: control systems and E&I engineering, OT cybersecurity, IT/OT segregation and plant reliability.",
    canonical: "https://deeptsight.com.au/services",
  },
  "/credentials": {
    title: "Credentials and publications",
    description:
      "Qualifications, registrations, certifications and publications, each listed with its issuer so it can be checked.",
    canonical: "https://deeptsight.com.au/credentials",
  },
  "/insights": {
    title: "Technical insights",
    description:
      "Engineering notes on industrial automation, network segregation, functional safety and operational cyber resilience.",
    canonical: "https://deeptsight.com.au/insights",
  },
  "/services/control-systems-ei-engineering": {
    title: "Control systems and E&I engineering",
    description:
      "PLC, DCS and electrical instrumentation engineering for continuous process plants and critical utilities.",
    canonical: "https://deeptsight.com.au/services/control-systems-ei-engineering",
  },
  "/services/ot-cybersecurity": {
    title: "OT cybersecurity and architecture",
    description:
      "Industrial cybersecurity aligned with ISA/IEC 62443: security posture assessment, zone and conduit design and OT security governance.",
    canonical: "https://deeptsight.com.au/services/ot-cybersecurity",
  },
  "/services/it-ot-segregation": {
    title: "IT/OT segregation and IDMZ design",
    description:
      "Industrial DMZ architecture, firewall policy hardening and boundary design that limits lateral movement from the corporate network.",
    canonical: "https://deeptsight.com.au/services/it-ot-segregation",
  },
  "/services/plant-reliability": {
    title: "Plant reliability and asset lifecycle",
    description:
      "RAMS engineering, obsolescence strategies and instrument reliability frameworks for critical production assets.",
    canonical: "https://deeptsight.com.au/services/plant-reliability",
  },
  "/contact": {
    title: "Contact",
    description:
      "Discuss your operational challenge directly with the engineer who would do the work. Based in Perth.",
    canonical: "https://deeptsight.com.au/contact",
  },
  "/contact/thank-you": {
    title: "Enquiry received",
    description: "Your enquiry to DeepTsight Consulting has been received.",
    canonical: "https://deeptsight.com.au/contact/thank-you",
  },
  "/legal/privacy": {
    title: "Privacy notice",
    description:
      "How DeepTsight Consulting handles enquiry data under the Australian Privacy Principles.",
    canonical: "https://deeptsight.com.au/legal/privacy",
  },
  "/legal/terms": {
    title: "Website terms of use",
    description:
      "Terms of use, intellectual property and disclaimer for the DeepTsight Consulting website.",
    canonical: "https://deeptsight.com.au/legal/terms",
  },
  "/legal/accessibility": {
    title: "Accessibility statement",
    description: "WCAG 2.2 Level AA target, conformance details and how to report a barrier.",
    canonical: "https://deeptsight.com.au/legal/accessibility",
  },
};
