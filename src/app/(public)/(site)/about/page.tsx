import type { Metadata } from "next";
import { getAboutContent, getFigures, getPageContent, getSite, getSeo } from "@/content";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Figure } from "@/components/primitives/figure";
import { Link } from "@/components/primitives/link";
import { SectionHeader } from "@/components/primitives/section-header";
import { MarkedText, isPlaceholder } from "@/components/primitives/placeholder";
import { FinalCta } from "@/components/sections/final-cta";
import { personLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { seoMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSeo("/about"));
}

export default async function AboutPage() {
  const [about, site, figures, pages] = await Promise.all([
    getAboutContent(),
    getSite(),
    getFigures(),
    getPageContent(),
  ]);
  const [intro, ...narrative] = about.narrative.paragraphs;
  const linkedInPending = !site.linkedIn || isPlaceholder(site.linkedIn);

  return (
    <>
      <JsonLd data={personLd(about, site)} />

      <PageHeader breadcrumbs={[{ label: "About" }]} title={about.narrative.title} lead={intro} />

      <Section spacing="none" className="section-b">
        <Container className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Figure
              figure={figures[about.media.portrait]}
              aspect="portrait"
              preload
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="lg:sticky-below-header lg:sticky"
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="text-ink-700 measure text-lead space-y-6">
              {narrative.map((paragraph) => (
                <p key={paragraph}>
                  <MarkedText text={paragraph} />
                </p>
              ))}
            </div>

            <SectionHeader title="Career record" className="mt-20" />
            <ol className="border-ink-900 relative mt-8 border-l">
              {about.timeline.map((entry) => (
                <li key={entry.role} className="relative pb-12 pl-8 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="marker-square marker-on-rule bg-primary size-marker absolute top-1.5"
                  />
                  <p className="text-steel-600 text-caption font-mono">
                    <MarkedText text={entry.period} />
                  </p>
                  <h3 className="font-display text-h3 text-ink-900 mt-2 font-medium">
                    <MarkedText text={entry.role} />
                  </h3>
                  <p className="text-ink-700 mt-3">
                    <MarkedText text={entry.context} />
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-16 flex flex-wrap gap-x-8 gap-y-2">
              <Link href="/credentials">{site.ctaLabels.credentials}</Link>
              {linkedInPending ? (
                <span className="text-small min-h-target inline-flex items-center">
                  <MarkedText text={`${site.uiLabels.connectOnLinkedIn}: TBD — CLIENT`} />
                </span>
              ) : (
                <Link href={site.linkedIn ?? ""} isExternal>
                  {site.uiLabels.connectOnLinkedIn}
                </Link>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="none" className="section-b">
        <Container className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <Figure
            figure={figures[about.media.site]}
            aspect="landscape"
            reveal
            sizes="(max-width: 768px) 100vw, 58vw"
            className="md:col-span-7"
          />
          <Figure
            figure={figures[about.media.desk]}
            aspect="portrait"
            sizes="(max-width: 768px) 100vw, 40vw"
            className="md:col-span-4 md:col-start-9 md:mt-32"
          />
        </Container>
      </Section>

      {/* Delivery principles kept separate from the personal narrative (PROJECT.md §7) */}
      <Section ground="ground-deep" aria-labelledby="principles-heading">
        <Container className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="principles-heading" title="How DeepTsight works" />
          </div>
          <ol className="border-ink-900 grid grid-cols-1 border-t md:grid-cols-2 lg:col-span-8">
            {about.principles.map((principle, index) => (
              <li
                key={principle.title}
                className="border-rule grid-numbered grid gap-x-4 border-b py-8 md:odd:border-r md:odd:pr-8 md:even:pl-8"
              >
                <span className="tag-plate plate-align self-start">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-h3 text-ink-900 font-medium">
                    {principle.title}
                  </h3>
                  <p className="text-ink-700 mt-3">{principle.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <FinalCta
        labels={site.uiLabels}
        email={site.email}
        finalCta={{ ...pages.about.finalCta, ctaLabel: site.ctaLabels.primary }}
      />
    </>
  );
}
