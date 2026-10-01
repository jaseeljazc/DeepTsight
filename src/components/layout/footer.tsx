import * as React from "react";
import { Container } from "./container";
import { Wordmark } from "./wordmark";
import { Link } from "@/components/primitives/link";
import { DrawingRule } from "@/components/primitives/drawing-rule";
import { MarkedText, isPlaceholder } from "@/components/primitives/placeholder";
import type { Site } from "@/content/types";
import { cn } from "@/lib/utils";
import { siteHost } from "@/lib/site-url";

export type FooterProps = {
  site: Site;
  services: { slug: string; shortTitle: string }[];
  className?: string;
};

// Revision: the last change to the site settings when the CMS records it (D-11), otherwise the
// build date, which is when a statically rendered page was issued.
const BUILD_DATE = new Date().toISOString().slice(0, 10);

/**
 * Footer laid out like the title block of an engineering drawing: link columns above,
 * a ruled strip of issue details below (FR-05).
 */
export function Footer({ site, services, className }: FooterProps) {
  const revision = site.updatedAt ? site.updatedAt.slice(0, 10) : BUILD_DATE;
  const year = revision.slice(0, 4);
  const linkedInPending = !site.linkedIn || isPlaceholder(site.linkedIn);

  const titleBlock: { label: string; value: string }[] = [
    { label: "Entity", value: site.legalName },
    { label: "ABN", value: site.abn ?? "TBD — CLIENT" },
    { label: "Location", value: site.locationLabel },
    { label: "Document", value: siteHost },
    { label: "Revision", value: revision },
    { label: "Copyright", value: `© ${year} ${site.legalName}` },
  ];

  return (
    <footer className={cn("on-dark bg-ink-900 text-on-dark-muted", className)}>
      <Container className="pt-20 pb-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="md:col-span-2 lg:col-span-4">
            <Wordmark onDark />
            <p className="text-small max-w-prose-sm mt-5">{site.tagline}</p>
          </div>

          <FooterColumn title="Services" className="lg:col-span-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} variant="footer">
                  {service.shortTitle}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Company" className="lg:col-span-2">
            <li>
              <Link href="/about" variant="footer">
                About
              </Link>
            </li>
            <li>
              <Link href="/credentials" variant="footer">
                Credentials
              </Link>
            </li>
            <li>
              <Link href="/services" variant="footer">
                Services
              </Link>
            </li>
            <li>
              <Link href="/contact" variant="footer">
                Contact
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title="Contact and legal" className="lg:col-span-3">
            <li>
              <Link href={`mailto:${site.email}`} variant="footer">
                {site.email}
              </Link>
            </li>
            <li>
              <Link href={`tel:${site.phone.replace(/\s+/g, "")}`} variant="footer">
                {site.phone}
              </Link>
            </li>
            <li className="text-small">
              {linkedInPending ? (
                <MarkedText text="LinkedIn: TBD — CLIENT" onDark />
              ) : (
                <Link href={site.linkedIn ?? ""} variant="footer" isExternal>
                  LinkedIn
                </Link>
              )}
            </li>
            <li className="pt-3">
              <Link href="/legal/privacy" variant="footer">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" variant="footer">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/legal/accessibility" variant="footer">
                Accessibility
              </Link>
            </li>
          </FooterColumn>
        </div>

        <DrawingRule onDark className="mt-20" />
        <dl className="border-rule-dark grid grid-cols-2 border-b border-l sm:grid-cols-3 lg:grid-cols-6">
          {titleBlock.map((cell) => (
            <div key={cell.label} className="border-rule-dark border-t border-r px-3 py-3">
              <dt className="text-caption">{cell.label}</dt>
              <dd className="text-on-dark text-caption mt-1 font-mono break-words">
                <MarkedText text={cell.value} onDark />
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

function FooterColumn({ title, className, children }: FooterColumnProps) {
  return (
    <div className={className}>
      <h2 className="text-on-dark text-small font-medium">{title}</h2>
      <ul className="mt-3">{children}</ul>
    </div>
  );
}
