import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/primitives/section-header";
import { Link } from "@/components/primitives/link";
import { RailTag } from "@/components/primitives/rail-tag";
import { Figure } from "@/components/primitives/figure";
import { SpecBlock, type SpecItem } from "@/components/primitives/spec-block";
import type { FigureData, FinalCtaData, UiLabels } from "@/content/types";

export type FinalCtaProps = {
  finalCta: FinalCtaData;
  /** Wording for the email and phone alternatives, from site.uiLabels. */
  labels: Pick<UiLabels, "orEmail" | "orCall">;
  email?: string;
  phone?: string;
  figure?: FigureData;
  id?: string;
  /** Home only: adds the rail terminal tag and leaves room for the core line. */
  rail?: boolean;
  /** Contact particulars set like the hero's practice particulars; takes the figure's place. */
  particulars?: SpecItem[];
  /** A wide photograph above the invitation. Independent of the aside. */
  band?: FigureData | undefined;
};

/** Closing invitation. One primary action, with the direct email as the alternative. */
export function FinalCta({
  finalCta,
  labels,
  email,
  phone,
  figure,
  id,
  rail = false,
  particulars,
  band,
}: FinalCtaProps) {
  const aside = particulars ? "particulars" : figure ? "figure" : null;

  return (
    <Section ground="ground-deep" id={id} aria-labelledby="final-cta-heading">
      {rail && <RailTag label="Enquiry" />}
      <Container
        rail={rail}
        className="rail-enter grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12"
      >
        {band && (
          <div className="lg:col-span-12">
            <Figure figure={band} aspect="wide" reveal sizes="(max-width: 1280px) 100vw, 1200px" />
          </div>
        )}
        <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
          <SectionHeader
            id="final-cta-heading"
            title={finalCta.title}
            intro={finalCta.supportingText}
            size={particulars ? "display" : "h1"}
          />
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link href="/contact" variant="buttonPrimary" withArrow>
              {finalCta.ctaLabel}
            </Link>
            {email && !particulars && (
              <p className="text-ink-700 text-small">
                {labels.orEmail}{" "}
                <a href={`mailto:${email}`} className="link-rule text-ink-900 font-medium">
                  {email}
                </a>
                {phone && (
                  <>
                    {" "}
                    {labels.orCall}{" "}
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
        {aside === "particulars" && particulars && (
          <div className="self-end lg:col-span-4 lg:col-start-9">
            <div className="bg-panel rounded-panel border-rule border p-4 sm:p-5">
              <p className="text-caption text-steel-600 mb-2 font-mono">Contact particulars</p>
              <SpecBlock label="Contact particulars" items={particulars} density="compact" />
            </div>
          </div>
        )}
        {aside === "figure" && figure && (
          <div className="lg:col-span-4 lg:col-start-9">
            <Figure figure={figure} aspect="portrait" sizes="(max-width: 1024px) 100vw, 30vw" />
          </div>
        )}
      </Container>
    </Section>
  );
}
