import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { Link } from "@/components/primitives/link";
import { RailTag } from "@/components/primitives/rail-tag";
import { Figure } from "@/components/primitives/figure";
import type { FigureData, HomeContent } from "@/content/types";

export type FinalCtaProps = {
  finalCta: HomeContent["finalCta"];
  email?: string;
  phone?: string;
  figure?: FigureData;
  id?: string;
  /** Home only: adds the rail terminal tag and leaves room for the core line. */
  rail?: boolean;
};

/** Closing invitation. One primary action, with the direct email as the alternative. */
export function FinalCta({ finalCta, email, phone, figure, id, rail = false }: FinalCtaProps) {
  return (
    <Section ground="ground-deep" id={id} aria-labelledby="final-cta-heading">
      {rail && <RailTag label="Enquiry" />}
      <Container
        rail={rail}
        className="rail-enter grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12"
      >
        <div className={figure ? "lg:col-span-7" : "lg:col-span-9"}>
          <SectionHeader
            id="final-cta-heading"
            title={finalCta.title}
            intro={finalCta.supportingText}
            size="h1"
          />
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link href="/contact" variant="buttonPrimary" withArrow>
              {finalCta.ctaLabel}
            </Link>
            {email && (
              <p className="text-ink-700 text-small">
                Or email{" "}
                <a href={`mailto:${email}`} className="link-rule text-ink-900 font-medium">
                  {email}
                </a>
                {phone && (
                  <>
                    {" "}
                    or call{" "}
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="link-rule text-ink-900 font-medium whitespace-nowrap"
                    >
                      {phone}
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        {figure && (
          <div className="lg:col-span-4 lg:col-start-9">
            <Figure figure={figure} aspect="portrait" sizes="(max-width: 1024px) 100vw, 30vw" />
          </div>
        )}
      </Container>
    </Section>
  );
}
