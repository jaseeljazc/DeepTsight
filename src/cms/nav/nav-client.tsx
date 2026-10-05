"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  ClipboardList,
  FileText,
  History,
  House,
  Image as ImageIcon,
  Images,
  Inbox,
  Info,
  Layers,
  LayoutDashboard,
  ListChecks,
  ListTree,
  Newspaper,
  Scale,
  Search,
  Settings,
  Tag,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useNav } from "@payloadcms/ui";
import type { NavGroup } from "./nav-groups";

/*
 * Client parts of the admin sidebar. NavShell keeps Payload's own class names on the wrapper
 * (nav, nav--nav-open, ...) so its drawer behaviour on small screens keeps working; everything
 * inside is ours. Styles: src/app/(payload)/admin-theme.css.
 */

const ICONS: Record<string, LucideIcon> = {
  services: Layers,
  "proof-items": ClipboardList,
  credentials: BadgeCheck,
  "credential-groups": ListTree,
  articles: Newspaper,
  "article-categories": Tag,
  media: ImageIcon,
  images: Images,
  home: House,
  about: Info,
  pages: FileText,
  seo: Search,
  "legal-pages": Scale,
  "site-settings": Settings,
  enquiries: Inbox,
  "enquiry-types": ListChecks,
  users: Users,
  "audit-log": History,
};

export function NavShell({ children }: { children: React.ReactNode }) {
  const { hydrated, navOpen, navRef, shouldAnimate } = useNav();
  const className = [
    "nav",
    navOpen && "nav--nav-open",
    shouldAnimate && "nav--nav-animate",
    hydrated && "nav--nav-hydrated",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <aside className={className} inert={!navOpen ? true : undefined}>
      <div className="nav__scroll" ref={navRef}>
        {children}
      </div>
    </aside>
  );
}

/** Closes the drawer on phones and tablets; hidden on wide screens by the stylesheet. */
export function NavClose() {
  const { setNavOpen } = useNav();
  return (
    <button
      type="button"
      className="dts-nav__close"
      aria-label="Close menu"
      onClick={() => setNavOpen(false)}
    >
      <X aria-hidden="true" />
    </button>
  );
}

export function NavLinks({ groups, adminRoute }: { groups: NavGroup[]; adminRoute: string }) {
  const pathname = usePathname();
  const { setNavOpen } = useNav();

  const isCurrent = (href: string) =>
    pathname === href || (pathname.startsWith(href) && pathname[href.length] === "/");
  // Only where the drawer sits over the page (phones, tablets) does choosing a destination close
  // it. On a wide screen the sidebar stays as the editor left it; they collapse it themselves.
  const close = () => {
    if (window.matchMedia("(max-width: 1024px)").matches) setNavOpen(false);
  };

  return (
    <nav className="dts-nav" aria-label="Main">
      <ul className="dts-nav__list">
        <li>
          <Link
            className="dts-nav__link"
            href={adminRoute}
            prefetch={false}
            aria-current={pathname === adminRoute ? "page" : undefined}
            onClick={close}
          >
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </Link>
        </li>
      </ul>
      {groups.map((group) => (
        <div key={group.label} className="dts-nav__group">
          <h2 className="dts-nav__caption">{group.label}</h2>
          <ul className="dts-nav__list">
            {group.entries.map((entry) => {
              const Icon = ICONS[entry.slug] ?? FileText;
              return (
                <li key={entry.slug}>
                  <Link
                    className="dts-nav__link"
                    href={entry.href}
                    prefetch={false}
                    aria-current={isCurrent(entry.href) ? "page" : undefined}
                    onClick={close}
                  >
                    <Icon aria-hidden="true" />
                    {entry.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
