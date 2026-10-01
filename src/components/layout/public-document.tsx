import * as React from "react";
import { fontArchivo, fontPlexSans, fontPlexMono } from "@/styles/fonts";
import { publicEnv } from "@/lib/public-env";
import "@/styles/globals.css";

/**
 * The <html> document for every public page: language, self-hosted fonts, optional analytics and
 * the skip link. Used by the public root layout and by the global 404, which renders without a layout.
 */
export function PublicDocument({ children }: { children: React.ReactNode }) {
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
