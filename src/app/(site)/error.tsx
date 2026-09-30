"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/primitives/button";
import { Link } from "@/components/primitives/link";

/** Never shows the error message, stack or digest to the visitor (SEC-14). */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Route error boundary triggered", error.digest ?? "");
  }, [error]);

  return (
    <Container className="section-y">
      <div className="max-w-prose-md">
        <h1 className="font-display text-h1 text-ink-900 font-medium">
          This page could not be loaded
        </h1>
        <p className="text-lead text-ink-700 mt-6">
          Try again, or go back to the home page. If it keeps happening, email
          enquiries@deeptsight.com.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button variant="primary" onClick={() => reset()}>
            Try again
          </Button>
          <Link href="/">Return to the home page</Link>
        </div>
      </div>
    </Container>
  );
}
