import * as React from "react";
import { Alert } from "@/components/primitives/alert";

/** Confirmation shown in place of the form once the enquiry has been accepted. */
export function EnquirySent() {
  return (
    <Alert variant="success" role="status" aria-live="polite" title="Enquiry sent">
      Thank you. Your enquiry has gone directly to the engineer who would do the work.
    </Alert>
  );
}
