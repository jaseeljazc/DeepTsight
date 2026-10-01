import type { LegalPage } from "../../types";

export const termsSource: LegalPage = {
  slug: "terms",
  title: "Website terms of use",
  lastUpdated: "September 2026",
  // Becomes "approved" only when the client's adviser has approved the wording.
  status: "pending-adviser",
  sections: [
    {
      title: "1. Acceptance of terms",
      content:
        "By accessing and using this website, you agree to be bound by these Terms of Use and the Privacy Notice. If you do not agree with any part of these terms, you must not use this website.",
    },
    {
      title: "2. Not professional engineering advice",
      content:
        "The content published on this website is for general information and to describe capability only. It does not constitute formal engineering advice, design verification or safety certification for any specific plant, facility or control system. Formal engineering advice requires a signed consulting engagement agreement and site-specific evaluation.",
    },
    {
      title: "3. Intellectual property",
      content:
        "All content, text, graphics, logos and design elements on this website are the property of DeepTsight Pty Ltd and are protected by Australian and international copyright and intellectual property laws. Unauthorised reproduction or distribution is prohibited.",
    },
    {
      title: "4. Limitation of liability",
      content:
        "To the maximum extent permitted by law, DeepTsight Pty Ltd excludes all liability for any loss, damage or expense arising directly or indirectly from your use of, or reliance on, the general content of this website.",
    },
    {
      title: "5. Governing law",
      content:
        "These Terms of Use are governed by and construed in accordance with the laws of Western Australia. Any disputes arising in connection with this website shall be subject to the exclusive jurisdiction of the courts of Western Australia.",
    },
  ],
};
