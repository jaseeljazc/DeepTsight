import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type WordmarkProps = {
  onDark?: boolean;
  /** `lg` in the footer; the header, menu and 404 use the default. */
  size?: "default" | "lg";
  className?: string;
};

/* The official logo files (supplied 2026-10-11, public/brand), used unchanged. Their artboard is
   400.62 × 78.87; width and height below keep that ratio, CSS sets the rendered height. */
const LOGO_WIDTH = 401;
const LOGO_HEIGHT = 79;

/**
 * The DeepTsight logo: the colour logo on light grounds, the white logo on the ink band.
 */
export function Wordmark({ onDark = false, size = "default", className }: WordmarkProps) {
  return (
    <Image
      src={onDark ? "/brand/deeptsight-logo-white.svg" : "/brand/deeptsight-logo-horizontal.svg"}
      alt="DeepTsight"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      unoptimized
      className={cn("w-auto select-none", size === "lg" ? "h-logo-lg" : "h-logo", className)}
    />
  );
}
