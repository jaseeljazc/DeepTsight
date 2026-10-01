import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import type { HomeContent } from "@/content/types";

export type WhyDeepTsightProps = {
  whyDeepTsight: HomeContent["whyDeepTsight"];
};

/** The argument for one practitioner across four disciplines, with the three reasons it holds. */
export function WhyDeepTsight({ whyDeepTsight }: WhyDeepTsightProps) {
  return (
    <Section ground="panel" spacing="tight" aria-labelledby="why-heading">
      <RailTag label={whyDeepTsight.title} />
      <Container rail className="rail-enter grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHeader
            id="why-heading"
            title={whyDeepTsight.title}
            size="h1"
            introSize="body"
            intro={
              <div className="space-y-4">
                {whyDeepTsight.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            }
          />
        </div>

        <ul className="border-ink-900 self-end border-t lg:col-span-5 lg:col-start-8">
          {whyDeepTsight.pillars.map((pillar) => (
            <li key={pillar.title} className="border-rule border-b py-6">
              <h3 className="font-display text-ink-900 text-h3-lg font-medium">{pillar.title}</h3>
              <p className="text-ink-700 text-body mt-2">{pillar.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
