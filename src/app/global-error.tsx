"use client";

import * as React from "react";
import "@/styles/globals.css";

/**
 * Last-resort error page, shown only when the root layout itself fails. It replaces the whole
 * document, so it carries its own <html> and <body>. Never shows the error, stack or digest
 * (SEC-14).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Root error boundary triggered", error.digest ?? "");
  }, [error]);

  return (
    <html lang="en-AU">
      <body className="bg-ground text-ink-700 min-h-screen font-sans antialiased">
        <main className="max-w-page mx-auto w-full px-5 py-24 sm:px-8">
          <h1 className="font-display text-h1 text-ink-900 font-medium">
            This page could not be loaded
          </h1>
          <p className="text-lead text-ink-700 measure mt-6">
            Try again, or go back to the home page.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <button
              type="button"
              onClick={() => reset()}
              className="bg-primary text-on-primary rounded-control min-h-control hover:bg-primary-deep px-6 font-medium"
            >
              Try again
            </button>
            {/* A plain link: the app's router may be the thing that failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="link-rule text-ink-900 min-h-target inline-flex items-center font-medium"
            >
              Return to the home page
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
