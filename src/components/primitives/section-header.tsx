import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  title: string;
  /** Document-style number ("3.0"). Only where the page has a contents list to match. */
  number?: string;
  intro?: React.ReactNode;
  /** Decorative icon set beside the title text, inside the heading (for example a service icon). */
  icon?: React.ReactNode;
  id?: string;
  as?: "h1" | "h2";
  size?: "h1" | "h2" | "part" | "display";
  onDark?: boolean;
  /** `measure` (reading width) or `narrow` (side columns). */
  introWidth?: "measure" | "narrow";
  /** `lead` for a section opening, `body` for a short note in a side column. */
  introSize?: "lead" | "body";
  className?: string;
};

/**
 * Heading plus optional intro. The number sits on a label plate beside the heading,
 * never stacked above it as an eyebrow.
 */
export function SectionHeader({
  title,
  number,
  intro,
  icon,
  id,
  as: Heading = "h2",
  size = "h2",
  onDark = false,
  introWidth = "measure",
  introSize = "lead",
  className,
}: SectionHeaderProps) {
  return (
    <div className={className}>
      <div className="flex items-start gap-4">
        {number && (
          <span className="tag-plate plate-align shrink-0" aria-hidden="true">
            {number}
          </span>
        )}
        <Heading
          id={id}
          className={cn(
            "font-display max-w-headline-lg font-medium",
            size === "display" && "text-display",
            size === "h1" && "text-h1",
            size === "h2" && "text-h2",
            size === "part" && "text-h3-lg max-w-none",
            onDark ? "text-on-dark" : "text-ink-900",
            icon && "flex items-start gap-3",
          )}
        >
          {icon}
          {icon ? <span>{title}</span> : title}
        </Heading>
      </div>
      {intro && (
        <div
          className={cn(
            "mt-6",
            introWidth === "measure" ? "measure" : "max-w-prose-sm",
            introSize === "lead" ? "text-lead" : "text-body",
            number && "sm:pl-part-indent",
            onDark ? "text-on-dark-muted" : "text-ink-700",
          )}
        >
          {intro}
        </div>
      )}
    </div>
  );
}
