import { getSite } from "@/content";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export async function GET() {
  const site = await getSite();
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const content = [
    `# ${site.displayName} security policy`,
    `Contact: mailto:${site.email}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: en",
    `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
    `Policy: ${absoluteUrl("/legal/privacy")}`,
    "",
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
