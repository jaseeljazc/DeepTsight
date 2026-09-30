import type { Metadata } from "next";
import { getPageContent, getSeo } from "@/content";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Link } from "@/components/primitives/link";
import { SectionHeader } from "@/components/primitives/section-header";
import { MarkedText } from "@/components/primitives/placeholder";
import { TrackEventOnMount } from "@/components/seo/track-event-on-mount";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("/contact/thank-you");
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonical,
    },
  };
}

export default async function ThankYouPage() {
  const { thankYou } = await getPageContent();

  return (
    <>
      <TrackEventOnMount event="enquiry_succeeded" />

      <PageHeader
        breadcrumbs={[{ label: "Contact", href: "/contact" }, { label: "Enquiry sent" }]}
        title={thankYou.title}
        lead={thankYou.lead}
      />

      <Container className="section-b">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12">
          <SectionHeader title={thankYou.nextStepsTitle} className="lg:col-span-4" />
          <ol className="border-ink-900 border-t lg:col-span-8">
            {thankYou.nextSteps.map((step, index) => (
              <li key={step.title} className="border-rule grid-numbered grid gap-x-4 border-b py-7">
                <span className="tag-plate self-start">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-h3 text-ink-900 font-medium">{step.title}</h3>
                  <p className="text-ink-700 measure mt-2">
                    <MarkedText text={step.description} />
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-8 lg:col-start-5">
            <Link href="/services" variant="buttonPrimary" withArrow>
              Explore capabilities
            </Link>
            <Link href="/">Return to the home page</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
