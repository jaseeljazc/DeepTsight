import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPage, getSeo } from "@/content";
import { LegalDocument } from "@/components/content/legal-document";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("/legal/terms");
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

export default async function TermsPage() {
  const page = await getLegalPage("terms");
  if (!page) notFound();

  return <LegalDocument page={page} reference={page.reference}></LegalDocument>;
}
