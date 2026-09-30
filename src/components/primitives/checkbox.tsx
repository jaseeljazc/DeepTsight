import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
  hasError?: boolean;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, hasError, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "min-h-target inline-flex cursor-pointer items-start gap-3 py-2 select-none",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            disabled={disabled}
            className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            {...props}
          />
          <div
            className={cn(
              "rounded-control border-control pointer-events-none flex h-5 w-5 items-center justify-center border bg-white transition-colors",
              "peer-focus-visible:outline-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
              "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary",
              "peer-disabled:border-rule peer-disabled:bg-ground peer-disabled:text-steel-600",
              "[&>svg]:hidden peer-checked:[&>svg]:block",
              hasError && "border-error border-2",
            )}
            aria-hidden="true"
          >
            <Check className="h-3.5 w-3.5" />
          </div>
        </div>
        <span className="text-ink-700 text-small font-normal">{label}</span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
