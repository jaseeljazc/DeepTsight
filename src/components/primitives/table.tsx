import * as React from "react";
import { cn } from "@/lib/utils";

export type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  caption: string;
  /** Shows the caption above the table instead of keeping it for assistive tech only. */
  showCaption?: boolean;
};

/** A ruled schedule. Scrolls horizontally inside its own region on narrow screens. */
export function Table({ caption, showCaption = false, className, children, ...props }: TableProps) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={caption}
      className="relative w-full overflow-x-auto"
    >
      <table className={cn("w-full border-collapse text-left", className)} {...props}>
        <caption
          className={cn(
            showCaption ? "text-steel-600 text-caption mb-3 text-left font-mono" : "sr-only",
          )}
        >
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("border-ink-900 border-t border-b", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-rule border-rule divide-y border-b", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("align-top", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({
  className,
  children,
  isNumeric = false,
  scope = "col",
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { isNumeric?: boolean }) {
  return (
    <th
      scope={scope}
      className={cn(
        "text-steel-600 text-small py-3 pr-6 font-medium",
        isNumeric ? "text-right" : "text-left",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className,
  children,
  isNumeric = false,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { isNumeric?: boolean }) {
  return (
    <td
      className={cn(
        "text-ink-700 text-small py-4 pr-6",
        isNumeric && "tabular text-right font-mono",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
