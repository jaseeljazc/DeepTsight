import type { HomeSource } from "../types";

/*
 * Wording marked "capability statement" comes from the client's DeepTsight Capability Statement
 * (docs/ref-pdf, 2026-10-11). The trust strip lists ids from the credentials register
 * (credentials.ts), so each credential is recorded once. CTA labels come from site.ts.
 * Selected proof entries are unverified drafts, gated by disclosureApproved = false until the
 * client confirms wording and permission. In non-production builds they render as marked placeholders.
 */
export const homeSource: HomeSource = {
  hero: {
    // Capability statement, page 1.
    headline: "Precision and innovation in control systems and operational technology.",
    supportingText:
      "DeepTsight combines hands-on control systems and E&I engineering experience with practical OT cybersecurity and reliability thinking, keeping plant availability in view.",
    facts: [
      { label: "Based", value: "Perth, WA. Working Australia-wide" },
      { label: "Disciplines", value: "Control systems, E&I, OT governance, OT security" },
      { label: "Standards", value: "ISA/IEC 62443", mono: true },
      // { label: "Engagement", value: "Founder-led" },
    ],
  },
  media: {
    problems: "img-ot-industrial-rack",
    why: "img-services-facility",
    close: "img-home-close",
  },
  trustStripIds: ["qual-meng", "reg-peng", "cert-isa-62443", "cert-cap"],
  trustStripCopy: {
    title: "Credentials on record",
    registerLinkLabel: "View the full register",
    categoryLabels: {
      qualifications: "Qualification",
      registrations: "Registration",
      certifications: "Certification",
      platforms: "Platforms",
    },
  },
  // Capability statement, page 3.
  coreCapabilitiesTitle: "Integrated expertise across control, field and cyber layers",
  coreCapabilitiesIntro:
    "Practical engineering capability shaped by complex brownfield, live-plant and critical-infrastructure environments.",
  coreCapabilities: [
    {
      slug: "control-systems-engineering",
      title: "Control systems engineering",
      outcome: "PLC and DCS engineering, integration, upgrades, testing and commissioning.",
    },
    {
      slug: "electrical-instrumentation",
      title: "Electrical and instrumentation",
      outcome:
        "Instrumentation design, E&I integration, field interfaces and plant modification support.",
    },
    {
      slug: "ot-governance-asset-resilience",
      title: "OT governance and asset resilience",
      outcome:
        "OT lifecycle governance, asset visibility, infrastructure modernisation, technical assurance and operational continuity planning.",
    },
    {
      slug: "ot-cybersecurity-iec-62443",
      title: "OT cybersecurity and ISA/IEC 62443",
      outcome:
        "Risk assessment, IT/OT segregation, Level 3.5 DMZ architecture, vulnerability roadmaps and defensible compensating controls.",
    },
  ],
  // Capability statement, page 2 (About us), with the site's earlier case for one practitioner.
  whyDeepTsight: {
    title: "Engineering clarity for complex industrial systems",
    convergenceLabel: "One accountable practitioner",
    paragraphs: [
      "DeepTsight is a specialist engineering and technology consultancy helping critical infrastructure and heavy-industry operators improve the performance, resilience and security of operational environments.",
      "Cybersecurity advice can recommend controls that disrupt plant availability. Reliability studies can lack hands-on control system and communications depth. Engineering upgrades can treat cybersecurity as an afterthought. DeepTsight brings these disciplines together under one senior practitioner.",
    ],
    pillars: [
      { title: "See", description: "Reveal technical risk, constraints and root causes." },
      {
        title: "Connect",
        description: "Align control, electrical, instrumentation and security decisions.",
      },
      {
        title: "Deliver",
        description: "Turn insight into practical, plant-aware engineering outcomes.",
      },
    ],
    mission:
      "Deliver premium, technology-driven engineering solutions that hold up in live industrial environments.",
  },
  problemsAddressed: {
    title: "Operational problems addressed",
    items: [
      {
        challenge: "Complex brownfield upgrades",
        solution:
          "Planning control system cutovers around scheduled turnaround windows, so the upgrade does not become the outage.",
      },
      {
        challenge: "Uncontrolled network convergence",
        solution:
          "Replacing flat or multi-homed connections between corporate IT and control networks with a defined, supportable boundary.",
      },
      {
        challenge: "Standards and regulatory obligations",
        solution:
          "Translating ISA/IEC 62443 and SOCI Act obligations into engineering remediations that asset owners can sustain.",
      },
      {
        challenge: "Automation obsolescence and spares risk",
        solution:
          "Building defensible replacement roadmaps for ageing control systems and field instrumentation before a failure forces the decision.",
      },
    ],
  },
  // Capability statement, page 6 (How we work).
  deliveryApproach: {
    title: "From uncertainty to confident execution",
    intro:
      "A disciplined path that integrates operational context, engineering rigour and cyber resilience.",
    steps: [
      {
        step: "01",
        title: "Discover",
        description: "Understand the asset, constraints and decision context.",
      },
      {
        step: "02",
        title: "Define",
        description: "Frame risk, requirements and practical options.",
      },
      {
        step: "03",
        title: "Engineer",
        description: "Develop fit-for-purpose designs and implementation plans.",
      },
      {
        step: "04",
        title: "Assure",
        description: "Verify readiness, quality, security and operational acceptance.",
      },
    ],
    values: [
      {
        title: "Reliability",
        description: "Protect plant availability and operational continuity.",
      },
      {
        title: "Cost optimisation",
        description: "Prioritise practical investments and lifecycle value.",
      },
      {
        title: "Specialist depth",
        description: "Access premium expertise without unnecessary overhead.",
      },
    ],
  },
  selectedProofTitle: "Selected project notes",
  selectedProof: [
    {
      id: "proof-power-generation",
      sector: "[PLACEHOLDER] Power generation",
      challenge:
        "[PLACEHOLDER] Anonymised project summary: control system modernisation on an operating generation asset.",
      outcome: "TODO(CLIENT): approved outcome wording and disclosure permission.",
      disclosureApproved: false,
    },
    {
      id: "proof-water-utility",
      sector: "[PLACEHOLDER] Water and utilities",
      challenge:
        "[PLACEHOLDER] Anonymised project summary: network segregation aligned to ISA/IEC 62443 zones.",
      outcome: "TODO(CLIENT): approved outcome wording and disclosure permission.",
      disclosureApproved: false,
    },
  ],
  perthContext: {
    title: "Based in Perth, working across Australia",
    description: "Operators of critical infrastructure and heavy industry, anywhere in Australia.",
    officeArea: "Perth, Western Australia",
    // Capability statement, page 4 (sector exposure and the industries it pictures).
    sectors: [
      { name: "LNG and gas", illustration: "sector-oil-gas-upstream" },
      { name: "Oil and gas downstream", illustration: "sector-oil-gas-downstream" },
      { name: "Mining and resources", illustration: "sector-mining" },
      { name: "Water infrastructure", illustration: "sector-water" },
      { name: "Power generation", illustration: "sector-power" },
      { name: "Remote operations", illustration: "sector-remote-operations" },
      { name: "Critical infrastructure", illustration: "sector-critical-infrastructure" },
    ],
  },
  // Capability statement, page 8.
  finalCta: {
    title: "Let’s build resilient industrial systems",
    supportingText:
      "Engage DeepTsight for specialist control systems engineering, automation and OT cybersecurity services designed around real operational constraints.",
  },
};
