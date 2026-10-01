import * as React from "react";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { RailTag } from "@/components/primitives/rail-tag";
import { Link } from "@/components/primitives/link";
import { RailWiring } from "@/components/content/rail-wiring";
import { DotNumeral } from "@/components/content/dot-numeral";
import type { HomeContent, Service } from "@/content/types";

export type CapabilityRailProps = {
  title: string;
  intro: string;
  capabilities: HomeContent["coreCapabilities"];
  services: Service[];
  /** The line on the common terminal where the four disciplines meet. */
  convergenceLabel: string;
};

const OUTPUTS_SHOWN = 3;
const STANDARDS_SHOWN = 2;

/**
 * The four disciplines as terminals on one rail, each a single link to its service page (FR-14),
 * wired together onto a common terminal: one practitioner across all four.
 */
export function CapabilityRail({
  title,
  intro,
  capabilities,
  services,
  convergenceLabel,
}: CapabilityRailProps) {
  const serviceFor = (slug: string) => services.find((service) => service.slug === slug);

  return (
    <Section aria-labelledby="capabilities-heading" spacing="tight">
      <RailTag label={title} />
      <Container rail>
        <div className="rail-enter">
          <SectionHeader id="capabilities-heading" title={title} intro={intro} size="h1" />
          <p className="mt-4">
            <Link href="/services">All services</Link>
          </p>
        </div>

        <ul className="rail-stagger mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((capability, index) => {
            const service = serviceFor(capability.slug);
            const headingId = `capability-${capability.slug}`;
            const outputs =
              service?.scopeAndOutputs.flatMap((group) => group.outputs).slice(0, OUTPUTS_SHOWN) ??
              [];
            const standards = service?.standards.slice(0, STANDARDS_SHOWN).join(" · ");

            return (
              <li key={capability.slug} className="rail-rise">
                <NextLink
                  href={`/services/${capability.slug}`}
                  aria-labelledby={headingId}
                  className="group border-ink-900 flex h-full flex-col gap-4 border-t pt-6"
                >
                  <DotNumeral value={String(index + 1).padStart(2, "0")} className="w-numeral" />
                  <h3
                    id={headingId}
                    className="font-display text-ink-900 group-hover:text-primary text-h3-lg font-medium transition-colors duration-150"
                  >
                    {capability.title}
                  </h3>
                  {service && <p className="text-ink-700 text-small">{service.summary}</p>}
                  <p className="text-ink-900 text-small border-rule border-t pt-4">
                    {capability.outcome}
                  </p>
                  {outputs.length > 0 && (
                    <ul className="text-ink-700 text-small divide-rule border-rule divide-y border-t">
                      {outputs.map((output) => (
                        <li key={output} className="py-2">
                          {output}
                        </li>
                      ))}
                    </ul>
                  )}
                  {standards && (
                    <p className="text-steel-600 text-caption mt-auto font-mono">{standards}</p>
                  )}
                  <span className="text-ink-900 text-small flex items-center gap-2 font-medium">
                    View service
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </NextLink>
              </li>
            );
          })}
        </ul>

        <RailWiring />
        <p className="bg-ink-900 text-on-dark rounded-control font-display text-lead mt-6 w-fit px-6 py-3 font-medium xl:mx-auto xl:mt-0">
          {convergenceLabel}
        </p>
      </Container>
    </Section>
  );
}
