import { notFound } from "next/navigation";
import { getSite, getArticles } from "@/content";

export const dynamic = "force-static";

export default async function InsightsPage() {
  const [site, articles] = await Promise.all([getSite(), getArticles()]);

  // FR-27: If zero published articles exist at launch, /insights returns 404
  if (!site.insightsEnabled || articles.length === 0) {
    notFound();
  }

  return null;
}
