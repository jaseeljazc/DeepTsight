import type { CredentialGroup } from "../types";

/*
 * Verification gate (PROJECT.md §7). The founder confirmed every entry as verified on 2026-09-30
 * and supplied the badge artwork in public/badges. Sources are in docs/CONTENT_PROVENANCE.md.
 * Set verified: false on any entry that lapses; production then omits it.
 */
export const credentialsSource: CredentialGroup[] = [
  {
    category: "qualifications",
    title: "Academic qualifications",
    items: [
      {
        id: "qual-meng",
        category: "qualifications",
        title: "Master's degree, instrumentation, control and automation",
        issuer: "Edith Cowan University",
        year: "2018",
        verified: true,
      },
      {
        id: "qual-bachelor",
        category: "qualifications",
        title: "Bachelor of Technology, instrumentation and control engineering",
        issuer: "SNM Institute of Management and Technology (Mahatma Gandhi University, Kerala)",
        year: "2011",
        verified: true,
      },
    ],
  },
  {
    category: "registrations",
    title: "Professional registrations",
    items: [
      {
        id: "reg-peng",
        category: "registrations",
        title: "Chartered Professional Engineer (CPEng)",
        issuer: "Engineers Australia",
        identifier: "Engineers Australia ID 5938911",
        year: "2024",
        url: "https://www.credly.com/badges/ac6d6a99-679d-4210-a578-ed55f8836bcd/linked_in_profile",
        badge: "/badges/ea-cpeng.png",
        verified: true,
      },
      {
        id: "reg-ner",
        category: "registrations",
        title: "National Engineering Register (NER), active and renewed yearly",
        issuer: "Engineers Australia",
        identifier: "Engineers Australia ID 5938911",
        url: "https://www.credly.com/badges/7de02515-6ab1-4726-9e10-db7a649ac2cf/linked_in_profile",
        badge: "/badges/ea-ner.png",
        verified: true,
      },
    ],
  },
  {
    category: "certifications",
    title: "Certifications",
    items: [
      {
        id: "cert-isa-62443",
        category: "certifications",
        title: "ISA/IEC 62443 Cybersecurity Expert",
        issuer: "International Society of Automation (ISA)",
        // No credential number is issued; verified through the ISA credential directory.
        year: "2026",
        url: "https://connect.isa.org/profile?UserKey=f4f07311-93ae-4087-a99c-018a07258587",
        badge: "/badges/isa-62443-expert.png",
        verified: true,
      },
      {
        id: "cert-isa-62443-cfs",
        category: "certifications",
        title: "ISA/IEC 62443 Cybersecurity Fundamentals Specialist (CFS)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "2026",
        url: "https://app.badgecert.com/public/badges/ugjfxetx",
        badge: "/badges/isa-62443-cfs.png",
        verified: true,
      },
      {
        id: "cert-isa-62443-cras",
        category: "certifications",
        title: "ISA/IEC 62443 Cyber Risk Assessment Specialist (CRAS)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "2026",
        url: "https://app.badgecert.com/public/badges/igaoyuzi",
        badge: "/badges/isa-62443-cras.png",
        verified: true,
      },
      {
        id: "cert-isa-62443-cds",
        category: "certifications",
        title: "ISA/IEC 62443 Cybersecurity Design Specialist (CDS)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "2026",
        url: "https://badgecert.com/bc/html/show-badge.html?b=upbqwvgu",
        badge: "/badges/isa-62443-cds.png",
        verified: true,
      },
      {
        id: "cert-isa-62443-cms",
        category: "certifications",
        title: "ISA/IEC 62443 Cybersecurity Maintenance Specialist (CMS)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "2026",
        url: "https://app.badgecert.com/public/badges/pradxjmo",
        badge: "/badges/isa-62443-cms.png",
        verified: true,
      },
      {
        id: "cert-cap",
        category: "certifications",
        title: "Certified Automation Professional (CAP®)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "2025",
        expiry: "2028",
        url: "https://app.badgecert.com/public/badges/cshxdszy",
        badge: "/badges/isa-cap.png",
        verified: true,
      },
    ],
  },
  {
    category: "platforms",
    title: "Platforms and standards",
    items: [
      {
        id: "plat-control",
        category: "platforms",
        title: "PLC, RTU, SCADA and DCS",
        issuer:
          "Rockwell Automation (Allen-Bradley), Siemens, Schneider Electric, GE, Yokogawa, Honeywell and ABB",
        verified: true,
      },
      {
        id: "plat-tools",
        category: "platforms",
        title: "Control, SCADA and safety system software",
        issuer:
          "FactoryTalk View SE, Studio 5000 Logix Designer, FactoryTalk AssetCentre, RSLogix 500, GE iFIX, AVEVA System Platform, Wonderware, Yokogawa Centum VP, ProSafe-RS and Stardom",
        verified: true,
      },
      {
        id: "plat-telemetry",
        category: "platforms",
        title: "Historian, telemetry and industrial networks",
        issuer:
          "OSIsoft PI, ClearSCADA, SCADAPack E series and Miri RTUs, Stratix 8300 Layer 3 switching, 4RF Aprisa SR+, Schneider Trio Q radios and VSAT",
        verified: true,
      },
      {
        id: "plat-standards",
        category: "platforms",
        title: "ISA/IEC 62443 and AS/NZS IEC 62443",
        issuer: "Industrial automation and control system security",
        verified: true,
      },
      {
        id: "plat-regulation",
        category: "platforms",
        title: "SOCI Act and AESCSF",
        issuer: "Critical infrastructure security obligations and energy sector cyber security maturity",
        verified: true,
      },
    ],
  },
];
