import * as React from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { AnchorNav } from "@/components/layout/anchor-nav";
import { Part } from "./part";
import { SpecBlock } from "@/components/primitives/spec-block";
import { MarkedText } from "@/components/primitives/placeholder";
import type { LegalPage } from "@/content/types";

export type LegalDocumentProps = {
  page: LegalPage;
  reference: string;
  children?: React.ReactNode;
};

/** Strips a leading "1. " from source headings; numbering comes from the document layout. */
function cleanTitle(title: string): string {
  return title.replace(/^\d+\.\s*/, "");
}

/** Shared layout for privacy, terms and accessibility: contents rail and a reading column. */
export function LegalDocument({ page, reference, children }: LegalDocumentProps) {
  const sections = page.sections.map((section, index) => ({
    id: `section-${index + 1}`,
    number: `${index + 1}.0`,
    title: cleanTitle(section.title),
    content: section.content,
  }));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Legal" }, { label: page.title }]}
        title={page.title}
        aside={
          <SpecBlock
            label="Document details"
            items={[
              { label: "Last updated", value: page.lastUpdated, mono: true },
              { label: "Reference", value: reference },
              {
                label: "Status",
                value: <MarkedText text="Wording pending adviser approval: TBD — CLIENT" />,
              },
            ]}
          />
        }
      />

      <Container className="grid grid-cols-1 gap-x-8 gap-y-12 pb-24 md:pb-36 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <AnchorNav
            items={sections.map(({ id, number, title }) => ({ id, number, label: title }))}
          />
        </aside>
        <div className="lg:col-span-8 lg:col-start-5">
          {sections.map((section) => (
            <Part key={section.id} id={section.id} number={section.number} title={section.title}>
              <p className="text-ink-700 measure">{section.content}</p>
            </Part>
          ))}
          {children}
        </div>
      </Container>
    </>
  );
}
