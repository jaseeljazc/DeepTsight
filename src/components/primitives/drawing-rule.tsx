import * as React from "react";
import { cn } from "@/lib/utils";

export type DrawingRuleProps = {
  onDark?: boolean;
  className?: string;
};

const COLUMNS = 12;

/**
 * A 1px rule with tick marks at the twelve column boundaries, like the border of a drawing
 * sheet. Tick lengths and weight come from globals.css (.drawing-rule). Decorative: at most once
 * per page plus the footer.
 */
export function DrawingRule({ onDark = false, className }: DrawingRuleProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("drawing-rule", onDark ? "text-rule-dark" : "text-control", className)}
    >
      {Array.from({ length: COLUMNS + 1 }, (_, i) => (
        <span
          key={i}
          className={cn("drawing-rule-tick", i % 3 === 0 && "drawing-rule-tick-major")}
          style={{ left: `${(i / COLUMNS) * 100}%` }}
        />
      ))}
    </div>
  );
}
