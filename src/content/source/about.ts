import type { AboutContent } from "../types";

/*
 * Career dates, employers and role titles come from founder-supplied sources
 * (docs/CONTENT_PROVENANCE.md). Project, facility and client names are deliberately omitted
 * (CLAUDE.md §6).
 */
export const aboutSource: AboutContent = {
  narrative: {
    title: "Engineering judgement formed on operating industrial assets",
    paragraphs: [
      "Deepak Pazhoor founded DeepTsight to provide critical infrastructure operators with engineering and cybersecurity expertise that holds up on a running plant. He brings 15 years of experience across Australia and Southeast Asia in power generation, energy and mining.",
      "His career began in October 2011 in Cochin, in instrumentation construction and commissioning for an LNG regasification facility, followed by a cross-country gas pipeline in Malaysia. After a Master of Engineering in instrumentation, control systems and automation at Edith Cowan University, he began his Perth-based career at Blochtech Engineering. He then worked as a senior control systems engineer in mining with Hancock Iron Ore, before leading operations technology and control systems at ATCO Power.",
      "Working on site makes one gap obvious: IT security teams can underestimate the availability constraints of industrial automation, while plant engineering teams are asked to defend systems against cyber threats they were never designed for.",
      "DeepTsight was established in Perth, Western Australia, to close that gap, giving asset owners a single, highly qualified practitioner accountable for OT engineering, functional safety and secure segregation.",
    ],
  },
  principles: [
    {
      title: "Availability first",
      description:
        "No security control or engineering recommendation is acceptable if it puts continuous operation or safety functions at risk.",
    },
    {
      title: "Evidence over assumption",
      description:
        "Field wiring, logic state and network traffic are checked as they are, not as old drawings say they should be.",
    },
    {
      title: "Direct accountability",
      description:
        "Clients work with the engineer who assesses the architecture and stands behind the cutover.",
    },
    {
      title: "Plain language",
      description:
        "Operational risk and technical trade-offs are explained in clear commercial and engineering terms.",
    },
  ],
  portrait: {
    src: "/images/founder-portrait.jpg",
    alt: "Portrait placeholder for the founder. Mock image, not a photograph of the founder.",
    caption: "[PLACEHOLDER] Founder portrait pending an approved photograph",
  },
  media: {
    portrait: "img-portrait-founder",
    site: "slot-about-site",
    desk: "slot-about-desk",
  },
  timeline: [
    {
      period: "2011–2012",
      role: "Instrumentation supervisor",
      context:
        "CTCI India Engineering and Construction. Construction and commissioning of instrumentation on an LNG regasification facility.",
    },
    {
      period: "2013–2015",
      role: "E&I commissioning engineer",
      context:
        "Punj Lloyd Oil and Gas Malaysia. Instrumentation commissioning on a cross-country gas pipeline, including gas turbine-driven compressors and remote power systems.",
    },
    {
      period: "2017–2019",
      role: "Graduate intern, graduate control systems engineer, then control systems engineer",
      context: "Blochtech Engineering, Perth.",
    },
    {
      period: "2019–2024",
      role: "Engineer, then senior engineer, control systems (NPI)",
      context: "Roy Hill Iron Ore. Control systems for iron ore mining operations.",
    },
    {
      period: "2024–2026",
      role: "Lead operational technology",
      context:
        "ATCO Australia. Governance of OT applications and process control systems on power generation assets: IT/OT segregation, AESCSF SP2 compliance, ISA/IEC 62443 network architecture and SCADA upgrades.",
    },
    {
      period: "2026–present",
      role: "Founder and principal consultant",
      context:
        "DeepTsight Consulting Pty Ltd, Perth. OT cybersecurity and control systems, aligned with AS/NZS IEC 62443 and the SOCI Act.",
    },
  ],
};
