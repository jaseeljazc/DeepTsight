import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import { SpecBlock } from "@/components/primitives/spec-block";
import { MarkedText } from "@/components/primitives/placeholder";
import { DotGlobe } from "@/components/content/dot-globe";
import type { HomeContent } from "@/content/types";

export type PerthContextProps = {
  perthContext: HomeContent["perthContext"];
};

/**
 * Composed like the hero: the statement and a particulars panel on the left, the dot-matrix
 * globe rising from the bottom-right edge with Perth pinned.
 */
export function PerthContext({ perthContext }: PerthContextProps) {
  return (
    <Section spacing="tight" aria-labelledby="perth-heading" className="globe-stage relative">
      <RailTag label="Perth and sector context" />
      <Container rail className="relative">
        <div className="rail-enter relative z-10 xl:w-5/12">
          <SectionHeader
            id="perth-heading"
            title={perthContext.title}
            intro={perthContext.description}
            size="h1"
            introSize="body"
            introWidth="narrow"
          />
          <div className="bg-panel rounded-panel border-rule mt-10 border p-4 sm:p-5">
            <p className="text-caption text-steel-600 mb-2 font-mono">Location and sectors</p>
            <SpecBlock
              label="Location and sectors"
              density="compact"
              items={[
                { label: "Office", value: perthContext.officeArea },
                {
                  label: "Sectors",
                  value: (
                    <ul className="grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2">
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
        </div>
      </Container>
      <DotGlobe
        label="Perth, WA"
        className="globe-bleed max-w-prose-sm xl:w-globe mx-auto mt-12 w-11/12 xl:absolute xl:mt-0 xl:max-w-none"
      />
    </Section>
  );
}
