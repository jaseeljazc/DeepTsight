import * as React from "react";
import { Container } from "@/components/layout/container";
import NextLink from "next/link";
import { Link } from "@/components/primitives/link";
import { DrawingRule } from "@/components/primitives/drawing-rule";
import { Wordmark } from "@/components/layout/wordmark";
import { siteHost } from "@/lib/site-url";

/**
 * Rendered outside the site layout, so it carries its own landmarks and a way home (FR-08).
 * Framed like a drawing sheet with a title block.
 */
export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="bg-ground min-h-screen py-10 outline-none">
      <Container>
        <NextLink
          href="/"
          aria-label="DeepTsight Consulting, home"
          className="min-h-target inline-flex items-center"
        >
          <Wordmark />
        </NextLink>
        <DrawingRule className="mt-6" />

        <div className="border-ink-900 mt-16 grid grid-cols-1 border lg:grid-cols-12">
          <div className="p-8 md:p-14 lg:col-span-8">
            <h1 className="font-display text-h1 text-ink-900 max-w-headline-sm font-medium">
              This page isn&apos;t on the drawing
            </h1>
            <p className="text-lead text-ink-700 measure mt-8">
              The address may have changed or may never have existed. Try one of these pages.
            </p>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              <li>
                <Link href="/" variant="buttonPrimary" withArrow>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services">Services</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <dl className="border-ink-900 grid grid-cols-2 border-t lg:col-span-4 lg:grid-cols-1 lg:border-t-0 lg:border-l">
            {[
              ["Document", siteHost],
              ["Sheet", "Not found"],
              ["Status", "404"],
            ].map(([label, value]) => (
              <div key={label} className="border-rule border-b px-6 py-4 last:border-b-0">
                <dt className="text-steel-600 text-small">{label}</dt>
                <dd className="text-ink-900 text-caption mt-1 font-mono">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </main>
  );
}
