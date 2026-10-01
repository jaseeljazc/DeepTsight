import * as React from "react";
import { cn } from "@/lib/utils";

/** 5 x 7 matrix glyphs, top row first. Only the digits the site uses. */
const ZERO = ["01110", "10001", "10001", "10001", "10001", "10001", "01110"];
const GLYPHS: Record<string, string[]> = {
  "0": ZERO,
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
};

// Same cell and deep-dot size as the hero plant (7-unit grid, 5.6 dots).
const CELL = 7;
const LIT = 5.6;

export type DotNumeralProps = {
  /** Digits to draw, e.g. "01". */
  value: string;
  onDark?: boolean;
  className?: string;
};

/**
 * A number set on the hero plant's dot matrix, lit cells only, in the primary.
 * Decorative: list order carries the numbering for assistive tech.
 */
export function DotNumeral({ value, onDark = false, className }: DotNumeralProps) {
  const glyphs = value.split("").map((digit) => GLYPHS[digit] ?? ZERO);
  const cols = glyphs.length * 6 - 1;
  const lit: string[] = [];

  glyphs.forEach((rows, g) => {
    rows.forEach((row, y) => {
      row.split("").forEach((bit, x) => {
        const cx = (g * 6 + x) * CELL;
        const cy = y * CELL;
        if (bit !== "1") return;
        const o = (CELL - LIT) / 2;
        lit.push(`M${cx + o} ${cy + o}h${LIT}v${LIT}h-${LIT}Z`);
      });
    });
  });

  return (
    <svg
      viewBox={`0 0 ${cols * CELL} ${7 * CELL}`}
      className={cn("block h-auto", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d={lit.join("")} className={onDark ? "fill-primary-on-dark" : "fill-primary"} />
    </svg>
  );
}
