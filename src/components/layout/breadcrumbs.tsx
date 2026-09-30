import * as React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = React.HTMLAttributes<HTMLElement> & {
  items: BreadcrumbItem[];
  onDark?: boolean;
};

export function Breadcrumbs({ items, onDark = false, className, ...props }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const linkClass = cn(
    "link-rule inline-flex min-h-target items-center decoration-transparent",
    onDark ? "text-on-dark-muted hover:text-on-dark" : "text-steel-600 hover:text-ink-900",
  );

  return (
    <nav aria-label="Breadcrumb" className={className} {...props}>
      <ol className="text-small flex flex-wrap items-center gap-x-2">
        <li>
          <NextLink href="/" className={linkClass}>
            Home
          </NextLink>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              <span aria-hidden="true" className={onDark ? "text-rule-dark" : "text-control"}>
                /
              </span>
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={onDark ? "text-on-dark" : "text-ink-900"}
                >
                  {item.label}
                </span>
              ) : (
                <NextLink href={item.href} className={linkClass}>
                  {item.label}
                </NextLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
