import * as React from "react";
import NextLink from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { FigureData } from "@/content/types";
import { cn } from "@/lib/utils";

export type IndexListItem = {
  href: string;
  /** Omit where the order carries no meaning, such as related services. */
  number?: string;
  title: string;
  /** Decorative icon set beside the title (for example a service icon). */
  icon?: React.ReactNode;
  description: string;
  figure?: FigureData;
};

export type IndexListProps = {
  items: IndexListItem[];
  size?: "large" | "compact";
  headingLevel?: "h3" | "h4";
  className?: string;
};

/**
 * Ruled index of linked entries, set like a drawing register. Replaces card grids.
 * On wide screens a thumbnail slides out of the row's right edge on hover and keyboard focus.
 */
export function IndexList({
  items,
  size = "large",
  headingLevel = "h3",
  className,
}: IndexListProps) {
  const Heading = headingLevel;
  const numbered = items.some((item) => item.number);

  return (
    <ol className={cn("border-ink-900 border-t", className)}>
      {items.map((item) => {
        const thumb = item.figure?.kind === "image" ? item.figure : undefined;
        return (
          <li key={item.href} className="border-rule border-b">
            <NextLink
              href={item.href}
              className={cn(
                "group relative grid items-start gap-x-4 transition-colors duration-200",
                numbered ? "grid-index" : "grid-index-bare",
                "hover:bg-panel focus-visible:bg-panel",
                size === "large" ? "py-8 md:py-10" : "py-6",
              )}
            >
              {numbered && (
                <span className="tag-plate plate-align justify-self-start">{item.number}</span>
              )}
              <span className="block">
                <Heading
                  className={cn(
                    "font-display text-ink-900 tracking-heading font-medium",
                    size === "large" ? "text-h3-lg" : "text-h3",
                    item.icon && "flex items-start gap-3",
                  )}
                >
                  {item.icon}
                  {item.icon ? <span>{item.title}</span> : item.title}
                </Heading>
                <span className="text-ink-700 measure text-small md:text-body mt-3 block">
                  {item.description}
                </span>
              </span>
              <span className="relative flex h-full items-start justify-end">
                <ArrowRight
                  className="text-ink-900 group-hover:text-primary mt-2 h-5 w-5 transition duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
                {thumb && size === "large" && (
                  <span
                    aria-hidden="true"
                    className="index-thumb absolute top-1/2 right-10 hidden -translate-y-1/2 overflow-hidden lg:block"
                  >
                    <Image
                      src={thumb.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 12rem, 0px"
                      className="photo-grade object-cover"
                    />
                  </span>
                )}
              </span>
            </NextLink>
          </li>
        );
      })}
    </ol>
  );
}
