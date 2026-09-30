declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
  }
}

export type AnalyticsEvent =
  | "enquiry_started"
  | "enquiry_submitted"
  | "enquiry_succeeded"
  | "enquiry_failed"
  | "form_validation_error"
  | "channel_click"
  | "cta_click"
  | "service_view"
  | "credentials_view";

/**
 * Privacy-preserving event tracking (AN-01 to AN-07, PRIV-05).
 * Strictly guards against capturing PII or form field contents (PRIV-08).
 */
export function trackEvent(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;

  // Sanitize props: forbid common personal data keys per PRIV-08 & AN-02
  const sanitizedProps: Record<string, string | number | boolean> = {};
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("email") ||
        lowerKey.includes("phone") ||
        lowerKey.includes("name") ||
        lowerKey.includes("message") ||
        lowerKey.includes("organisation") ||
        lowerKey.includes("content")
      ) {
        // Drop any potential PII fields
        continue;
      }
      sanitizedProps[key] = value;
    }
  }

  if (window.plausible) {
    window.plausible(event, { props: sanitizedProps });
  } else if (process.env.NODE_ENV !== "production") {
    // Development event trace
    console.debug(`[Analytics Event] ${event}`, sanitizedProps);
  }
}
