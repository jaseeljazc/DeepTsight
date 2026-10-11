import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { illustrations, type IllustrationKey } from "./illustrations";

export type BrandIllustrationProps = {
  name: IllustrationKey;
  /** What the illustration shows, or "" when the words beside it already say it all. */
  alt: string;
  sizes: string;
  className?: string;
};

/**
 * One of the client's brand illustrations (DESIGN.md §10, owner decision 2026-10-11). Still, never
 * animated, lazily loaded, and shown at its own proportions.
 */
export function BrandIllustration({ name, alt, sizes, className }: BrandIllustrationProps) {
  const art = illustrations[name];
  return (
    <Image
      src={`/illustrations/${art.file}`}
      alt={alt}
      width={art.width}
      height={art.height}
      sizes={sizes}
      unoptimized
      className={cn("h-auto w-full select-none", className)}
    />
  );
}
