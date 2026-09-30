import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import { Figure } from "@/components/primitives/figure";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import type { FigureData, HomeContent } from "@/content/types";

export type ProblemsAddressedProps = {
  problemsAddressed: HomeContent["problemsAddressed"];
  figure: FigureData | undefined;
};

/** Situation and approach as a two-column schedule. */
export function ProblemsAddressed({ problemsAddressed, figure }: ProblemsAddressedProps) {
  return (
    <Section spacing="tight" aria-labelledby="problems-heading">
      <RailTag label={problemsAddressed.title} />
      <Container rail className="rail-enter grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader id="problems-heading" title={problemsAddressed.title} />
          <Figure
            figure={figure}
            aspect="classic"
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="mt-8 hidden lg:block"
          />
        </div>
        <div className="lg:col-span-8">
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
