"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/*
 * "Back to <list>" in the top bar, shown only on a collection document (edit, create, versions).
 * Globals have no list to return to, so they get none. The list page itself shows nothing.
 */

export type BackTargets = Record<string, string>;

export function BackLink({ adminRoute, labels }: { adminRoute: string; labels: BackTargets }) {
  const pathname = usePathname();
  const prefix = `${adminRoute}/collections/`;
  if (!pathname.startsWith(prefix)) return null;

  const [slug, ...rest] = pathname.slice(prefix.length).split("/");
  const label = slug ? labels[slug] : undefined;
  // /collections/<slug> alone is the list; anything deeper is a document.
  if (!slug || !label || rest.filter(Boolean).length === 0) return null;

  return (
    <Link
      className="dts-back"
      href={`${prefix}${slug}`}
      prefetch={false}
      aria-label={`Back to ${label}`}
    >
      <ArrowLeft aria-hidden="true" />
      <span>Back</span>
    </Link>
  );
}
