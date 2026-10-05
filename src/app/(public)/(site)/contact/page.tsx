import type { Metadata } from "next";
import {
  getAboutContent,
  getEnquiryOptions,
  getFigures,
  getPageContent,
  getSite,
  getSeo,
} from "@/content";
import { PageHeader } from "@/components/layout/page-header";
import { Figure } from "@/components/primitives/figure";
import { Link } from "@/components/primitives/link";
import { SpecBlock } from "@/components/primitives/spec-block";
import { MarkedText, isPlaceholder } from "@/components/primitives/placeholder";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { seoMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSeo("/contact"));
}

export default async function ContactPage() {
  const [site, figures, pages, enquiryOptions, about] = await Promise.all([
    getSite(),
    getFigures(),
    getPageContent(),
    getEnquiryOptions(),
    getAboutContent(),
  ]);
  const linkedInPending = !site.linkedIn || isPlaceholder(site.linkedIn);

  return (
    <PageHeader
      layout="form"
      breadcrumbs={[{ label: "Contact" }]}
      title={site.ctaLabels.primary}
      lead={pages.contact.lead}
      aside={
        <div className="rounded-panel border-rule border bg-white p-6 sm:p-10">
          <h2 className="font-display text-h3 text-ink-900 font-medium">Enquiry</h2>
          <p className="text-steel-600 text-small mt-2">
            Fields marked required must be completed.
          </p>
          <div className="mt-8">
            <EnquiryForm options={enquiryOptions} />
          </div>
        </div>
      }
    >
      <SpecBlock
        label="Contact details"
        items={[
          {
            label: "Email",
            value: (
              <a href={`mailto:${site.email}`} className="link-rule">
                {site.email}
              </a>
            ),
          },
          {
            label: "Phone",
            value: (
              <a href={`tel:${site.phone.replace(/\s+/g, "")}`} className="link-rule">
                {site.phone}
              </a>
            ),
          },
          {
            label: "Location",
            value: site.mapsUrl ? (
              <>
                {site.locationLabel}{" "}
                <Link href={site.mapsUrl} isExternal>
                  {site.uiLabels.openInMaps}
                </Link>
              </>
            ) : (
              site.locationLabel
            ),
          },
          { label: "Service area", value: site.serviceArea },
          {
            label: "LinkedIn",
            value: linkedInPending ? (
              <MarkedText text="TBD — CLIENT" />
            ) : (
              <Link href={site.linkedIn ?? ""} isExternal>
                {`${about.founder.name} ${site.uiLabels.onLinkedInSuffix}`}
              </Link>
            ),
          },
          { label: "Response time", value: site.responseTime },
        ]}
      />

      <div className="border-ink-900 mt-12 border-t pt-6">
        <h2 className="text-ink-900 text-small font-medium">
          {pages.contact.beforeYouWrite.title}
        </h2>
        <p className="text-ink-700 text-small max-w-prose-sm mt-2">
          {pages.contact.beforeYouWrite.body}
        </p>
      </div>

      <Figure
        figure={figures[pages.contact.figure]}
        aspect="landscape"
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="mt-14 hidden lg:block"
      />
    </PageHeader>
  );
}
