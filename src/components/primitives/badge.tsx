import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "default" | "pending";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  onDark?: boolean;
  /**
   * `default` is a ruled mono label for standards references and identifiers.
   * `pending` is a dashed sans label for a state awaiting sign-off ("Not approved"),
   * matching the dashed outline of placeholder content.
   */
  tone?: BadgeTone;
};

/** A plain ruled label. The words carry the meaning, never the border alone. */
export function Badge({
  className,
  onDark = false,
  tone = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded-control text-caption inline-flex shrink-0 items-center border px-2 py-0.5",
        tone === "pending" ? "border-dashed font-sans" : "font-mono",
        onDark
          ? cn("border-rule-dark", tone === "pending" ? "text-on-dark-muted" : "text-on-dark")
          : cn("border-control", tone === "pending" ? "text-steel-600" : "text-ink-900"),
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
