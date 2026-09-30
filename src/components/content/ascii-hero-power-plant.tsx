import * as React from "react";
import { cn } from "@/lib/utils";
import {
  DITHER_WIDTH,
  DITHER_HEIGHT,
  DITHER_BG_PATH,
  DITHER_LIGHT_PATH,
  DITHER_MID_PATH,
  DITHER_DEEP_PATH,
} from "./power-plant-dither-paths";

export type AsciiHeroPowerPlantProps = {
  className?: string;
  align?: "center" | "right";
};

/**
 * Dithered dot-matrix vector rendering of the Western Australian power plant cooling towers
 * in the DeepTsight electric brand blue palette (#0e50ed / primary).
 *
 * Inspired by technical ordered-dither telemetry displays.
 */
export function AsciiHeroPowerPlant({ className, align = "right" }: AsciiHeroPowerPlantProps) {
  const aspectRatio = align === "center" ? "xMidYMax meet" : "xMaxYMax meet";

  return (
    <div
      className={cn("flex w-full flex-col items-end justify-end", className)}
      role="img"
      aria-label="Digital dot-matrix telemetry representation of dual hyperbolic cooling towers and ground infrastructure at a power generation facility in brand blue"
    >
      {/* Pure transparent dither vector canvas */}
      <div className="flex h-full w-full items-end justify-end overflow-hidden bg-transparent">
        <svg
          viewBox={`0 0 ${DITHER_WIDTH} ${DITHER_HEIGHT}`}
          className="block h-full w-full align-bottom"
          preserveAspectRatio={aspectRatio}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hero-dither-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <mask id="hero-fade-mask">
              <rect width={DITHER_WIDTH} height={DITHER_HEIGHT} fill="url(#hero-dither-fade)" />
            </mask>
          </defs>

          <g mask="url(#hero-fade-mask)">
            {/* Layer 1: Background engineering dot matrix (faint brand blue tint) */}
            <path d={DITHER_BG_PATH} fill="#dce5ff" opacity="0.6" />

            {/* Layer 2: Highlight dots (periwinkle tint) */}
            <path d={DITHER_LIGHT_PATH} fill="#a4beff" opacity="0.8" />

            {/* Layer 3: Midtone dots (medium electric blue) */}
            <path d={DITHER_MID_PATH} fill="#4f7eff" opacity="0.9" />

            {/* Layer 4: Deep saturated brand primary blue (#0e50ed) */}
            <path d={DITHER_DEEP_PATH} fill="#0e50ed" />
          </g>
        </svg>

        {/* Accessible screen reader text alternative */}
        <div className="sr-only">
          Dot-matrix diagram showing dual hyperbolic cooling towers with base struts and ground pipe
          at an industrial power generation plant in Western Australia.
        </div>
      </div>
    </div>
  );
}
