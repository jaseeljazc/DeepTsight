import * as React from "react";
import { Badge } from "@/components/primitives/badge";
import { MarkedText } from "@/components/primitives/placeholder";
import type { ProofItem } from "@/content/types";

export type ProjectNoteProps = {
  proof: ProofItem;
  headingLevel?: "h3" | "h4";
};

/** An anonymised project entry laid out like an extract from a report. */
export function ProjectNote({ proof, headingLevel = "h3" }: ProjectNoteProps) {
  const Heading = headingLevel;

  return (
    <article className="rounded-panel border-rule flex flex-col border bg-white p-6 md:p-8">
      <p className="text-steel-600 border-rule text-caption flex items-center justify-between gap-4 border-b pb-4 font-mono">
        <MarkedText text={proof.sector} />
        {!proof.disclosureApproved && <Badge tone="pending">Not approved</Badge>}
      </p>
      <Heading className="font-display text-ink-900 text-h3 mt-6 font-medium">
        <MarkedText text={proof.challenge} />
      </Heading>
      <dl className="text-small mt-6 space-y-4">
        <div>
          <dt className="text-steel-600">Outcome</dt>
          <dd className="text-ink-900 mt-1">
            <MarkedText text={proof.outcome} />
          </dd>
        </div>
        {proof.metric && (
          <div>
            <dt className="text-steel-600">Measure</dt>
            <dd className="text-ink-900 mt-1 font-mono">
              <MarkedText text={proof.metric} />
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}
