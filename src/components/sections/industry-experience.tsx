import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { MarkedText } from "@/components/primitives/placeholder";
import type { AboutContent } from "@/content/types";

export type IndustryExperienceProps = {
  experience: AboutContent["experience"];
};

/**
 * Industry experience by period, from the capability statement: a ruled sequence read left to
 * right from md, with the note that it includes work from before the company was founded.
 */
export function IndustryExperience({ experience }: IndustryExperienceProps) {
  return (
    <Section aria-labelledby="experience-heading">
      <Container>
        <SectionHeader
          id="experience-heading"
          title={experience.title}
          intro={experience.intro}
          introSize="body"
          introWidth="narrow"
        />
        <ol className="border-ink-900 mt-12 grid grid-cols-1 border-t md:grid-cols-2 xl:grid-cols-4">
          {experience.items.map((item) => (
            <li
              key={item.year}
              className="border-rule relative border-b py-8 md:pr-8 xl:border-b-0 xl:not-first:border-l xl:not-first:pl-8"
            >
              <span
                aria-hidden="true"
                className="marker-square bg-primary size-marker absolute -top-px left-0 -translate-y-1/2 xl:not-first:left-8"
              />
              <p className="text-ink-900 text-h3 font-mono">{item.year}</p>
              <h3 className="font-display text-h3 text-ink-900 mt-3 font-medium">
                <MarkedText text={item.title} />
              </h3>
              <p className="text-ink-700 mt-3">
                <MarkedText text={item.description} />
              </p>
            </li>
          ))}
        </ol>
        <p className="text-small text-steel-600 measure mt-8">{experience.note}</p>
      </Container>
    </Section>
  );
}
