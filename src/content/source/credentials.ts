import type { CredentialGroup } from "../types";

/*
 * Verification gate (PROJECT.md §7). Values below come from founder-supplied sources
 * (see docs/CONTENT_PROVENANCE.md) but stay verified: false until the founder confirms exact
 * wording, issuer, identifier, status and expiry. Non-production builds show them as marked
 * placeholders; production omits them. Open items are listed in docs/CONTENT_GAPS.md.
 */
export const credentialsSource: CredentialGroup[] = [
  {
    category: "qualifications",
    title: "Academic qualifications",
    items: [
      {
        id: "qual-meng",
        category: "qualifications",
        title: "Master's degree, instrumentation, control systems and automation",
        issuer: "Edith Cowan University",
        year: "2018",
        verified: false,
      },
      {
        id: "qual-bachelor",
        category: "qualifications",
        title: "Bachelor of Technology, instrumentation and control engineering",
        issuer: "SNMIMT, Maliankara",
        year: "2011",
        verified: false,
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
        identifier: "TBD — CLIENT",
        year: "2024",
        url: "https://www.credly.com/badges/ac6d6a99-679d-4210-a578-ed55f8836bcd/linked_in_profile",
        verified: false,
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
        title: "ISA/IEC 62443 Expert",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "2026",
        url: "https://app.badgecert.com/public/badges/beezgnkj",
        verified: false,
      },
      {
        id: "cert-isa-62443-cfs",
        category: "certifications",
        title: "ISA/IEC 62443 Cybersecurity Fundamentals Specialist (CFS)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "2026",
        url: "https://app.badgecert.com/public/badges/ugjfxetx",
        verified: false,
      },
      {
        id: "cert-isa-62443-cras",
        category: "certifications",
        title: "ISA/IEC 62443 Cyber Risk Assessment Specialist (CRAS)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "TBD — CLIENT",
        url: "https://app.badgecert.com/public/badges/igaoyuzi",
        verified: false,
      },
      {
        id: "cert-isa-62443-cds",
        category: "certifications",
        title: "ISA/IEC 62443 Cybersecurity Design Specialist (CDS)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "TBD — CLIENT",
        url: "https://badgecert.com/bc/html/show-badge.html?b=upbqwvgu",
        verified: false,
      },
      {
        id: "cert-isa-62443-cms",
        category: "certifications",
        title: "ISA/IEC 62443 Cybersecurity Maintenance Specialist (CMS)",
        issuer: "International Society of Automation (ISA)",
        identifier: "TBD — CLIENT",
        year: "TBD — CLIENT",
        url: "https://app.badgecert.com/public/badges/pradxjmo",
        verified: false,
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
        verified: false,
      },
    ],
  },
  {
    category: "publications",
    title: "Publications",
    items: [
      {
        id: "pub-rams",
        category: "publications",
        title: "[PLACEHOLDER] RAMS symposium paper title",
        issuer: "TODO(CLIENT): confirm a publication exists; venue and authors",
        year: "TBD — CLIENT",
        verified: false,
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
          "Rockwell Automation (Allen-Bradley), Schneider Electric, GE, Yokogawa, Honeywell and ABB",
        verified: false,
      },
      {
        id: "plat-tools",
        category: "platforms",
        title: "[PLACEHOLDER] Engineering tools",
        issuer: "TODO(CLIENT): confirm tool list",
        verified: false,
      },
      {
        id: "plat-standards",
        category: "platforms",
        title: "ISA/IEC 62443",
        issuer: "Industrial automation and control system security",
        verified: false,
      },
    ],
  },
];
