import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPage, getSeo } from "@/content";
import { LegalDocument } from "@/components/content/legal-document";
import { seoMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSeo("/legal/terms"));
}

export default async function TermsPage() {
  const page = await getLegalPage("terms");
  if (!page) notFound();

  return <LegalDocument page={page} reference={page.reference}></LegalDocument>;
}
