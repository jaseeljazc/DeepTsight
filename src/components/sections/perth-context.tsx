import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { Figure } from "@/components/primitives/figure";
import { RailTag } from "@/components/primitives/rail-tag";
import { SpecBlock } from "@/components/primitives/spec-block";
import { MarkedText } from "@/components/primitives/placeholder";
import type { FigureData, HomeContent } from "@/content/types";

export type PerthContextProps = {
  perthContext: HomeContent["perthContext"];
  figure: FigureData | undefined;
};

export function PerthContext({ perthContext, figure }: PerthContextProps) {
  return (
    <Section spacing="tight" aria-labelledby="perth-heading">
      <RailTag label="Perth and sector context" />
      <Container
        rail
        className="rail-enter grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12 lg:items-end lg:gap-y-12"
      >
        <div className="lg:col-span-7">
          <Figure
            figure={figure}
            aspect="landscape"
            parallax
            reveal
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </div>
        <div className="lg:col-span-4 lg:col-start-9 lg:pb-12">
          <SectionHeader
            id="perth-heading"
            title={perthContext.title}
            intro={perthContext.description}
            introSize="body"
            introWidth="narrow"
          />
          <SpecBlock
            className="mt-8 lg:mt-10"
            label="Location and sectors"
            items={[
              { label: "Office", value: perthContext.officeArea },
              {
                label: "Sectors",
                value: (
                  <ul className="grid grid-cols-1 gap-x-6 gap-y-1 font-sans sm:grid-cols-2 lg:grid-cols-1">
                    {perthContext.sectors.map((sector) => (
                      <li key={sector}>
                        <MarkedText text={sector} />
                      </li>
                    ))}
                  </ul>
                ),
              },
            ]}
          />
        </div>
      </Container>
    </Section>
  );
}
