import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type FieldErrorProps = {
  /** Referenced from the control's aria-describedby. */
  id: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Inline error text under a control: icon plus words, never colour alone (A11Y-14).
 * Not a live region: the error summary announces errors on submit, and the control reads this text
 * through aria-describedby when it is focused. Announcing both repeated every error.
 */
export function FieldError({ id, className, children }: FieldErrorProps) {
  return (
    <p
      id={id}
      className={cn("text-error text-small flex items-start gap-1.5 font-medium", className)}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => React.ReactNode;
};

export function Field({
  id,
  label,
  required = false,
  helperText,
  error,
  className,
  children,
}: FieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-ink-900 text-small font-medium">
          {label}
        </label>
        {required && <span className="text-steel-600 text-caption">required</span>}
      </div>

      {helperText && (
        <p id={helperId} className="text-steel-600 text-small">
          {helperText}
        </p>
      )}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error),
      })}

      {error && errorId && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
