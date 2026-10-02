import type { SiteSource } from "../types";

export const siteSource: SiteSource = {
  legalName: "DeepTsight Consulting Pty Ltd",
  displayName: "DeepTsight",
  tagline: "Deep technical insight for safer, more reliable and more secure industrial operations.",
  abn: "62 701 473 814",
  phone: "0406 899 469",
  email: "enquiries@deeptsight.com",
  // Founder's personal profile until the company page exists (docs/CONTENT_GAPS.md).
  linkedIn: "https://www.linkedin.com/in/deepak-pazhoor-a29b7b49",
  responseTime: "Within 1 business day",
  serviceArea: "Australia-wide",
  locationLabel: "Perth, Western Australia",
  // Further profiles (FR-41). LinkedIn stays in `linkedIn` above.
  socialLinks: [],
  // TODO(CLIENT): Google Maps link (FR-42, Q-12). Shown as a plain link once supplied.
  mapsUrl: undefined,
  // Office address and business hours come in a later release (FR-41, FR-43).
  showOfficeAddress: false,
  showBusinessHours: false,
  navLabels: {
    home: "Home",
    about: "About",
    services: "Services",
    credentials: "Credentials",
    insights: "Insights",
    contact: "Contact",
  },
  ctaLabels: {
    primary: "Discuss your challenge",
    secondary: "Explore capabilities",
    credentials: "View credentials",
    header: "Discuss a challenge",
  },
  uiLabels: {
    allServices: "All services",
    viewService: "View service",
    viewPrefix: "View",
    returnHome: "Return to the home page",
    connectOnLinkedIn: "Connect on LinkedIn",
    onLinkedInSuffix: "on LinkedIn",
    orEmail: "Or email",
    orCall: "or call",
    openInMaps: "Open in Google Maps",
  },
  insightsEnabled: false,
};
