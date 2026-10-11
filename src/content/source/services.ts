import type { Service } from "../types";

/*
 * The four core capabilities of the client's capability statement (docs/ref-pdf, 2026-10-11).
 * Titles and summaries are the statement's wording. The rest reuses the site's earlier approved
 * service copy where it covers the same work (control systems and E&I, OT cybersecurity, IT/OT
 * segregation, plant reliability) or the statement's own lists. Anything neither source covers is a
 * visible [PLACEHOLDER] for the client. Icons come from serviceIconNames in schema.ts.
 */

/** The statement's "How we work" stages, used where a service has no method of its own yet. */
const howWeWork = [
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
];

export const servicesSource: Service[] = [
  {
    slug: "control-systems-engineering",
    title: "Control systems engineering",
    shortTitle: "Control systems",
    summary: "PLC and DCS engineering, integration, upgrades, testing and commissioning.",
    outcome:
      "Reduce delivery risk, improve operability and integrate complex modifications within live industrial environments.",
    icon: "Cpu",
    challenge:
      "Ageing DCS and PLC platforms lose reliability, and the shutdown needed to upgrade them costs production.",
    whyItMatters:
      "On a heavy industrial plant, a control system outage can trigger safety trips, environmental breaches and major production losses. Modernisation must balance the target architecture against live cutover constraints.",
    capability:
      "DeepTsight provides hands-on engineering across DCS and safety PLC architectures, covering functional design, integration, upgrades, testing and live brownfield commissioning.",
    scopeAndOutputs: [
      {
        scope: "Detailed engineering and functional specifications",
        outputs: [
          "Functional design specifications (FDS)",
          "Control system architecture drawings",
          "I/O assignment and loop schematics",
          "Cause & effect matrices",
        ],
      },
      {
        scope: "Brownfield integration & migration",
        outputs: [
          "DCS to modern PLC migration schedules",
          "Cutover sequencing plans",
          "Factory acceptance testing (FAT) protocols",
          "Site commissioning records",
        ],
      },
    ],
    deliveryApproach: [
      {
        step: "01",
        title: "Assess & verify",
        description:
          "Audit physical cabinets, field wiring, network nodes and existing logic against current plant state.",
      },
      {
        step: "02",
        title: "Architect & specify",
        description:
          "Produce vendor-neutral functional design, fail-safe logic and deterministic network topologies.",
      },
      {
        step: "03",
        title: "Implement & test",
        description:
          "Configure software logic, run FAT with simulated field devices and stage hardware.",
      },
      {
        step: "04",
        title: "Commission & assure",
        description:
          "Coordinate live cutover during scheduled turnaround windows, verifying every loop before restart.",
      },
    ],
    standards: [
      "IEC 61131-3 (Programmable Controllers)",
      "IEC 61508 / IEC 61511 (Functional Safety)",
    ],
    evidence:
      "[PLACEHOLDER] Verified delivery on Tier-1 Australian resources and power generation brownfield upgrades.",
    relatedSlugs: [
      "electrical-instrumentation",
      "ot-cybersecurity-iec-62443",
      "ot-governance-asset-resilience",
    ],
    media: {
      hero: "img-service-control",
      detail: "img-hero-control-room",
    },
    seo: {
      title: "Control systems engineering",
      description:
        "PLC and DCS engineering, integration, upgrades, testing and commissioning in live industrial environments.",
      canonical: "/services/control-systems-engineering",
    },
    enabled: true,
    sortOrder: 10,
  },
  {
    slug: "electrical-instrumentation",
    title: "Electrical and instrumentation",
    shortTitle: "Electrical & instrumentation",
    summary:
      "Instrumentation design, E&I integration, field interfaces and plant modification support.",
    outcome: "[PLACEHOLDER] Approved outcome statement for electrical and instrumentation work.",
    icon: "Cable",
    challenge: "[PLACEHOLDER] Approved client challenge for electrical and instrumentation work.",
    whyItMatters:
      "[PLACEHOLDER] Approved statement of why electrical and instrumentation work matters operationally.",
    capability:
      "DeepTsight provides instrumentation design, E&I integration, field interfaces and plant modification support, including loop checking, instrumentation specification and live brownfield commissioning.",
    scopeAndOutputs: [
      {
        scope: "Design & specification",
        outputs: [
          "Control, network and instrumentation design",
          "Specifications, drawings and implementation plans",
        ],
      },
      {
        scope: "Testing, commissioning & handover",
        outputs: [
          "FAT, SAT, verification and validation",
          "Commissioning, documentation and operational readiness",
        ],
      },
    ],
    deliveryApproach: howWeWork,
    standards: ["AS/NZS 3000 (Wiring Rules)", "AS/NZS 60079 (Explosive Atmospheres)"],
    evidence: "[PLACEHOLDER] Approved, anonymised electrical and instrumentation project evidence.",
    relatedSlugs: [
      "control-systems-engineering",
      "ot-governance-asset-resilience",
      "ot-cybersecurity-iec-62443",
    ],
    media: {
      hero: "img-service-control-detail",
      detail: "img-ot-industrial-rack",
    },
    seo: {
      title: "Electrical and instrumentation",
      description:
        "Instrumentation design, E&I integration, field interfaces and plant modification support for operating plant.",
      canonical: "/services/electrical-instrumentation",
    },
    enabled: true,
    sortOrder: 20,
  },
  {
    slug: "ot-governance-asset-resilience",
    title: "OT governance and asset resilience",
    shortTitle: "OT governance",
    summary:
      "OT lifecycle governance, asset visibility, infrastructure modernisation, technical assurance and operational continuity planning.",
    outcome:
      "Improve operational resilience, prioritise capital expenditure and balance technical risk against lifecycle value.",
    icon: "Gauge",
    challenge:
      "Obsolescence, unpredictable component failures and uncoordinated upgrades lead to frequent reactive work and rising CAPEX.",
    whyItMatters:
      "High plant availability depends on systematic reliability evaluation. Engineering decisions need quantitative risk data and realistic asset lifecycle horizons.",
    capability:
      "DeepTsight provides lifecycle governance, technical oversight and operational continuity for critical assets, with reliability modelling (RAMS) and field condition assessments so asset owners can make defensible replacement and maintenance choices.",
    scopeAndOutputs: [
      {
        scope: "Obsolescence & risk assessment",
        outputs: [
          "Automation & electrical obsolescence audit",
          "Criticality & single-point-of-failure (SPOF) analysis",
          "FMECA (failure modes, effects & criticality analysis)",
          "Spare parts & recovery strategy",
        ],
      },
      {
        scope: "Lifecycle strategy & capex planning",
        outputs: [
          "10-year technology roadmap",
          "CAPEX vs OPEX prioritisation matrix",
          "Upgrade justification technical brief",
          "Availability improvement plan",
        ],
      },
      {
        scope: "Governance & sustained operations",
        outputs: [
          "Lifecycle governance and asset visibility",
          "Change, patch, backup and access reviews",
          "Performance, resilience and security improvement",
        ],
      },
    ],
    deliveryApproach: [
      {
        step: "01",
        title: "Condition & spares audit",
        description:
          "Audit physical wear, component support status, spare parts availability and historical trip logs.",
      },
      {
        step: "02",
        title: "Risk quantification",
        description:
          "Identify single points of failure in power feeds, communication backbones and PLC processors.",
      },
      {
        step: "03",
        title: "Lifecycle options analysis",
        description:
          "Develop risk-ranked replacement options, evaluating cost, shutdown requirements and extended support.",
      },
      {
        step: "04",
        title: "Execution roadmap",
        description:
          "Deliver phased upgrade schedules aligned with statutory turnarounds and capital budget cycles.",
      },
    ],
    standards: [
      "IEC 60300 (Dependability Management)",
      "ISO 55000 (Asset Management)",
      "MIL-STD-1629A / IEC 60812 (FMEA/FMECA)",
      "RAMS Engineering Principles",
    ],
    evidence:
      "[PLACEHOLDER] RAMS analysis and reliability roadmaps delivered for heavy industrial processing plants.",
    relatedSlugs: [
      "ot-cybersecurity-iec-62443",
      "control-systems-engineering",
      "electrical-instrumentation",
    ],
    media: {
      hero: "img-service-reliability",
      detail: "slot-service-reliability-detail",
    },
    seo: {
      title: "OT governance and asset resilience",
      description:
        "OT lifecycle governance, asset visibility, modernisation, technical assurance and operational continuity planning for critical assets.",
      canonical: "/services/ot-governance-asset-resilience",
    },
    enabled: true,
    sortOrder: 30,
  },
  {
    slug: "ot-cybersecurity-iec-62443",
    title: "OT cybersecurity and ISA/IEC 62443",
    shortTitle: "OT cybersecurity",
    summary:
      "Risk assessment, IT/OT segregation, Level 3.5 DMZ architecture, vulnerability roadmaps and defensible compensating controls.",
    outcome:
      "Improve visibility, segmentation and cyber resilience with controls designed around plant availability.",
    icon: "Network",
    challenge:
      "Standard corporate IT security controls (such as aggressive scanning or uncoordinated reboots) can trigger PLC halts and trip critical processes, while demands for cloud analytics and remote vendor support erode boundary defences.",
    whyItMatters:
      "Operators must defend legacy systems without compromising safety systems, deterministic cycle times or operational availability. Uncontrolled convergence creates direct pathways for enterprise ransomware to halt industrial operations.",
    capability:
      "DeepTsight applies plant engineering knowledge to cyber defence, translating ISA/IEC 62443 into practical zone and conduit designs, passive asset discovery and Purdue Model Level 3.5 industrial demilitarised zones that terminate all protocols at the boundary.",
    scopeAndOutputs: [
      {
        scope: "Risk & posture assessment",
        outputs: [
          "ISA/IEC 62443 gap assessment",
          "Passive asset inventory & taxonomy",
          "Crown jewels risk analysis",
          "Defect remediation roadmap",
        ],
      },
      {
        scope: "IT/OT segregation & industrial DMZ",
        outputs: [
          "Current-state ingress/egress traffic map",
          "Industrial DMZ architecture specification",
          "Historian & jump host broker design",
          "Remote vendor access (PAM) policy",
        ],
      },
      {
        scope: "Network architecture & hardening",
        outputs: [
          "Zone & conduit design specification",
          "OT DMZ & jump host hardening guides",
          "Industrial firewall rule base",
          "Incident response playbooks for plant operations",
        ],
      },
      {
        scope: "Governance & lifecycle security",
        outputs: [
          "OT security governance",
          "Vulnerability management",
          "Lifecycle security across operation and maintenance",
        ],
      },
    ],
    deliveryApproach: [
      {
        step: "01",
        title: "Passive inventory",
        description:
          "Capture and analyse network traffic passively, with no active probes that could destabilise sensitive PLCs.",
      },
      {
        step: "02",
        title: "Zone & conduit modelling",
        description:
          "Map industrial workflows into ISA/IEC 62443 security levels based on consequence of disruption.",
      },
      {
        step: "03",
        title: "Controlled hardening",
        description:
          "Deploy boundary filtering, dual-homed bastion access, and authenticated industrial protocol conduits.",
      },
      {
        step: "04",
        title: "Operational assurance",
        description:
          "Validate telemetry flows and establish continuous monitoring procedures that plant engineers can sustain.",
      },
    ],
    standards: [
      "ISA/IEC 62443-2-1 / 3-2 / 3-3",
      "NIST SP 800-82 Rev 3",
      "Purdue Enterprise Reference Architecture (PERA)",
      "Australian SOCI Act Compliance Guidance",
      "AESCSF (Australian Energy Sector Cyber Security Framework)",
    ],
    evidence:
      "[PLACEHOLDER] ISA/IEC 62443 architecture implemented across regulated Western Australian energy and utility assets.",
    relatedSlugs: [
      "control-systems-engineering",
      "ot-governance-asset-resilience",
      "electrical-instrumentation",
    ],
    media: {
      hero: "img-service-cyber",
      detail: "img-service-cyber-detail",
    },
    seo: {
      title: "OT cybersecurity and ISA/IEC 62443",
      description:
        "ISA/IEC 62443 risk assessment, IT/OT segregation, Level 3.5 DMZ architecture and defensible controls engineered for plant availability.",
      canonical: "/services/ot-cybersecurity-iec-62443",
    },
    enabled: true,
    sortOrder: 40,
  },
];
