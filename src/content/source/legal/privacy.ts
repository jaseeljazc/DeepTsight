import type { LegalPage } from "../../types";
import { siteSource } from "../site";

export const privacySource: LegalPage = {
  slug: "privacy",
  title: "Privacy notice",
  lastUpdated: "September 2026",
  sections: [
    {
      title: "1. Overview",
      content:
        "DeepTsight Pty Ltd ('DeepTsight Consulting' or 'DeepTsight') handles your personal information in accordance with the Australian Privacy Principles (APPs) in the Privacy Act 1988 (Cth). This notice explains how DeepTsight collects, handles and stores information provided through this website.",
    },
    {
      title: "2. Information collected",
      content:
        "DeepTsight collects personal information only when you choose to submit the enquiry form. This includes your name, work email address, organisation, phone number (optional) and a description of your operational challenge. DeepTsight does not collect sensitive information, plant drawings, network topology details or credentials through this website.",
    },
    {
      title: "3. Purpose of collection",
      content:
        "Information submitted through the enquiry form is used only to evaluate and respond to your enquiry, to hold commercial discussions and to deliver agreed engineering consulting services. DeepTsight does not sell, rent or trade contact information to third parties.",
    },
    // TODO(CLIENT): confirm retention period and analytics (OPEN-08)
    {
      title: "4. Data storage and processing",
      content:
        "Enquiries submitted on this website are sent over HTTPS and delivered by a transactional email service (Resend) directly to DeepTsight's authorised mailbox. No enquiry messages or personal contact details are stored in a website database. Email records are retained for a maximum of 24 months, then securely deleted.",
    },
    {
      title: "5. Cookies and analytics",
      content:
        "This website does not use tracking cookies, cross-site trackers, session recording tools or third-party marketing pixels. It uses privacy-preserving, cookieless analytics that do not collect personally identifiable information.",
    },
    {
      title: "6. Your rights and contact",
      content: `You have the right to request access to, or correction of, any personal information DeepTsight holds about you. For privacy questions or requests, email ${siteSource.email}.`,
    },
  ],
};
