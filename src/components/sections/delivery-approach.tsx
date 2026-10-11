import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import { ProcessSequence } from "@/components/content/process-sequence";
import { DotRamp } from "@/components/content/dot-ramp";
import { BrandIllustration } from "@/components/content/brand-illustration";
import type { HomeContent } from "@/content/types";

export type DeliveryApproachProps = {
  deliveryApproach: HomeContent["deliveryApproach"];
};

/**
 * How we work: the page's one dark band. The client's transformation wave sits beside the heading,
 * the sequence energises stage by stage as it scrolls through, and what the method protects closes
 * the band.
 */
export function DeliveryApproach({ deliveryApproach }: DeliveryApproachProps) {
  return (
    <Section ground="ink" spacing="tight" aria-labelledby="delivery-heading">
      <RailTag label="How we work" />
      <Container rail className="rail-enter">
        <div className="grid grid-cols-1 items-end gap-x-12 gap-y-8 lg:grid-cols-12">
          <SectionHeader
            id="delivery-heading"
            title={deliveryApproach.title}
            intro={deliveryApproach.intro}
            introWidth="narrow"
            size="h1"
            onDark
            className="lg:col-span-7"
          />
          <BrandIllustration
            name="transformation-wave-on-dark"
            alt=""
            sizes="(max-width: 1024px) 100vw, 36vw"
            className="lg:col-span-5"
          />
        </div>
        <div className="sequence mt-10">
          <DotRamp onDark className="hidden lg:block" />
          <ProcessSequence
            steps={deliveryApproach.steps}
            onDark
            className="lg:mt-6"
            rail
            timelineRoot={false}
          />
        </div>
        {deliveryApproach.values.length > 0 && (
          <ul
            aria-label="What the method protects"
            className="border-rule-dark mt-14 grid grid-cols-1 border-t md:grid-cols-3"
          >
            {deliveryApproach.values.map((value) => (
              <li
                key={value.title}
                className="border-rule-dark border-b py-6 md:border-b-0 md:pr-8 md:not-first:border-l md:not-first:pl-8"
              >
                <h3 className="font-display text-h3 text-on-dark font-medium">{value.title}</h3>
                <p className="text-on-dark-muted mt-2">{value.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
