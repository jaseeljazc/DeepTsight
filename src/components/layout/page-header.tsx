import * as React from "react";
import { Container } from "./container";
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";
import { DrawingRule } from "@/components/primitives/drawing-rule";
import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  /** Decorative icon set beside the H1 text (service pages). */
  titleIcon?: React.ReactNode;
  lead?: React.ReactNode;
  /** Right-hand column: usually a SpecBlock. With layout="form", the enquiry form. */
  aside?: React.ReactNode;
  /** "form" gives the text a narrow left column and the aside the wider right one. */
  layout?: "default" | "form";
  children?: React.ReactNode;
  className?: string;
};

/** Interior page opening: breadcrumb, large left-aligned H1, lead, optional schedule. */
export function PageHeader({
  breadcrumbs,
  title,
  titleIcon,
  lead,
  aside,
  layout = "default",
  children,
  className,
}: PageHeaderProps) {
  const isForm = layout === "form";
  return (
    <header className={cn("pt-6", isForm ? "section-b" : "pb-16 md:pb-24", className)}>
      <Container>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} />
        ) : (
          <div className="h-target" aria-hidden="true" />
        )}
        <DrawingRule className="mt-4" />
        <div
          className={cn(
            "mt-12 grid grid-cols-1 gap-x-8 md:mt-16 lg:grid-cols-12",
            isForm ? "gap-y-16" : "gap-y-12",
          )}
        >
          <div className={isForm ? "lg:col-span-5" : aside ? "lg:col-span-8" : "lg:col-span-10"}>
            <h1
              className={cn(
                "font-display text-h1 text-ink-900 font-medium",
                isForm ? "max-w-headline-sm" : "max-w-headline-lg",
                titleIcon && "flex items-start gap-4",
              )}
            >
              {titleIcon}
              {titleIcon ? <span>{title}</span> : title}
            </h1>
            {lead && (
              <div
                className={cn("text-lead text-ink-700 mt-8", isForm ? "max-w-prose-sm" : "measure")}
              >
                {lead}
              </div>
            )}
            {children && <div className={isForm ? "mt-12" : "mt-10"}>{children}</div>}
          </div>
          {aside && (
            <div className={isForm ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-4 lg:pt-3"}>
              {aside}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
