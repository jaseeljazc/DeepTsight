import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import type { HomeContent } from "@/content/types";

export type ProblemsAddressedProps = {
  problemsAddressed: HomeContent["problemsAddressed"];
};

/** Situation and approach as a two-column schedule. */
export function ProblemsAddressed({ problemsAddressed }: ProblemsAddressedProps) {
  return (
    <Section spacing="tight" aria-labelledby="problems-heading">
      <RailTag label={problemsAddressed.title} />
      <Container rail className="rail-enter">
        <SectionHeader id="problems-heading" title={problemsAddressed.title} size="h1" />
        <div className="mt-10">
          <Table caption="Operational problems and how DeepTsight approaches them">
            <TableHeader>
              <TableRow>
                <TableHead className="col-key">Situation</TableHead>
                <TableHead>Approach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problemsAddressed.items.map((item) => (
                <TableRow key={item.challenge}>
                  <TableHead
                    scope="row"
                    className="font-display text-ink-900 text-h3 tracking-snug py-5 font-medium"
                  >
                    {item.challenge}
                  </TableHead>
                  <TableCell className="text-body py-5">{item.solution}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Container>
    </Section>
  );
}
