import * as React from "react";
import { cn } from "@/lib/utils";

// Hero plant dot language: 7-unit cells, 3.2 / 4.4 / 5.6 dots, 4 x 4 ordered dither.
const CELL = 7;
const SIZES = [0, 3.2, 4.4, 5.6] as const;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const threshold = (x: number, y: number) => ((BAYER[(y % 4) * 4 + (x % 4)] ?? 0) + 0.5) / 16;

export type DotRampProps = {
  cols?: number;
  rows?: number;
  onDark?: boolean;
  className?: string;
};

/**
 * A band of dots that runs from sparse to solid, left to right: the dither ramp of the hero
 * plant, laid along the delivery sequence so each stage reads as the plant getting more certain.
 * Decorative.
 */
export function DotRamp({ cols = 160, rows = 5, onDark = false, className }: DotRampProps) {
  const light: string[] = [];
  const mid: string[] = [];
  const deep: string[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const d = x / (cols - 1);
      const level = Math.min(3, Math.floor(d * 3 + threshold(x, y)));
      if (level === 0) continue;
      const size = level === 1 ? SIZES[1] : level === 2 ? SIZES[2] : SIZES[3];
      const o = (CELL - size) / 2;
      const dot = `M${+(x * CELL + o).toFixed(1)} ${+(y * CELL + o).toFixed(1)}h${size}v${size}h-${size}Z`;
      (level === 1 ? light : level === 2 ? mid : deep).push(dot);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${cols * CELL} ${rows * CELL}`}
      preserveAspectRatio="xMinYMid meet"
      className={cn("dot-ramp-container block h-auto w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <g className="opacity-20">
        <path d={light.join("")} className={onDark ? "fill-rule-dark" : "fill-dot-light"} />
        <path d={mid.join("")} className={onDark ? "fill-primary" : "fill-dot-mid"} />
        <path d={deep.join("")} className={onDark ? "fill-primary-on-dark" : "fill-primary"} />
      </g>
      <g className="dot-ramp-charging">
        <path d={light.join("")} className={onDark ? "fill-rule-dark" : "fill-dot-light"} />
        <path d={mid.join("")} className={onDark ? "fill-primary" : "fill-dot-mid"} />
        <path d={deep.join("")} className={onDark ? "fill-primary-on-dark" : "fill-primary"} />
      </g>
    </svg>
  );
}
