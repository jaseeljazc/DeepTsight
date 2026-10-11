import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import { Figure } from "@/components/primitives/figure";
import { SeeConnectDeliver } from "@/components/content/see-connect-deliver";
import type { FigureData, HomeContent } from "@/content/types";

export type WhyDeepTsightProps = {
  whyDeepTsight: HomeContent["whyDeepTsight"];
  figure?: FigureData | undefined;
};

/**
 * Who DeepTsight is and its mission, then See, Connect, Deliver: the client's illustration with
 * the three lines set under the panel each belongs to.
 */
export function WhyDeepTsight({ whyDeepTsight, figure }: WhyDeepTsightProps) {
  return (
    <Section ground="panel" spacing="tight" aria-labelledby="why-heading">
      <RailTag label="Why DeepTsight" />
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
          <div className="border-ink-900 mt-10 border-t pt-6">
            <p className="tag-plate">Mission</p>
            <p className="font-display text-h3-lg text-ink-900 measure mt-4 font-medium">
              {whyDeepTsight.mission}
            </p>
          </div>
        </div>

        <div className="self-end lg:col-span-5 lg:col-start-8">
          {figure && (
            <Figure
              figure={figure}
              aspect="landscape"
              reveal
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          )}
        </div>

        <SeeConnectDeliver pillars={whyDeepTsight.pillars} className="lg:col-span-12" />
      </Container>
    </Section>
  );
}
