import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPage, getSeo } from "@/content";
import { LegalDocument } from "@/components/content/legal-document";
import { Link } from "@/components/primitives/link";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("/legal/accessibility");
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

export default async function AccessibilityPage() {
  const page = await getLegalPage("accessibility");
  if (!page) notFound();

  return (
    <LegalDocument page={page} reference={page.reference}>
      <section aria-labelledby="feedback-heading" className="border-ink-900 mt-4 border-t pt-8">
        <h2 id="feedback-heading" className="font-display text-h3 text-ink-900 font-medium">
          Report an accessibility barrier
        </h2>
        <p className="text-ink-700 measure mt-4">
          If anything on this site is difficult to use with your browser, device or assistive
          technology, please describe the problem and the page it was on.
        </p>
        <Link href="/contact" variant="buttonSecondary" className="mt-6">
          Report a barrier
        </Link>
      </section>
    </LegalDocument>
  );
}
