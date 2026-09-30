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
      <Container rail className="rail-enter grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            id="why-heading"
            title={whyDeepTsight.title}
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

        <ul className="border-ink-900 lg:col-span-6 lg:col-start-7 lg:border-t">
          {whyDeepTsight.pillars.map((pillar) => (
            <li key={pillar.title} className="border-rule border-b py-5">
              <h3 className="text-ink-900 text-h3 font-medium">{pillar.title}</h3>
              <p className="text-ink-700 text-small mt-1">{pillar.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
