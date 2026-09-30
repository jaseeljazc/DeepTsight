import * as React from "react";
import { cn } from "@/lib/utils";

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type ProcessSequenceProps = {
  steps: ProcessStep[];
  onDark?: boolean;
  /** Responsive (horizontal from lg) or always vertical, for narrow reading columns. */
  orientation?: "responsive" | "vertical";
  className?: string;
  /** Home only: extends the horizontal conductor to start from the rail on the left. */
  rail?: boolean;
};

/**
 * Ordered stages joined by one conductor. As the list scrolls through the viewport the conductor
 * fills with the brand primary and each stage's indicator lights in turn. Without scroll-timeline
 * support, or with reduced motion, every indicator is simply shown lit.
 */
export function ProcessSequence({
  steps,
  onDark = false,
  orientation = "responsive",
  className,
  rail = false,
}: ProcessSequenceProps) {
  const horizontal = orientation === "responsive";

  return (
    <div className={cn("sequence relative", !horizontal && "sequence-vertical", className)}>
      {/* Horizontal conductor, wide screens */}
      {horizontal && (
        <div
          aria-hidden="true"
          className={cn(
            "sequence-conductor-x absolute right-0 hidden lg:block",
            rail ? "sequence-conductor-rail" : "left-0",
          )}
        >
          <div className={cn("absolute inset-0", onDark ? "bg-rule-dark" : "bg-rule")} />
          <div className="sequence-fill-x sequence-conductor-fill absolute inset-0" />
        </div>
      )}
      {/* Vertical conductor, narrow screens */}
      <div
        aria-hidden="true"
        className={cn("sequence-conductor-y absolute top-2 bottom-2", horizontal && "lg:hidden")}
      >
        <div className={cn("absolute inset-0", onDark ? "bg-rule-dark" : "bg-rule")} />
        <div className="sequence-fill-y sequence-conductor-fill absolute inset-0" />
      </div>

      <ol
        className={cn(
          "relative grid grid-cols-1 gap-y-12 pl-10",
          horizontal && "lg:grid-cols-4 lg:gap-x-10 lg:pl-0",
        )}
      >
        {steps.map((step, index) => (
          <li key={step.step} className={cn("relative", horizontal && "lg:pt-12")}>
            <span
              aria-hidden="true"
              // The lamp keyframes in globals.css cover four stages; every sequence on the site has four.
              data-step={Math.min(index + 1, 4)}
              className={cn(
                "sequence-lamp sequence-lamp-size marker-square absolute top-0 -left-10",
                horizontal && "lg:left-0",
              )}
            />
            <p
              className={cn(
                "text-caption tabular font-mono",
                onDark ? "text-on-dark-muted" : "text-steel-600",
              )}
            >
              Stage {step.step}
            </p>
            <h3
              className={cn(
                "font-display text-h3-lg mt-3 font-medium",
                onDark ? "text-on-dark" : "text-ink-900",
              )}
            >
              {step.title}
            </h3>
            <p
              className={cn(
                "text-small md:text-body mt-4",
                onDark ? "text-on-dark-muted" : "text-ink-700",
              )}
            >
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
