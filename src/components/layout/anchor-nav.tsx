"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type AnchorItem = {
  id: string;
  label: string;
  number?: string;
};

export type AnchorNavProps = {
  items: AnchorItem[];
  label?: string;
  className?: string;
};

/**
 * Document contents list. The section in view is marked with a primary rule and
 * aria-current="location".
 */
export function AnchorNav({ items, label = "Contents", className }: AnchorNavProps) {
  const [activeId, setActiveId] = React.useState<string>(items[0]?.id ?? "");

  React.useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0% -60% 0%", threshold: 0 },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={cn("lg:sticky-below-header lg:sticky", className)}>
      <p className="text-ink-900 border-ink-900 text-small border-b pb-3 font-medium">{label}</p>
      <ol>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id} className="border-rule border-b">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "min-h-target text-small relative flex items-baseline gap-3 py-2.5 pl-4 transition-colors",
                  "before:w-rule-active before:absolute before:top-2 before:bottom-2 before:left-0 before:transition-colors",
                  isActive
                    ? "text-ink-900 before:bg-primary font-medium"
                    : "text-steel-600 hover:text-ink-900 before:bg-transparent",
                )}
              >
                {item.number && (
                  <span className="tabular text-caption font-mono">{item.number}</span>
                )}
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
