import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFigures, getPageContent, getService, getServices, getSite } from "@/content";
import { ServiceTemplate } from "@/components/content/service-template";
import { serviceLd, breadcrumbLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site-url";
import { seoMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    return {
      title: "Service not found",
    };
  }

  return seoMetadata(service.seo);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, allServices, site, figures, pages] = await Promise.all([
    getService(slug),
    getServices(),
    getSite(),
    getFigures(),
    getPageContent(),
  ]);

  if (!service) {
    notFound();
  }

  // Filter related services based on service.relatedSlugs (FR-18)
  const relatedServices = allServices.filter((s) => service.relatedSlugs.includes(s.slug));

  const sLd = serviceLd(service, site);
  const bcLd = breadcrumbLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Services", url: absoluteUrl("/services") },
    { name: service.title, url: absoluteUrl(`/services/${service.slug}`) },
  ]);

  return (
    <>
      <JsonLd data={sLd} />
      <JsonLd data={bcLd} />
      <ServiceTemplate
        service={service}
        relatedServices={relatedServices}
        figures={figures}
        email={site.email}
        copy={pages.serviceTemplate}
        ctaLabel={site.ctaLabels.primary}
        labels={site.uiLabels}
      />
    </>
  );
}
