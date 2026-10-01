import type { LegalPage } from "../../types";
import { siteSource } from "../site";

export const accessibilitySource: LegalPage = {
  slug: "accessibility",
  title: "Accessibility statement",
  lastUpdated: "September 2026",
  // Becomes "approved" only when the client's adviser has approved the wording.
  status: "pending-adviser",
  sections: [
    {
      title: "1. Conformance target",
      content:
        "This website is built and tested to conform with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.",
    },
    {
      title: "2. Technical measures",
      content:
        "Accessibility measures on this website include: colour contrast of at least 4.5:1 for standard text and 3:1 for interactive controls; visible 2px focus indicators on all focusable elements; full keyboard operability without traps; semantic HTML landmarks; and layouts that work from 320px to 2560px wide without loss of content.",
    },
    {
      title: "3. Compatibility and testing",
      content:
        "The site is tested with axe-core and manual keyboard walkthroughs. [PLACEHOLDER] TODO(CLIENT): confirm screen reader and high-contrast testing.",
    },
    {
      title: "4. Feedback and contact",
      content: `If you find an accessibility barrier or have difficulty accessing content, email ${siteSource.email}. [PLACEHOLDER] TODO(CLIENT): confirmed response time for accessibility feedback.`,
    },
  ],
};
