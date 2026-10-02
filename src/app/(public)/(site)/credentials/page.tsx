import type { Metadata } from "next";
import { getCredentials, getFigures, getPageContent, getSite, getSeo } from "@/content";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { AnchorNav } from "@/components/layout/anchor-nav";
import { Figure } from "@/components/primitives/figure";
import { Placeholder } from "@/components/primitives/placeholder";
import { CredentialGroup } from "@/components/content/credential-group";
import { FinalCta } from "@/components/sections/final-cta";

export const dynamic = "force-static";
/** Re-rendered daily so an expired credential drops off without a publish (FR-21). */
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("/credentials");
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

export default async function CredentialsPage() {
  const [groups, site, figures, pages] = await Promise.all([
    getCredentials(),
    getSite(),
    getFigures(),
    getPageContent(),
  ]);
  const numbered = groups.map((group, index) => ({ group, number: `${index + 1}.0` }));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Credentials" }]}
        title={pages.credentials.title}
        lead={pages.credentials.lead}
      />

      <Figure
        figure={figures[pages.credentials.figure]}
        aspect="wide"
        parallax
        sizes="100vw"
        captionClassName="mx-auto max-w-page px-5 sm:px-8"
      />

      <Container className="section-y grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
        {numbered.length > 0 ? (
          <>
            <aside className="hidden lg:col-span-3 lg:block">
              <AnchorNav
                label="Register"
                items={numbered.map(({ group, number }) => ({
                  id: group.category,
                  number,
                  label: group.title,
                }))}
              />
            </aside>
            <div className="lg:col-span-8 lg:col-start-5">
              {numbered.map(({ group, number }) => (
                <CredentialGroup key={group.category} group={group} number={number} />
              ))}
            </div>
          </>
        ) : (
          <div className="lg:col-span-8">
            <Placeholder label="No credentials have been verified for publication yet" />
          </div>
        )}
      </Container>

      <FinalCta
        labels={site.uiLabels}
        email={site.email}
        finalCta={{ ...pages.credentials.finalCta, ctaLabel: site.ctaLabels.primary }}
      />
    </>
  );
}
