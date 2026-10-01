import type { Metadata } from "next";
import { getFigures, getHomeContent, getServices, getSite, getSeo } from "@/content";
import { HeroSection } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { CapabilityRail } from "@/components/sections/capability-rail";
import { WhyDeepTsight } from "@/components/sections/why-deeptsight";
import { ProblemsAddressed } from "@/components/sections/problems-addressed";
import { DeliveryApproach } from "@/components/sections/delivery-approach";
import { SelectedProof } from "@/components/sections/selected-proof";
import { PerthContext } from "@/components/sections/perth-context";
import { FinalCta } from "@/components/sections/final-cta";
import { organizationLd, localBusinessLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("/");
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

export default async function HomePage() {
  const [home, site, services, figures] = await Promise.all([
    getHomeContent(),
    getSite(),
    getServices(),
    getFigures(),
  ]);

  return (
    <div className="rail-page">
      <JsonLd data={organizationLd(site)} />
      <JsonLd data={localBusinessLd(site)} />

      {/* Nine homepage sections in the order set by PROJECT.md §7 (FR-11) */}
      <HeroSection hero={home.hero} figure={figures[home.media.hero]} />
      <TrustStrip items={home.trustStrip} copy={home.trustStripCopy} />
      <CapabilityRail
        title={home.coreCapabilitiesTitle}
        intro={home.coreCapabilitiesIntro}
        capabilities={home.coreCapabilities}
        services={services}
        convergenceLabel={home.whyDeepTsight.convergenceLabel}
      />
      <WhyDeepTsight whyDeepTsight={home.whyDeepTsight} figure={figures[home.media.why]} />
      <ProblemsAddressed
        problemsAddressed={home.problemsAddressed}
        figure={figures[home.media.problems]}
      />
      <DeliveryApproach deliveryApproach={home.deliveryApproach} />
      <SelectedProof title={home.selectedProofTitle} proofs={home.selectedProof} />
      <PerthContext perthContext={home.perthContext} />
      <FinalCta
        finalCta={home.finalCta}
        email={site.email}
        phone={site.phone}
        band={figures[home.media.close]}
        rail
        particulars={[
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
          { label: "Response time", value: site.responseTime },
          { label: "Service area", value: site.serviceArea },
        ]}
      />
    </div>
  );
}
