import * as React from "react";
import { cn } from "@/lib/utils";

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
  hasError?: boolean;
};

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, id, label, hasError, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "min-h-target inline-flex cursor-pointer items-center gap-3 py-2 select-none",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            id={inputId}
            type="radio"
            ref={ref}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "border-control flex h-5 w-5 items-center justify-center rounded-full border bg-white transition-colors",
              "peer-focus-visible:outline-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
              "peer-checked:border-primary",
              "peer-disabled:border-rule peer-disabled:bg-ground",
              "[&>div]:hidden peer-checked:[&>div]:block",
              hasError && "border-error border-2",
            )}
            aria-hidden="true"
          >
            <div className="bg-primary h-2.5 w-2.5 rounded-full" />
          </div>
        </div>
        <span className="text-ink-700 text-small font-normal">{label}</span>
      </label>
    );
  },
);

Radio.displayName = "Radio";
