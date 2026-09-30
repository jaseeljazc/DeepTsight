"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

export function TrackEventOnMount({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    trackEvent(event, props);
  }, [event, props]);

  return null;
}
