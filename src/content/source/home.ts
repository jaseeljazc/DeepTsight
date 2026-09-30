import type { HomeContent } from "../types";

/*
 * Trust strip and selected proof entries are unverified drafts. They stay gated
 * (verified / disclosureApproved = false) until the client confirms exact wording,
 * status and permission. In non-production builds they render as marked placeholders.
 */
export const homeSource: HomeContent = {
  hero: {
    headline:
      "Deep technical insight for safer, more reliable and more secure industrial operations.",
    supportingText:
      "DeepTsight combines hands-on control systems and E&I engineering experience with practical OT cybersecurity and reliability thinking to solve complex operational challenges without losing sight of plant availability, lifecycle value or implementation reality.",
    primaryCta: "Discuss your operational challenge",
    secondaryCta: "Explore capabilities",
    facts: [
      { label: "Based", value: "Perth, Western Australia" },
      { label: "Disciplines", value: "Control systems, OT security, segregation, reliability" },
      { label: "Standards", value: "ISA/IEC 62443", mono: true },
      { label: "Engagement", value: "Founder-led" },
    ],
  },
  media: {
    hero: "img-hero-control-room",
    problems: "img-ot-industrial-rack",
    perth: "img-perth-industrial-hub",
    close: "slot-home-close",
    portrait: "img-portrait-founder",
  },
  trustStrip: [
    {
      id: "cred-meng",
      category: "qualifications",
      title: "Master's degree, instrumentation, control systems and automation",
      issuer: "Edith Cowan University",
      verified: false,
    },
    {
      id: "cred-peng",
      category: "registrations",
      title: "Chartered Professional Engineer (CPEng)",
      issuer: "Engineers Australia",
      verified: false,
    },
    {
      id: "cred-isa-62443",
      category: "certifications",
      title: "ISA/IEC 62443 Expert",
      issuer: "International Society of Automation (ISA)",
      verified: false,
    },
    {
      id: "cred-cap",
      category: "certifications",
      title: "Certified Automation Professional (CAP®)",
      issuer: "International Society of Automation (ISA)",
      verified: false,
    },
  ],
  trustStripCopy: {
    title: "Credentials on record",
    registerLinkLabel: "View the full register",
    categoryLabels: {
      qualifications: "Qualification",
      registrations: "Registration",
      certifications: "Certification",
      publications: "Publication",
      platforms: "Platforms",
    },
  },
  coreCapabilitiesTitle: "Core capabilities",
  coreCapabilitiesIntro:
    "One practitioner across four disciplines, so each recommendation accounts for the other three.",
  coreCapabilities: [
    {
      slug: "control-systems-ei-engineering",
      title: "Control systems and E&I engineering",
      outcome:
        "Reduce delivery risk, improve operability and integrate change within live industrial environments.",
      icon: "Cpu",
    },
    {
      slug: "ot-cybersecurity",
      title: "OT cybersecurity and network architecture",
      outcome:
        "Improve visibility, segmentation and resilience with controls that respect plant availability.",
      icon: "ShieldCheck",
    },
    {
      slug: "it-ot-segregation",
      title: "IT/OT segregation",
      outcome:
        "Reduce exposure while preserving the operational data flows and supportability the plant depends on.",
      icon: "Network",
    },
    {
      slug: "plant-reliability",
      title: "Plant reliability and asset lifecycle",
      outcome:
        "Improve resilience, prioritise expenditure and balance technical risk against lifecycle cost.",
      icon: "Activity",
    },
  ],
  whyDeepTsight: {
    title: "Why DeepTsight",
    convergenceLabel: "One accountable practitioner",
    paragraphs: [
      "Cybersecurity advice can recommend controls that disrupt plant availability. Reliability studies can lack hands-on control system and communications depth. Engineering upgrades can treat cybersecurity as an afterthought.",
      "DeepTsight was founded to bring these disciplines together under one senior practitioner.",
    ],
    pillars: [
      {
        title: "Founder-led accountability",
        description:
          "You work directly with the practitioner who assesses, designs and validates the solution.",
      },
      {
        title: "Site-grounded judgement",
        description:
          "Recommendations are shaped by site experience on operating assets, not by theory alone.",
      },
      {
        title: "Integrated disciplines",
        description:
          "Each recommendation weighs control logic, security segmentation and asset lifecycle together.",
      },
    ],
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
  deliveryApproach: {
    title: "A method built around a running plant",
    intro: "Four stages, each ending in a deliverable the plant can check before the next begins.",
    steps: [
      {
        step: "01",
        title: "Assess",
        description:
          "Establish the real current state: cabinets, logic, network flows and operating constraints.",
      },
      {
        step: "02",
        title: "Architect",
        description:
          "Produce functional specifications, zone and conduit definitions and cutover protocols.",
      },
      {
        step: "03",
        title: "Implement",
        description:
          "Stage and test configurations before site arrival, so commissioning confirms rather than discovers.",
      },
      {
        step: "04",
        title: "Assure",
        description:
          "Commission during planned windows, validate every change and hand over as-built documentation.",
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
    title: "Based in Perth, working across critical infrastructure",
    description: "Operators of critical infrastructure and heavy industry.",
    officeArea: "Perth, Western Australia",
    sectors: [
      "Heavy industry",
      "Resources",
      "Utilities",
      "Critical infrastructure",
      "[PLACEHOLDER] Service area — TODO(CLIENT) (OPEN-03)",
    ],
  },
  finalCta: {
    title: "Talk through an operational challenge",
    supportingText:
      "Speak directly with Deepak Pazhoor about control systems, OT security architecture or plant reliability.",
    ctaLabel: "Discuss your operational challenge",
  },
};
