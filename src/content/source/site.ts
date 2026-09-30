import type { Site } from "../types";

export const siteSource: Site = {
  legalName: "DeepTsight Consulting Pty Ltd",
  displayName: "DeepTsight",
  tagline: "Deep technical insight for safer, more reliable and more secure industrial operations.",
  abn: "62 701 473 814",
  phone: "0406 899 469",
  email: "enquiries@deeptsight.com",
  // Founder's personal profile until the company page exists (docs/CONTENT_GAPS.md).
  linkedIn: "https://www.linkedin.com/in/deepak-pazhoor-a29b7b49",
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
