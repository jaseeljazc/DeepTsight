import * as React from "react";
import { cn } from "@/lib/utils";

export type RailTagProps = {
  /** The section's name. The terminal number (T01, T02 ...) is generated per page. */
  label: string;
  className?: string;
};

/**
 * A numbered terminal at the top of a Home section, and the section's stretch of the rail: a line
 * just left of the content that fills as the section scrolls in. The terminal square sits on the
 * rail and a hairline taps it across to the label. It only repeats the section's own heading, so
 * it is hidden from assistive technology. Place it directly inside a section, in a `.rail-page`
 * scope, above a `<Container rail>`.
 */
export function RailTag({ label, className }: RailTagProps) {
  return (
    <>
      <span aria-hidden="true" className="rail-seg">
        <span className="rail-seg-fill" />
      </span>
      <div aria-hidden="true" className={cn("rail-tag-row", className)}>
        <span className="rail-marker" />
        <span className="rail-tap" />
        <p className="rail-tag text-caption font-mono">
          <span className="rail-code" /> · {label}
        </p>
      </div>
    </>
  );
}
