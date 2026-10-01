import type { Metadata } from "next";
import { getFigures, getPageContent, getServices, getSite, getSeo } from "@/content";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Figure } from "@/components/primitives/figure";
import { Link } from "@/components/primitives/link";
import { SectionHeader } from "@/components/primitives/section-header";
import { SpecBlock } from "@/components/primitives/spec-block";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import { FinalCta } from "@/components/sections/final-cta";
import { ServiceIcon } from "@/components/content/service-icon";
import { lowerFirst } from "@/lib/utils";

export const dynamic = "force-static";

/* Column splits per block: not a strict mirror, so the four blocks do not read as one template. */
function blockLayout(index: number) {
  switch (index % 4) {
    case 0:
      return {
        media: "lg:col-span-7",
        text: "lg:col-span-5",
        sizes: "(max-width: 1024px) 100vw, 58vw",
      };
    case 1:
      return {
        media: "lg:order-2 lg:col-span-5 lg:col-start-8",
        text: "lg:order-1 lg:col-span-6",
        sizes: "(max-width: 1024px) 100vw, 42vw",
      };
    case 2:
      return {
        media: "lg:col-span-5",
        text: "lg:col-span-6 lg:col-start-7",
        sizes: "(max-width: 1024px) 100vw, 42vw",
      };
    default:
      return {
        media: "lg:order-2 lg:col-span-6 lg:col-start-7",
        text: "lg:order-1 lg:col-span-5",
        sizes: "(max-width: 1024px) 100vw, 50vw",
      };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("/services");
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

export default async function ServicesPage() {
  const [services, site, figures, pages] = await Promise.all([
    getServices(),
    getSite(),
    getFigures(),
    getPageContent(),
  ]);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Services" }]}
        title={pages.services.title}
        lead={pages.services.lead}
      />

      <Figure
        figure={figures["img-services-facility"]}
        aspect="wide"
        parallax
        preload
        sizes="100vw"
        captionClassName="mx-auto max-w-page px-5 sm:px-8"
      />

      {/* One feature block per pillar (FR-16). Column splits and image side vary down the page. */}
      <Section aria-label="Service pillars">
        <Container>
          <ol>
            {services.map((service, index) => {
              const layout = blockLayout(index);
              return (
                <li
                  key={service.slug}
                  className="border-rule grid grid-cols-1 items-center gap-x-8 gap-y-10 border-t py-16 first:border-t-0 first:pt-0 md:py-24 lg:grid-cols-12"
                >
                  <div className={layout.media}>
                    <Figure
                      figure={figures[service.media.hero]}
                      aspect="landscape"
                      reveal={index === 0}
                      sizes={layout.sizes}
                    />
                  </div>
                  <div className={layout.text}>
                    <SectionHeader
                      number={String(index + 1).padStart(2, "0")}
                      title={service.title}
                      icon={<ServiceIcon name={service.icon} />}
                      size="part"
                    />
                    <div className="sm:pl-part-indent mt-6 space-y-6">
                      <p className="text-ink-700">{service.summary}</p>
                      <SpecBlock
                        label={`${service.shortTitle} summary`}
                        items={[
                          { label: "Outcome", value: service.outcome },
                          { label: "Key standard", value: service.standards[0], mono: true },
                          {
                            label: "Scope",
                            value: (
                              <ul className="marker:text-control list-square space-y-1.5 pl-5">
                                {service.scopeAndOutputs.map((scope) => (
                                  <li key={scope.scope}>{scope.scope}</li>
                                ))}
                              </ul>
                            ),
                          },
                        ]}
                      />
                      <Link href={`/services/${service.slug}`}>
                        View {lowerFirst(service.shortTitle)}
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Container>
      </Section>

      <Section ground="panel" aria-labelledby="connect-heading">
        <Container className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="connect-heading" title="How the disciplines connect" />
          </div>
          <div className="lg:col-span-8">
            <Table caption="How the four disciplines connect">
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Typical trigger</TableHead>
                  <TableHead>Key standard</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.slug}>
                    <TableHead scope="row" className="py-5">
                      <span className="text-small flex items-start gap-2">
                        <ServiceIcon name={service.icon} size="inline" />
                        <Link href={`/services/${service.slug}`} className="text-small">
                          {service.shortTitle}
                        </Link>
                      </span>
                    </TableHead>
                    <TableCell className="py-5">{service.challenge}</TableCell>
                    <TableCell className="text-ink-900 text-caption py-5 font-mono">
                      {service.standards[0]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Container>
      </Section>

      <FinalCta
        email={site.email}
        finalCta={{ ...pages.services.finalCta, ctaLabel: site.ctaLabels.primary }}
      />
    </>
  );
}
