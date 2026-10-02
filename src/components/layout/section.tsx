import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionGround = "ground" | "ground-deep" | "panel" | "ink";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  ground?: SectionGround;
  spacing?: "default" | "tight" | "strip" | "none";
  hasBorderTop?: boolean;
};

const groundClasses: Record<SectionGround, string> = {
  ground: "bg-ground text-ink-700",
  "ground-deep": "bg-ground-deep text-ink-700",
  panel: "bg-panel text-ink-700",
  ink: "on-dark bg-ink-900 text-on-dark-muted",
};

export function Section({
  ground = "ground",
  spacing = "default",
  hasBorderTop = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "w-full",
        groundClasses[ground],
        spacing === "default" && "section-y",
        spacing === "tight" && "section-y-tight",
        spacing === "strip" && "section-y-strip",
        hasBorderTop && (ground === "ink" ? "border-rule-dark border-t" : "border-rule border-t"),
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
