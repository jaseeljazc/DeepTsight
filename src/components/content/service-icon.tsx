import * as React from "react";
import {
  Activity,
  Cable,
  Cog,
  Cpu,
  Gauge,
  Network,
  Router,
  Server,
  Split,
  Waypoints,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "@/content/types";
import { cn } from "@/lib/utils";

/** One entry per name in `serviceIconNames` (schema.ts), imported individually (TECH_STACK.md §2.2). */
const icons: Record<Service["icon"], LucideIcon> = {
  Activity,
  Cable,
  Cog,
  Cpu,
  Gauge,
  Network,
  Router,
  Server,
  Split,
  Waypoints,
  Workflow,
  Wrench,
};

export type ServiceIconProps = {
  name: Service["icon"];
  /** `title` beside a page H1, `heading` beside section and card titles, `inline` in table rows. */
  size?: "title" | "heading" | "inline";
  onDark?: boolean;
  className?: string;
};

/**
 * The line icon shown beside a service title. Decorative: the title beside it carries the
 * meaning, so it is hidden from assistive technology. Stroke width comes from --icon-stroke.
 */
export function ServiceIcon({
  name,
  size = "heading",
  onDark = false,
  className,
}: ServiceIconProps) {
  const Icon = icons[name];
  // The wrapper is one text line tall, so the icon aligns with the first line of a wrapping title.
  return (
    <span aria-hidden="true" className={cn("icon-line", className)}>
      <Icon
        focusable="false"
        className={cn(
          size === "title" && "size-10 md:size-12",
          size === "heading" && "size-6",
          size === "inline" && "size-4",
          onDark ? "text-on-dark" : "text-ink-900",
        )}
      />
    </span>
  );
}
