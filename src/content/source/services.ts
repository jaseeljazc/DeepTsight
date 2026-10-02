import type { Service } from "../types";

/*
 * Service icons are developer-chosen placeholders until the client picks them (TASKS.md,
 * 2026-10-01). Choices are limited to serviceIconNames in schema.ts.
 */
export const servicesSource: Service[] = [
  {
    slug: "control-systems-ei-engineering",
    title: "Control systems and E&I engineering",
    shortTitle: "Control systems & E&I",
    summary:
      "PLC, DCS and electrical instrumentation engineering for continuous process plants and critical utilities.",
    outcome:
      "Reduce delivery risk, improve operability and integrate complex modifications within live industrial environments.",
    icon: "Cpu",
    challenge:
      "Ageing DCS and PLC platforms lose reliability, and the shutdown needed to upgrade them costs production.",
    whyItMatters:
      "On a heavy industrial plant, a control system outage can trigger safety trips, environmental breaches and major production losses. Modernisation must balance the target architecture against live cutover constraints.",
    capability:
      "DeepTsight provides hands-on engineering across DCS and safety PLC architectures, covering functional design, loop checking, instrumentation specification and live brownfield commissioning.",
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
      "AS/NZS 3000 (Wiring Rules)",
      "AS/NZS 60079 (Explosive Atmospheres)",
    ],
    evidence:
      "[PLACEHOLDER] Verified delivery on Tier-1 Australian resources and power generation brownfield upgrades.",
    relatedSlugs: ["ot-cybersecurity", "it-ot-segregation", "plant-reliability"],
    media: {
      hero: "img-service-control",
      detail: "img-service-control-detail",
    },
    seo: {
      title: "Control systems and E&I engineering",
      description:
        "PLC, DCS and E&I engineering for critical infrastructure, with cutover delivery in live industrial environments.",
      canonical: "/services/control-systems-ei-engineering",
    },
    enabled: true,
    sortOrder: 10,
  },
  {
    slug: "ot-cybersecurity",
    title: "OT cybersecurity and network architecture",
    shortTitle: "OT cybersecurity",
    summary:
      "ISA/IEC 62443-aligned security architecture, asset visibility and segmentation for live industrial control networks.",
    outcome:
      "Improve visibility, segmentation and cyber resilience with controls designed around plant availability.",
    icon: "Network",
    challenge:
      "Standard corporate IT security controls (such as aggressive scanning or uncoordinated reboots) can trigger PLC halts and trip critical processes.",
    whyItMatters:
      "Operators must defend legacy systems without compromising safety systems, deterministic cycle times or operational availability.",
    capability:
      "DeepTsight applies plant engineering knowledge to cyber defence, translating ISA/IEC 62443 into practical zone and conduit designs, passive asset discovery and defensible architectures.",
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
      "Australian SOCI Act Compliance Guidance",
      "AESCSF (Australian Energy Sector Cyber Security Framework)",
    ],
    evidence:
      "[PLACEHOLDER] ISA/IEC 62443 architecture implemented across regulated Western Australian energy and utility assets.",
    relatedSlugs: ["it-ot-segregation", "control-systems-ei-engineering", "plant-reliability"],
    media: {
      hero: "img-service-cyber",
      detail: "img-service-cyber-detail",
    },
    seo: {
      title: "OT cybersecurity and network architecture",
      description:
        "ISA/IEC 62443-aligned OT cybersecurity and industrial network segmentation engineered for critical plant availability.",
      canonical: "/services/ot-cybersecurity",
    },
    enabled: true,
    sortOrder: 20,
  },
  {
    slug: "it-ot-segregation",
    title: "IT/OT segregation and industrial DMZ architecture",
    shortTitle: "IT/OT segregation",
    summary:
      "Defensible separation between corporate and control networks, without breaking essential data flows.",
    outcome:
      "Reduce attack surface exposure while preserving production telemetry, historian replication and secure remote support.",
    icon: "Split",
    challenge:
      "Business demands for cloud analytics, MES connectivity and remote vendor support frequently erode boundary defences and bridge networks insecurely.",
    whyItMatters:
      "Uncontrolled convergence creates direct pathways for enterprise ransomware to halt industrial operations. Segregation is designed to contain an incident at Level 4/5 before it reaches Level 0–3.",
    capability:
      "DeepTsight designs and implements Purdue Model Level 3.5 industrial demilitarised zones (IDMZs) that terminate all protocols at the boundary and prevent direct cross-domain routing.",
    scopeAndOutputs: [
      {
        scope: "Boundary analysis & architecture",
        outputs: [
          "Current-state ingress/egress traffic map",
          "Industrial DMZ architecture specification",
          "Historian & jump host broker design",
          "Remote vendor access (PAM) policy",
        ],
      },
      {
        scope: "Migration & validation",
        outputs: [
          "Cutover sequencing protocol",
          "Strict firewall rule set (stateful/DPI)",
          "Boundary failover verification test sheet",
          "As-built segregation documentation",
        ],
      },
    ],
    deliveryApproach: [
      {
        step: "01",
        title: "Traffic discovery",
        description:
          "Identify and document every communication path between corporate systems and plant automation.",
      },
      {
        step: "02",
        title: "IDMZ design",
        description:
          "Establish Purdue Level 3.5 with separate trust domains, dedicated authentication and proxy brokers.",
      },
      {
        step: "03",
        title: "Staged boundary cutover",
        description:
          "Implement rules in monitor mode first, verifying historian and engineering connections before enforcing drops.",
      },
      {
        step: "04",
        title: "Isolation verification",
        description:
          "Run penetration and egress leak tests to verify no direct IP routing exists across the boundary.",
      },
    ],
    standards: [
      "Purdue Enterprise Reference Architecture (PERA)",
      "ISA/IEC 62443-3-3",
      "NIST SP 800-82",
      "CISA Defending OT Environments",
    ],
    evidence:
      "[PLACEHOLDER] Segregation designs executed for multi-site processing facilities across Western Australia.",
    relatedSlugs: ["ot-cybersecurity", "control-systems-ei-engineering", "plant-reliability"],
    media: {
      hero: "img-service-idmz",
      detail: "img-service-idmz-detail",
    },
    seo: {
      title: "IT/OT segregation and IDMZ architecture",
      description:
        "Defensible boundary separation between corporate IT and plant OT using Purdue Level 3.5 architectures.",
      canonical: "/services/it-ot-segregation",
    },
    enabled: true,
    sortOrder: 30,
  },
  {
    slug: "plant-reliability",
    title: "Plant reliability and asset lifecycle engineering",
    shortTitle: "Plant reliability",
    summary:
      "Engineering analysis, failure mode risk reduction and lifecycle optimisation for ageing automation and electrical assets.",
    outcome:
      "Improve operational resilience, prioritise capital expenditure and balance technical risk against lifecycle value.",
    icon: "Gauge",
    challenge:
      "Obsolescence, unpredictable component failures and uncoordinated upgrades lead to frequent reactive work and rising CAPEX.",
    whyItMatters:
      "High plant availability depends on systematic reliability evaluation. Engineering decisions need quantitative risk data and realistic asset lifecycle horizons.",
    capability:
      "DeepTsight applies reliability modelling (RAMS) and field condition assessments so asset owners can make defensible replacement and maintenance choices.",
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
    relatedSlugs: ["control-systems-ei-engineering", "ot-cybersecurity", "it-ot-segregation"],
    media: {
      hero: "img-service-reliability",
      detail: "slot-service-reliability-detail",
    },
    seo: {
      title: "Plant reliability and asset lifecycle",
      description:
        "Reliability modelling, obsolescence audits and lifecycle engineering for critical plant automation and electrical systems.",
      canonical: "/services/plant-reliability",
    },
    enabled: true,
    sortOrder: 40,
  },
];
