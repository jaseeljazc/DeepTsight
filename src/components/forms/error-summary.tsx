import * as React from "react";
import { Alert } from "@/components/primitives/alert";
import { Link } from "@/components/primitives/link";

export type ErrorSummaryItem = { id: string; message: string };

export type ErrorSummaryProps = {
  /** Heading text. Falls back to a generic line when the server gives no form-level message. */
  title?: string;
  items: ErrorSummaryItem[];
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Error summary shown above the form (FR-33, A11Y-13). The parent focuses it after a failed
 * submission; each entry moves focus to the field it names.
 */
export function ErrorSummary({
  title = "There is a problem with your submission",
  items,
  ref,
}: ErrorSummaryProps) {
  return (
    <Alert
      ref={ref}
      tabIndex={-1}
      variant="danger"
      tone="strong"
      titleAs="h2"
      titleId="error-summary-heading"
      aria-labelledby="error-summary-heading"
      title={title}
      className="mb-8"
    >
      {items.length > 0 && (
        <ul className="list-square pl-5">
          {items.map(({ id, message }) => (
            <li key={id}>
              <Link
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(id);
                  element?.focus();
                  element?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                {message}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Alert>
  );
}
