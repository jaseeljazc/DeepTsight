import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          "rounded-control text-ink-900 placeholder:text-steel-600 disabled:border-rule disabled:bg-ground disabled:text-steel-600 h-control text-field w-full border bg-white px-4 font-sans transition-colors disabled:cursor-not-allowed",
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

Input.displayName = "Input";
