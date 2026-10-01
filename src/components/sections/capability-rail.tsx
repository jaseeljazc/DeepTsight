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
import { ServiceIcon } from "@/components/content/service-icon";
import type { HomeContent, Service, UiLabels } from "@/content/types";

export type CapabilityRailProps = {
  title: string;
  intro: string;
  capabilities: HomeContent["coreCapabilities"];
  services: Service[];
  /** The line on the common terminal where the disciplines meet. */
  convergenceLabel: string;
  /** "All services" and "View service" wording, from site.uiLabels. */
  labels: Pick<UiLabels, "allServices" | "viewService">;
};

const OUTPUTS_SHOWN = 3;
const STANDARDS_SHOWN = 2;

/**
 * Every service as a terminal on one rail, each a single link to its service page (FR-14), wired
 * together onto a common terminal: one practitioner across all of them. The service list drives
 * the rail, so a new service appears here without a Home edit (FR-19); `capabilities` only
 * supplies Home's shorter title and outcome where one exists.
 */
export function CapabilityRail({
  title,
  intro,
  capabilities,
  services,
  convergenceLabel,
  labels,
}: CapabilityRailProps) {
  const summaryFor = (slug: string) => capabilities.find((capability) => capability.slug === slug);

  return (
    <Section aria-labelledby="capabilities-heading" spacing="tight">
      <RailTag label={title} />
      <Container rail>
        <div className="rail-enter">
          <SectionHeader id="capabilities-heading" title={title} intro={intro} size="h1" />
          <p className="mt-4">
            <Link href="/services">{labels.allServices}</Link>
          </p>
        </div>

        <ul className="rail-stagger mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => {
            const summary = summaryFor(service.slug);
            const title = summary?.title ?? service.title;
            const outcome = summary?.outcome ?? service.outcome;
            const headingId = `capability-${service.slug}`;
            const outputs = service.scopeAndOutputs
              .flatMap((group) => group.outputs)
              .slice(0, OUTPUTS_SHOWN);
            const standards = service.standards.slice(0, STANDARDS_SHOWN).join(" · ");

            return (
              <li key={service.slug} className="rail-rise">
                <NextLink
                  href={`/services/${service.slug}`}
                  aria-labelledby={headingId}
                  className="group border-ink-900 flex h-full flex-col gap-4 border-t pt-6"
                >
                  <DotNumeral value={String(index + 1).padStart(2, "0")} className="w-numeral" />
                  <h3
                    id={headingId}
                    className="font-display text-ink-900 group-hover:text-primary text-h3-lg flex items-start gap-3 font-medium transition-colors duration-150"
                  >
                    <ServiceIcon name={service.icon} />
                    <span>{title}</span>
                  </h3>
                  <p className="text-ink-700 text-small">{service.summary}</p>
                  <p className="text-ink-900 text-small border-rule border-t pt-4">{outcome}</p>
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
                    {labels.viewService}
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
