import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import { ProjectNote } from "@/components/content/project-note";
import type { HomeContent } from "@/content/types";

export type SelectedProofProps = {
  title: string;
  proofs: HomeContent["selectedProof"];
};

/** Omitted entirely when nothing is approved for disclosure (FR-15). */
export function SelectedProof({ title, proofs }: SelectedProofProps) {
  if (proofs.length === 0) return null;

  return (
    <Section ground="ground-deep" spacing="tight" aria-labelledby="proof-heading">
      <RailTag label={title} />
      <Container rail className="rail-enter">
        <SectionHeader id="proof-heading" title={title} />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {proofs.map((proof) => (
            <ProjectNote key={proof.id} proof={proof} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
