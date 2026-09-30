import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, disabled, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          "rounded-control text-ink-900 placeholder:text-steel-600 disabled:border-rule disabled:bg-ground disabled:text-steel-600 text-field w-full border bg-white px-4 py-3 font-sans transition-colors disabled:cursor-not-allowed",
          hasError
            ? "border-error border-2"
            : "border-control hover:border-ink-700 focus:border-ink-900",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
