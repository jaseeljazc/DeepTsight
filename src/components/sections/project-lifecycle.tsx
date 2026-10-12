import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import type { PagesContent } from "@/content/types";

export type ProjectLifecycleProps = {
  lifecycle: PagesContent["services"]["lifecycle"];
};

/**
 * Where we support you: the five lifecycle phases as a ruled schedule, read left to right from xl,
 * then the ways to engage at any phase.
 */
export function ProjectLifecycle({ lifecycle }: ProjectLifecycleProps) {
  return (
    <Section ground="ground-deep" aria-labelledby="lifecycle-heading">
      <Container>
        <SectionHeader
          id="lifecycle-heading"
          title={lifecycle.title}
          intro={lifecycle.intro}
          introSize="body"
        />
        <ol className="border-ink-900 mt-12 grid grid-cols-1 border-t md:grid-cols-2 xl:grid-cols-5">
          {lifecycle.phases.map((phase) => (
            <li
              key={phase.step}
              className="border-rule border-b py-8 md:pr-6 xl:border-b-0 xl:not-first:border-l xl:not-first:pl-6"
            >
              <div className="flex items-center gap-3">
                <span className="tag-plate">{phase.step}</span>
                <h3 className="font-display text-h3 text-ink-900 font-medium">{phase.title}</h3>
              </div>
              <p className="text-ink-900 text-small mt-4 font-medium">{phase.subtitle}</p>
              <ul className="marker:text-control list-square text-ink-700 text-small mt-3 space-y-2 pl-5">
                {phase.activities.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        {/* Below xl the last phase's rule already closes the schedule, so only xl draws one here */}
        <div className="border-rule mt-10 grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-12 xl:border-t xl:pt-8">
          <h3 className="font-display text-h3 text-ink-900 font-medium lg:col-span-4">
            {lifecycle.engageTitle}
          </h3>
          <div className="lg:col-span-8">
            <ul className="flex flex-wrap gap-2">
              {lifecycle.engageModes.map((mode) => (
                <li
                  key={mode}
                  className="border-control rounded-control text-small text-ink-900 border px-3 py-1.5"
                >
                  {mode}
                </li>
              ))}
            </ul>
            <p className="text-ink-700 measure mt-5">{lifecycle.note}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
