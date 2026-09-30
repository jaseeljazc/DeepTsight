import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, disabled, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "rounded-control text-ink-900 placeholder:text-steel-600 disabled:border-rule disabled:bg-ground disabled:text-steel-600 h-control text-field w-full appearance-none border bg-white px-4 pr-10 font-sans transition-colors disabled:cursor-not-allowed",
            hasError
              ? "border-error border-2"
              : "border-control hover:border-ink-700 focus:border-ink-900",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="text-ink-700 pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
    );
  },
);

Select.displayName = "Select";
