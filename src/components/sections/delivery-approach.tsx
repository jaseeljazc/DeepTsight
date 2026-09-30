import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import { ProcessSequence } from "@/components/content/process-sequence";
import type { HomeContent } from "@/content/types";

export type DeliveryApproachProps = {
  deliveryApproach: HomeContent["deliveryApproach"];
};

/** The page's one dark band. The sequence energises stage by stage as it scrolls through. */
export function DeliveryApproach({ deliveryApproach }: DeliveryApproachProps) {
  return (
    <Section ground="ink" spacing="tight" aria-labelledby="delivery-heading">
      <RailTag label="Delivery approach" />
      <Container rail className="rail-enter">
        <SectionHeader
          id="delivery-heading"
          title={deliveryApproach.title}
          intro={deliveryApproach.intro}
          introWidth="narrow"
          onDark
        />
        <ProcessSequence steps={deliveryApproach.steps} onDark className="mt-12 md:mt-16" rail />
      </Container>
    </Section>
  );
}
