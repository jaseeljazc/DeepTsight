import * as React from "react";
import { Container } from "@/components/layout/container";
import { Link } from "@/components/primitives/link";
import { SpecBlock } from "@/components/primitives/spec-block";
import { RailTag } from "@/components/primitives/rail-tag";
import { AsciiHeroPowerPlant } from "@/components/content/ascii-hero-power-plant";
import type { CtaLabels, HomeContent } from "@/content/types";

export type HeroSectionProps = {
  hero: HomeContent["hero"];
  /** Site-wide CTA labels (site.ts), so each label is stored once. */
  ctaLabels: CtaLabels;
};

/**
 * The Hero section layout:
 * - Left: Headline, lead paragraph, CTA actions, and practice particulars schedule.
 * - Right: Transparent ASCII telemetry rendering of the power plant cooling towers and ground.
 * - Nothing rendered below the hero viewport.
 */
export function HeroSection({ hero, ctaLabels }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-section min-h-hero relative flex flex-col justify-between pt-3 pb-0 sm:pt-4 lg:pt-4"
    >
      {/* ASCII power plant telemetry: its own band under the content on small screens, so the
          particulars stay legible and the plant stays whole; a full-bleed background from lg. */}
      <div
        className="aspect-classic md:aspect-wide max-h-hero-art pointer-events-none relative z-0 order-last flex items-end justify-end overflow-hidden select-none lg:absolute lg:inset-0 lg:order-0 lg:aspect-auto lg:max-h-none"
        aria-hidden="true"
      >
        <AsciiHeroPowerPlant align="right" className="h-full w-full opacity-85 lg:opacity-90" />
      </div>

      {/* Foreground Hero Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between">
        <RailTag label="Home" className="mb-1 sm:mb-2 lg:mb-3" />
        <Container rail className="flex flex-1 flex-col justify-center pb-4 lg:pb-8">
          <div className="grid flex-1 grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12 lg:items-end">
            {/* Left Column: Core Positioning & Actions */}
            <div className="flex flex-col justify-center lg:col-span-7 xl:col-span-8">
              <h1
                id="hero-heading"
                className="font-display text-h1 xl:text-display text-ink-900 max-w-headline-lg font-medium"
              >
                {hero.headline}
              </h1>
              <p className="text-body md:text-lead text-ink-700 max-w-prose-md mt-4 md:mt-5">
                {hero.supportingText}
              </p>
              {/* One grid so both actions take the width of the wider one; stacked on narrow screens. */}
              <div className="mt-6 grid w-fit grid-cols-1 gap-3 sm:auto-cols-fr sm:grid-flow-col sm:gap-x-4 md:mt-8">
                <Link href="/contact" variant="buttonPrimary" withArrow>
                  {ctaLabels.primary}
                </Link>
                <Link href="/services" variant="buttonSecondary">
                  {ctaLabels.secondary}
                </Link>
              </div>

              {/* Practice particulars sit under the actions, on the left; the telemetry fills the right. */}
              <div className="rounded-panel border-rule max-w-prose-md mt-8 border p-4 sm:p-5 md:mt-10">
                <p className="text-caption text-steel-600 mb-2 font-mono">Practice particulars</p>
                <SpecBlock label="Practice particulars" items={hero.facts} density="compact" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
