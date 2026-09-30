"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./wordmark";
import { Link } from "@/components/primitives/link";
import { Button } from "@/components/primitives/button";
import { cn, isActivePath } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
};

export type MobileNavProps = {
  items: NavItem[];
  ctaLabel: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen menu on the page ground (FR-04): traps focus, closes on Escape and on
 * route change, and returns focus to the trigger.
 */
export function MobileNav({ items, ctaLabel }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const close = React.useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("nav a")?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <div className="lg:hidden">
      <Button
        ref={triggerRef}
        type="button"
        variant="secondary"
        size="compact"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
        Menu
      </Button>

      {isOpen && (
        <div
          id="mobile-navigation-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="bg-ground fixed inset-0 z-50 flex flex-col overflow-y-auto px-5 pb-8 sm:px-8"
        >
          <div className="border-rule h-header flex shrink-0 items-center justify-between border-b">
            <Wordmark />
            <Button type="button" variant="secondary" size="compact" onClick={close}>
              <X className="h-4 w-4" aria-hidden="true" />
              Close
            </Button>
          </div>

          <nav aria-label="Primary" className="mt-6 flex-1">
            <ul className="border-ink-900 border-t">
              {items.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <li key={item.href} className="border-rule border-b">
                    <NextLink
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "font-display min-h-menu-row text-menu flex items-center",
                        isActive
                          ? "text-ink-900 underline-active"
                          : "text-ink-700 hover:text-ink-900",
                      )}
                    >
                      {item.label}
                    </NextLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-10">
            <Link href="/contact" variant="buttonPrimary" withArrow className="w-full">
              {ctaLabel}
            </Link>
            <p className="text-steel-600 text-small mt-4">Perth, Western Australia</p>
          </div>
        </div>
      )}
    </div>
  );
}
