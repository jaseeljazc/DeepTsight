import * as React from "react";
import { cn } from "@/lib/utils";

export type SpecItem = {
  label: string;
  value: React.ReactNode;
  /** Set values that are data (standards, identifiers, dates) in mono. */
  mono?: boolean;
};

export type SpecBlockProps = {
  items: SpecItem[];
  label?: string;
  onDark?: boolean;
  density?: "default" | "compact";
  className?: string;
};

/** Ruled key/value list, set like the schedule on a drawing sheet. */
export function SpecBlock({
  items,
  label,
  onDark = false,
  density = "default",
  className,
}: SpecBlockProps) {
  const isCompact = density === "compact";
  return (
    <dl
      aria-label={label}
      className={cn("border-t", onDark ? "border-rule-dark" : "border-ink-900", className)}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "grid-spec grid gap-3 border-b",
            isCompact ? "py-1.5 lg:py-2" : "py-3",
            onDark ? "border-rule-dark" : "border-rule",
          )}
        >
          <dt
            className={cn(
              isCompact ? "text-caption" : "text-small",
              onDark ? "text-on-dark-muted" : "text-steel-600",
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              isCompact ? "text-caption" : "text-small",
              "min-w-0 wrap-anywhere",
              item.mono && "font-mono",
              onDark ? "text-on-dark" : "text-ink-900",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
