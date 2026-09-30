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
      "Deepak Pazhoor founded DeepTsight Consulting to give critical infrastructure operators engineering and cybersecurity advice that holds up on a running plant.",
      "His career began in instrumentation construction and commissioning in oil and gas, on an LNG regasification facility and then a cross-country gas pipeline in Malaysia. After a master's in instrumentation, control systems and automation at Edith Cowan University, he worked as a control systems engineer in Perth, in mining at Hancock Iron Ore. He currently leads operations technology and control systems at ATCO Australia.",
      "Working on site makes one gap obvious: security teams can underestimate the availability constraints of industrial automation, while plant engineering teams are asked to defend systems against threats they were never designed for.",
      "DeepTsight was established in Perth, Western Australia, to close that gap, with one practitioner accountable for the engineering, the functional safety and the segregation.",
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
        "CTCI. Construction and commissioning of instrumentation on an LNG regasification facility.",
    },
    {
      period: "2013–2015",
      role: "E&I commissioning engineer",
      context:
        "Punj Lloyd Oil & Gas Malaysia. Instrumentation commissioning on a cross-country gas pipeline: loop checks, handover and start-up.",
    },
    {
      period: "2017–2019",
      role: "Intern, graduate and control system engineer",
      context: "BLOCHTECH Engineering, Perth.",
    },
    {
      period: "2019–2024",
      role: "Control system engineer, then senior control system engineer",
      context: "Hancock Iron Ore.",
    },
    {
      period: "2024–present",
      role: "Lead operations technology and control systems",
      context: "ATCO Australia, Perth.",
    },
    {
      period: "2026",
      role: "Founded DeepTsight Consulting, Perth",
      context: "Control systems, OT cybersecurity and plant reliability.",
    },
  ],
};
