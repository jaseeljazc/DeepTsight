import type { Site } from "../types";

export const siteSource: Site = {
  legalName: "DeepTsight Pty Ltd",
  displayName: "DeepTsight Consulting",
  tagline: "Deep technical insight for safer, more reliable and more secure industrial operations.",
  abn: "[PLACEHOLDER] TBD — CLIENT",
  address: "Level 11, 191 St Georges Terrace, Perth WA 6000, Australia",
  // TODO(CLIENT): development number per docs/sources README; supply the real number.
  phone: "[PLACEHOLDER] +61 8 5550 0142",
  email: "enquiries@deeptsight.com.au",
  linkedIn: "[PLACEHOLDER] https://www.linkedin.com/company/deeptsight",
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Credentials", href: "/credentials" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ],
  ctaLabels: {
    primary: "Discuss your operational challenge",
    secondary: "Explore capabilities",
    credentials: "View credentials",
    header: "Discuss a challenge",
  },
  insightsEnabled: false,
};
