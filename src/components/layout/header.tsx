"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav, type NavItem } from "./mobile-nav";
import { Wordmark } from "./wordmark";
import { Link } from "@/components/primitives/link";
import { Container } from "./container";
import { cn, isActivePath } from "@/lib/utils";

export type HeaderProps = {
  navItems: NavItem[];
  /** Shown at the foot of the mobile menu. */
  locationLabel: string;
  ctaLabel: string;
  className?: string;
};

/**
 * Sticky header on the page ground. The hairline beneath it fades in once the page scrolls,
 * driven by a CSS scroll timeline rather than a scroll listener.
 */
export function Header({ navItems, ctaLabel, locationLabel, className }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "site-header bg-ground border-rule sticky top-0 z-40 w-full border-b",
        className,
      )}
    >
      <Container className="h-header flex items-center justify-between gap-6">
        <NextLink
          href="/"
          aria-label="DeepTsight Consulting, home"
          className="min-h-target flex items-center"
        >
          <Wordmark />
        </NextLink>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  variant="nav"
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            variant="buttonPrimary"
            size="compact"
            className="hidden px-5 sm:inline-flex"
          >
            {ctaLabel}
          </Link>
          <MobileNav items={navItems} ctaLabel={ctaLabel} locationLabel={locationLabel} />
        </div>
      </Container>

      {/* The menu button needs JavaScript. Without it, small screens get the links as a plain
          row instead, so navigation still works (REQUIREMENTS.md §8). */}
      <noscript>
        <nav aria-label="Primary" className="border-rule border-t lg:hidden">
          <Container>
            <ul className="flex flex-wrap items-center gap-x-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    variant="nav"
                    aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      </noscript>
    </header>
  );
}
