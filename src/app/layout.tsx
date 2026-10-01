import type { Metadata } from "next";
import { fontArchivo, fontPlexSans, fontPlexMono } from "@/styles/fonts";
import { isProductionSite, publicEnv } from "@/lib/public-env";
import { siteUrl } from "@/lib/site-url";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Preview, staging and local builds are never indexed (SEO-07).
  ...(isProductionSite ? {} : { robots: { index: false, follow: false } }),
  title: {
    template: "%s | DeepTsight Consulting",
    default: "DeepTsight Consulting | Industrial engineering and OT cybersecurity",
  },
  description:
    "Engineering consulting for critical infrastructure and heavy industry: control systems, OT cybersecurity, IT/OT segregation and plant reliability.",
  openGraph: {
    title: "DeepTsight Consulting | Industrial engineering and OT cybersecurity",
    description:
      "Engineering consulting for critical infrastructure and heavy industry: control systems, OT cybersecurity, IT/OT segregation and plant reliability.",
    url: siteUrl,
    siteName: "DeepTsight Consulting",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepTsight Consulting | Industrial engineering and OT cybersecurity",
    description:
      "Engineering consulting for critical infrastructure and heavy industry: control systems, OT cybersecurity, IT/OT segregation and plant reliability.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsDomain = publicEnv.analyticsDomain;

  return (
    <html
      lang="en-AU"
      className={`${fontArchivo.variable} ${fontPlexSans.variable} ${fontPlexMono.variable}`}
    >
      <head>
        {analyticsDomain && (
          <script
            defer
            data-domain={analyticsDomain}
            src="https://plausible.io/js/script.tagged-events.js"
          />
        )}
      </head>
      <body className="bg-ground text-ink-700 min-h-screen font-sans antialiased">
        {/* Skip-to-content link (A11Y-07, FR-06) */}
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-on-primary focus:rounded-control sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-3 focus:font-medium"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
