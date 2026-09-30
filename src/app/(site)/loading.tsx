import * as React from "react";
import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading page content" className="pt-24 pb-24">
      <Container>
        <div className="max-w-measure space-y-5">
          <div className="bg-ground-deep h-control max-w-headline-lg w-full" />
          <div className="bg-ground-deep h-control max-w-headline w-full" />
          <div className="bg-panel max-w-prose-md h-5 w-full" />
          <div className="bg-panel max-w-prose-sm h-5 w-full" />
        </div>
      </Container>
    </div>
  );
}
