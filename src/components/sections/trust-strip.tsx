import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Link } from "@/components/primitives/link";
import { Badge } from "@/components/primitives/badge";
import { RailTag } from "@/components/primitives/rail-tag";
import { MarkedText } from "@/components/primitives/placeholder";
import type { HomeContent } from "@/content/types";
import { cn } from "@/lib/utils";

export type TrustStripProps = {
  items: HomeContent["trustStrip"];
  copy: HomeContent["trustStripCopy"];
};

/**
 * Credentials as a ruled register, not a logo wall (FR-13): the issuer badge sits beside the
 * entry, the words carry it. An unverified entry says so in words.
 */
export function TrustStrip({ items, copy }: TrustStripProps) {
  if (items.length === 0) return null;

  return (
    <Section ground="ground-deep" spacing="strip" aria-labelledby="trust-heading">
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
              className="border-rule relative flex flex-col gap-2 border-b py-4 sm:pr-4 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0"
            >
              <dt className="text-steel-600 text-caption font-mono">
                {copy.categoryLabels[item.category] ?? item.category}
              </dt>
              <dd className={cn("text-ink-900 text-small font-medium", item.badge && "pr-32")}>
                <MarkedText text={item.title} />
              </dd>
              <dd className={cn("text-steel-600 text-caption", item.badge && "pr-32")}>
                <MarkedText text={item.issuer} />
              </dd>
              {item.badge && (
                // Decorative: the title above names the credential.
                <dd className="absolute top-4 right-0 sm:right-4 lg:right-5">
                  <Image
                    src={item.badge}
                    alt=""
                    width={112}
                    height={112}
                    className="size-badge object-contain"
                  />
                </dd>
              )}
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
