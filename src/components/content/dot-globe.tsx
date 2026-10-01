import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { GLOBE_PERTH } from "./dither-meta.generated";

export type DotGlobeProps = {
  /** Visible pin label. */
  label: string;
  className?: string;
};

// public/dither/globe-perth.svg: 124 cells of 7 units (scripts/generate-dither.ts).
const GLOBE_SIZE = 868;

/**
 * The globe in the hero plant's dot-matrix language, turned to Australia, with Perth pinned
 * as a rail terminal. Generated offline by `pnpm dither`; served as a static file so the page
 * does not carry its paths inline.
 */
export function DotGlobe({ label, className }: DotGlobeProps) {
  const pin = {
    "--pin-x": `${GLOBE_PERTH.x * 100}%`,
    "--pin-y": `${GLOBE_PERTH.y * 100}%`,
  } as React.CSSProperties;

  return (
    <div className={cn("relative", className)}>
      <Image
        src="/dither/globe-perth.svg"
        alt="Dot-matrix globe turned to Australia, with Perth marked on the west coast."
        width={GLOBE_SIZE}
        height={GLOBE_SIZE}
        unoptimized
        className="h-auto w-full select-none"
      />
      <span className="globe-pin" style={pin} aria-hidden="true">
        <span className="globe-pin-lead" />
        <span className="globe-pin-label text-small text-ink-900 font-mono font-medium">
          {label}
        </span>
      </span>
    </div>
  );
}
