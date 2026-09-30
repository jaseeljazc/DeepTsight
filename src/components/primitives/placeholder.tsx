import * as React from "react";
import { cn } from "@/lib/utils";

const MARKERS = ["[PLACEHOLDER]", "TODO(CLIENT)", "TBD — CLIENT"];

/** True when a content string still carries an unverified-copy marker (CLAUDE.md §3). */
export function isPlaceholder(text: string | undefined | null): boolean {
  if (!text) return false;
  return MARKERS.some((marker) => text.includes(marker));
}

export type PlaceholderProps = {
  label?: string;
  children?: React.ReactNode;
  inline?: boolean;
  onDark?: boolean;
  className?: string;
};

/**
 * Visibly unfinished content. Dashed outline, mono text and the literal [PLACEHOLDER]
 * prefix, so it can never be mistaken for approved copy.
 */
export function Placeholder({
  label = "TODO(CLIENT)",
  children,
  inline = false,
  onDark = false,
  className,
}: PlaceholderProps) {
  if (inline) {
    return (
      <span
        className={cn(
          "rounded-control text-inline-mono inline border border-dashed box-decoration-clone px-1 font-mono",
          onDark ? "border-on-dark-muted text-on-dark" : "border-control text-ink-900 bg-panel",
          className,
        )}
      >
        [{label}: {children}]
      </span>
    );
  }

  return (
    <div
      role="note"
      aria-label={`Unverified content: ${label}`}
      className={cn(
        "rounded-panel text-caption border border-dashed p-4 font-mono",
        onDark ? "border-on-dark-muted text-on-dark" : "border-control bg-panel text-ink-700",
        className,
      )}
    >
      <p className="mb-1 flex items-center gap-2">
        <span className="tag-plate">[PLACEHOLDER]</span>
        <span>{label}</span>
      </p>
      {children && <div className="text-small font-sans">{children}</div>}
    </div>
  );
}

export type MarkedTextProps = {
  text: string;
  onDark?: boolean;
  className?: string;
};

/** Renders a content string, marking it as a placeholder when it carries a marker. */
export function MarkedText({ text, onDark = false, className }: MarkedTextProps) {
  if (!isPlaceholder(text)) return <span className={className}>{text}</span>;
  return (
    <span
      className={cn(
        "rounded-control border border-dashed box-decoration-clone px-1",
        onDark ? "border-on-dark-muted" : "border-control bg-panel",
        className,
      )}
    >
      {text}
    </span>
  );
}
