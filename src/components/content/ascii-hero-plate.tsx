"use client";

import * as React from "react";
import Image from "next/image";
import { Terminal, ImageIcon, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  POWER_PLANT_ASCII_LINES,
  POWER_PLANT_ASCII_TEXT,
  POWER_PLANT_ASCII_COLS,
  POWER_PLANT_ASCII_ROWS,
} from "./power-plant-ascii";

export type AsciiHeroPlateProps = {
  className?: string;
};

/**
 * AsciiHeroPlate: Renders an exact, calibrated ASCII matrix of public/images/power-plant.jpg
 * within an industrial telemetry console frame.
 *
 * Adheres to DeepTsight engineering guidelines:
 * - WCAG 2.2 AA compliant with programmatically accessible descriptions
 * - Responsive SVG vector viewport so 130x97 character grid maintains exact aspect ratio
 * - Hairline borders, no drop shadows, 2px/4px radii
 * - Toggleable between ASCII telemetry scan and source optical photograph
 */
export function AsciiHeroPlate({ className }: AsciiHeroPlateProps) {
  const [viewMode, setViewMode] = React.useState<"ascii" | "optical">("ascii");
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(POWER_PLANT_ASCII_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  }, []);

  // SVG coordinate calculations for exact IBM Plex Mono aspect ratio
  const charWidth = 8;
  const lineHeight = 10.3;
  const svgWidth = POWER_PLANT_ASCII_COLS * charWidth;
  const svgHeight = POWER_PLANT_ASCII_ROWS * lineHeight + 4;

  return (
    <figure
      className={cn("figure-numbered block", className)}
      role="region"
      aria-label="Power plant cooling infrastructure ASCII telemetry visualization"
    >
      <div className="rounded-panel border-rule-dark bg-ink-900 text-on-dark overflow-hidden border">
        {/* Terminal Header Bar */}
        <div className="border-rule-dark bg-ink-800/80 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="bg-status h-2 w-2 shrink-0 animate-pulse rounded-full"
              aria-hidden="true"
            />
            <span className="text-caption text-on-dark truncate font-mono tracking-wider uppercase">
              Telemetry // Cooling Units 01 & 02 [ASCII Scan]
            </span>
            <span className="tag-plate hidden h-auto px-1.5 py-0.5 sm:inline-flex">
              {POWER_PLANT_ASCII_COLS}×{POWER_PLANT_ASCII_ROWS} Matrix
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {/* View Switchers */}
            <div
              role="group"
              aria-label="Display mode"
              className="border-rule-dark rounded-control bg-ink-900 flex items-center border p-0.5"
            >
              <button
                type="button"
                onClick={() => setViewMode("ascii")}
                aria-pressed={viewMode === "ascii"}
                className={cn(
                  "text-caption rounded-control flex h-8 items-center gap-1.5 px-2.5 py-1 font-mono transition-colors",
                  viewMode === "ascii"
                    ? "bg-primary text-on-primary font-medium"
                    : "text-on-dark-muted hover:text-on-dark",
                )}
              >
                <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>ASCII</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("optical")}
                aria-pressed={viewMode === "optical"}
                className={cn(
                  "text-caption rounded-control flex h-8 items-center gap-1.5 px-2.5 py-1 font-mono transition-colors",
                  viewMode === "optical"
                    ? "bg-primary text-on-primary font-medium"
                    : "text-on-dark-muted hover:text-on-dark",
                )}
              >
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Optical</span>
              </button>
            </div>

            {/* Copy Button */}
            {viewMode === "ascii" && (
              <button
                type="button"
                onClick={handleCopy}
                title="Copy raw ASCII to clipboard"
                aria-label={copied ? "ASCII copied" : "Copy raw ASCII matrix to clipboard"}
                className="border-rule-dark rounded-control text-caption text-on-dark-muted hover:text-on-dark hover:border-control flex h-8 items-center gap-1 border px-2.5 py-1 font-mono transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="text-status h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-status xs:inline hidden">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="xs:inline hidden">Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Visual Display Port */}
        <div className="bg-ink-900 relative flex items-center justify-center p-2 py-8 sm:p-4 sm:py-12 md:p-6">
          {viewMode === "ascii" ? (
            <div
              className="text-on-dark mx-auto w-full max-w-4xl"
              role="img"
              aria-label="Exact ASCII art representation of dual hyperbolic cooling towers at a power generation facility, complete with steam plumes and support struts"
            >
              {/* Scalable SVG ensures proportional character alignment on every viewport without scroll breaks */}
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="block h-auto w-full font-mono select-all"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                {POWER_PLANT_ASCII_LINES.map((line, rowIndex) => (
                  <text
                    key={rowIndex}
                    x="0"
                    y={(rowIndex + 1) * lineHeight}
                    fill="currentColor"
                    fontSize="10.5"
                    letterSpacing="0"
                    xmlSpace="preserve"
                    className="text-on-dark font-mono opacity-95"
                  >
                    {line}
                  </text>
                ))}
              </svg>

              {/* Accessible text alternative for screen readers */}
              <div className="sr-only">
                ASCII matrix scan of Western Australia power generation facility cooling
                infrastructure showing dual hyperbolic towers with rising steam clouds.
                <pre>{POWER_PLANT_ASCII_TEXT}</pre>
              </div>
            </div>
          ) : (
            <div className="aspect-portrait rounded-control border-rule-dark relative mx-auto w-full max-w-xl overflow-hidden border">
              <Image
                src="/images/power-plant.jpg"
                alt="Western Australian power plant cooling towers with rising steam plumes"
                fill
                sizes="(max-width: 768px) 100vw, 620px"
                className="photo-grade object-cover"
                priority
              />
            </div>
          )}
        </div>

        {/* Console Status Footer */}
        <div className="border-rule-dark bg-ink-800/40 text-caption text-on-dark-muted flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-3 py-2 font-mono sm:px-4">
          <div className="flex items-center gap-3">
            <span>REF: PWR-GEN-AU-01</span>
            <span className="text-rule-dark hidden sm:inline">|</span>
            <span className="hidden sm:inline">DUAL HYPERBOLOID RECIRCULATION</span>
          </div>
          <div className="flex items-center gap-3">
            <span>RES: 130 COLUMNS</span>
            <span className="text-rule-dark">|</span>
            <span className="text-primary-on-dark">STATUS: NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Engineering Caption */}
      <figcaption className="text-caption text-steel-600 mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono">
        <span className="figure-number text-ink-900 shrink-0" />
        <span>
          Thermal generation facility cooling infrastructure. Luminance-calibrated ASCII matrix
          reconstructed from operational site capture.
        </span>
      </figcaption>
    </figure>
  );
}
