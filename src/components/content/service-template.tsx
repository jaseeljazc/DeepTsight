import * as React from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { AnchorNav, type AnchorItem } from "@/components/layout/anchor-nav";
import { Figure } from "@/components/primitives/figure";
import { SpecBlock } from "@/components/primitives/spec-block";
import { FinalCta } from "@/components/sections/final-cta";
import { ServiceBody } from "./service-body";
import { ServiceIcon } from "./service-icon";
import type { FigureData, PagesContent, Service } from "@/content/types";
import { lowerFirst } from "@/lib/utils";

export type ServiceTemplateProps = {
  service: Service;
  relatedServices: Service[];
  figures: Record<string, FigureData>;
  email: string;
  copy: PagesContent["serviceTemplate"];
  /** Label of the closing call-to-action button (the site-wide primary CTA). */
  ctaLabel: string;
};

/**
 * One template for every service page (FR-17, FR-19). The nine-part structure is numbered
 * like a report and mirrored in the sticky contents list.
 */
export function ServiceTemplate({
  service,
  relatedServices,
  figures,
  email,
  copy,
  ctaLabel,
}: ServiceTemplateProps) {
  const contents: AnchorItem[] = [
    { id: "challenge", number: "1.0", label: "Client challenge" },
    { id: "why-it-matters", number: "2.0", label: "Why it matters operationally" },
    { id: "capability", number: "3.0", label: "DeepTsight capability" },
    { id: "scope", number: "4.0", label: "Typical scope and outputs" },
    { id: "approach", number: "5.0", label: "Delivery approach" },
    { id: "standards", number: "6.0", label: "Standards and methods" },
    { id: "evidence", number: "7.0", label: "Representative experience" },
    { id: "related", number: "8.0", label: "Related services" },
    { id: "enquire", number: "9.0", label: "Enquire" },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: service.shortTitle }]}
        title={service.title}
        titleIcon={<ServiceIcon name={service.icon} size="title" />}
        lead={service.summary}
        aside={
          <SpecBlock
            label="Service particulars"
            items={[
              { label: "Outcome", value: <span className="font-sans">{service.outcome}</span> },
              { label: "Key standard", value: service.standards[0] ?? "", mono: true },
              { label: "Engagement", value: copy.engagement },
            ]}
          />
        }
      />

      <Figure
        figure={figures[service.media.hero]}
        aspect="wide"
        parallax
        preload
        sizes="100vw"
        captionClassName="mx-auto max-w-page px-5 sm:px-8"
      />

      <Container className="section-y grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <AnchorNav items={contents} />
        </aside>
        <div className="lg:col-span-8 lg:col-start-5">
          <ServiceBody
            service={service}
            relatedServices={relatedServices}
            detailFigure={figures[service.media.detail]}
            figures={figures}
          />
        </div>
      </Container>

      <FinalCta
        id="enquire"
        email={email}
        finalCta={{
          title: `${copy.enquiryTitlePrefix} ${lowerFirst(service.shortTitle)}`,
          supportingText: copy.supportingText,
          ctaLabel,
        }}
      />
    </>
  );
}
