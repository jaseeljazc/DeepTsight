import * as React from "react";
import { cn } from "@/lib/utils";

export type WordmarkProps = {
  onDark?: boolean;
  className?: string;
};

/**
 * Typeset wordmark. Stands in for the supplied logo file until it is added to the repo.
 * TODO(CLIENT): replace with the approved logo artwork (OPEN-01, OPEN-02, OPEN-10).
 */
export function Wordmark({ onDark = false, className }: WordmarkProps) {
  return (
    <span className={cn("flex items-baseline gap-2", className)}>
      <span
        aria-hidden="true"
        className="marker-square bg-primary size-wordmark-mark self-center"
      />
      <span
        className={cn(
          "font-display text-wordmark font-semibold",
          onDark ? "text-on-dark" : "text-ink-900",
        )}
      >
        DeepTsight
      </span>
      <span
        className={cn(
          "xs:inline text-small hidden",
          onDark ? "text-on-dark-muted" : "text-steel-600",
        )}
      >
        Consulting
      </span>
    </span>
  );
}
