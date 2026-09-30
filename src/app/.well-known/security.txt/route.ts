export const dynamic = "force-static";

export function GET() {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const content = [
    "# DeepTsight Consulting Security Policy",
    "Contact: mailto:enquiries@deeptsight.com",
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: en",
    "Canonical: https://deeptsight.com.au/.well-known/security.txt",
    "Policy: https://deeptsight.com.au/legal/privacy",
    "",
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
