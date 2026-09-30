import type { Metadata } from "next";
import { getEnquiryOptions, getFigures, getPageContent, getSite, getSeo } from "@/content";
import { PageHeader } from "@/components/layout/page-header";
import { Figure } from "@/components/primitives/figure";
import { Link } from "@/components/primitives/link";
import { SpecBlock } from "@/components/primitives/spec-block";
import { MarkedText, isPlaceholder } from "@/components/primitives/placeholder";
import { EnquiryForm } from "@/components/forms/enquiry-form";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("/contact");
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonical,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      type: "website",
    },
  };
}

export default async function ContactPage() {
  const [site, figures, pages, enquiryOptions] = await Promise.all([
    getSite(),
    getFigures(),
    getPageContent(),
    getEnquiryOptions(),
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
          { label: "Location", value: "Perth, Western Australia" },
          { label: "Service area", value: "Australia-wide" },
          {
            label: "LinkedIn",
            value: linkedInPending ? (
              <MarkedText text="TBD — CLIENT" />
            ) : (
              <Link href={site.linkedIn ?? ""} isExternal>
                Deepak Pazhoor on LinkedIn
              </Link>
            ),
          },
          { label: "Response time", value: "Within 1 business day" },
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
        figure={figures["img-contact-office"]}
        aspect="landscape"
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="mt-14 hidden lg:block"
      />
    </PageHeader>
  );
}
