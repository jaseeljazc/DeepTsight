import * as React from "react";
import { SectionHeader } from "@/components/primitives/section-header";

export type PartProps = {
  id: string;
  /** Document-style number on a label plate ("3.0"). */
  number: string;
  title: string;
  children: React.ReactNode;
};

/**
 * A numbered part of a document: ruled off from the one above, heading on a label plate,
 * body indented to sit under the heading text. Used by service pages, the credentials
 * register and the legal pages.
 */
export function Part({ id, number, title, children }: PartProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-rule border-t pt-10 pb-16 first:border-t-0 first:pt-0"
    >
      <SectionHeader id={`${id}-heading`} number={number} title={title} size="part" />
      <div className="sm:pl-part-indent mt-8">{children}</div>
    </section>
  );
}
