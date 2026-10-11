import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import { SpecBlock } from "@/components/primitives/spec-block";
import { DotGlobe } from "@/components/content/dot-globe";
import { SectorTiles } from "@/components/content/sector-tiles";
import type { HomeContent } from "@/content/types";

export type PerthContextProps = {
  perthContext: HomeContent["perthContext"];
};

/**
 * Composed like the hero: the statement, the office and the illustrated sector tiles on the left,
 * the dot-matrix globe rising from the bottom-right edge with Perth, Kerala, and Saudi Arabia pinned.
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
            <p className="text-caption text-steel-600 mb-2 font-mono">Location</p>
            <SpecBlock
              label="Location"
              density="compact"
              items={[{ label: "Office", value: perthContext.officeArea }]}
            />
          </div>
          <h3 className="font-display text-h3 text-ink-900 mt-10 font-medium">Sector exposure</h3>
          <SectorTiles sectors={perthContext.sectors} className="mt-4" />
        </div>
      </Container>
      <DotGlobe
        label="Perth, WA"
        className="globe-bleed max-w-prose-sm xl:w-globe mx-auto mt-12 w-11/12 xl:absolute xl:mt-0 xl:max-w-none"
      />
    </Section>
  );
}
