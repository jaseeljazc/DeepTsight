import * as React from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Link } from "@/components/primitives/link";
import { Badge } from "@/components/primitives/badge";
import { RailTag } from "@/components/primitives/rail-tag";
import { MarkedText } from "@/components/primitives/placeholder";
import type { HomeContent } from "@/content/types";

export type TrustStripProps = {
  items: HomeContent["trustStrip"];
  copy: HomeContent["trustStripCopy"];
};

/**
 * Credentials as a ruled register, not a logo wall (FR-13). An entry the client has not yet
 * verified says so in words, so the register can never read as finished when it is not.
 */
export function TrustStrip({ items, copy }: TrustStripProps) {
  if (items.length === 0) return null;

  return (
    <Section ground="ground-deep" spacing="tight" aria-labelledby="trust-heading">
      <RailTag label={copy.title} />
      <Container rail className="rail-enter">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
          <h2 id="trust-heading" className="font-display text-ink-900 text-h3 font-medium">
            {copy.title}
          </h2>
          <Link href="/credentials" variant="subtle" className="text-small">
            {copy.registerLinkLabel}
          </Link>
        </div>
        <dl className="border-ink-900 mt-3 grid grid-cols-1 border-t sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-rule flex flex-col gap-2 border-b py-4 sm:pr-4 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0"
            >
              <dt className="text-steel-600 text-caption font-mono">
                {copy.categoryLabels[item.category] ?? item.category}
              </dt>
              <dd className="text-ink-900 text-small font-medium">
                <MarkedText text={item.title} />
              </dd>
              <dd className="text-steel-600 text-caption">
                <MarkedText text={item.issuer} />
              </dd>
              {!item.verified && (
                <dd>
                  <Badge tone="pending">Pending verification</Badge>
                </dd>
              )}
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
