/**
 * check-contrast.ts
 * Recomputes WCAG 2.2 AA contrast ratios for design system token pairs
 * and fails if any required pair falls below its specified threshold.
 */

import { readColorTokens } from "./lib/read-design-tokens";

// Colours come straight from src/styles/globals.css, so this check always tests the live palette.
const tokens = readColorTokens();

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface TestCase {
  fg: string;
  bg: string;
  minRatio: number;
  description: string;
}

const testCases: TestCase[] = [
  {
    fg: "primary",
    bg: "ground",
    minRatio: 4.5,
    description: "Primary as text, focus ring and active rule on ground",
  },
  {
    fg: "primary",
    bg: "ground-deep",
    minRatio: 4.5,
    description: "Primary as text, focus ring and active rule on ground-deep",
  },
  {
    fg: "primary",
    bg: "panel",
    minRatio: 4.5,
    description: "Primary as text, focus ring and active rule on panel",
  },
  {
    fg: "primary",
    bg: "white",
    minRatio: 4.5,
    description: "Primary as text, focus ring and active rule on white",
  },
  {
    fg: "primary-on-dark",
    bg: "ink-900",
    minRatio: 4.5,
    description: "Primary tint (focus, lamps, links) on ink-900",
  },
  {
    fg: "primary-on-dark",
    bg: "ink-800",
    minRatio: 4.5,
    description: "Primary tint (focus, lamps, links) on ink-800",
  },
  {
    fg: "on-primary",
    bg: "primary",
    minRatio: 4.5,
    description: "Button and label plate text on primary",
  },
  {
    fg: "on-primary",
    bg: "primary-deep",
    minRatio: 4.5,
    description: "Button text on primary hover",
  },
  {
    fg: "ink-900",
    bg: "primary-on-dark",
    minRatio: 4.5,
    description: "Text on the on-dark primary button",
  },
  { fg: "ink-900", bg: "ground", minRatio: 4.5, description: "Headings on ground" },
  { fg: "ink-700", bg: "ground", minRatio: 4.5, description: "Body text on ground" },
  { fg: "steel-600", bg: "ground", minRatio: 4.5, description: "Meta text on ground" },
  { fg: "error", bg: "ground", minRatio: 4.5, description: "Error text on ground" },
  { fg: "control", bg: "ground", minRatio: 3, description: "Control borders on ground" },
  { fg: "ink-900", bg: "ground", minRatio: 3, description: "Focus ring on ground" },
  { fg: "ink-900", bg: "ground-deep", minRatio: 4.5, description: "Headings on ground-deep" },
  { fg: "ink-700", bg: "ground-deep", minRatio: 4.5, description: "Body text on ground-deep" },
  { fg: "steel-600", bg: "ground-deep", minRatio: 4.5, description: "Meta text on ground-deep" },
  { fg: "error", bg: "ground-deep", minRatio: 4.5, description: "Error text on ground-deep" },
  { fg: "control", bg: "ground-deep", minRatio: 3, description: "Control borders on ground-deep" },
  { fg: "ink-900", bg: "ground-deep", minRatio: 3, description: "Focus ring on ground-deep" },
  { fg: "ink-900", bg: "panel", minRatio: 4.5, description: "Headings on panel" },
  { fg: "ink-700", bg: "panel", minRatio: 4.5, description: "Body text on panel" },
  { fg: "steel-600", bg: "panel", minRatio: 4.5, description: "Meta text on panel" },
  { fg: "error", bg: "panel", minRatio: 4.5, description: "Error text on panel" },
  { fg: "control", bg: "panel", minRatio: 3, description: "Control borders on panel" },
  { fg: "ink-900", bg: "panel", minRatio: 3, description: "Focus ring on panel" },
  { fg: "ink-900", bg: "white", minRatio: 4.5, description: "Headings on white" },
  { fg: "ink-700", bg: "white", minRatio: 4.5, description: "Body text on white" },
  { fg: "steel-600", bg: "white", minRatio: 4.5, description: "Meta text on white" },
  { fg: "error", bg: "white", minRatio: 4.5, description: "Error text on white" },
  { fg: "control", bg: "white", minRatio: 3, description: "Control borders on white" },
  { fg: "ink-900", bg: "white", minRatio: 3, description: "Focus ring on white" },
  { fg: "on-dark", bg: "ink-900", minRatio: 4.5, description: "Text on ink-900" },
  { fg: "on-dark-muted", bg: "ink-900", minRatio: 4.5, description: "Muted text on ink-900" },
  { fg: "on-dark", bg: "ink-800", minRatio: 4.5, description: "Text on ink-800" },
  { fg: "on-dark-muted", bg: "ink-800", minRatio: 4.5, description: "Muted text on ink-800" },
  { fg: "on-dark", bg: "ink-900", minRatio: 4.5, description: "Primary button label" },
  { fg: "on-dark", bg: "ink-800", minRatio: 4.5, description: "Primary button label, hover" },
  {
    fg: "ink-700",
    bg: "ground-deep",
    minRatio: 4.5,
    description: "Body text on alternate sections",
  },
];

let failed = false;

console.log("Checking design token contrast ratios against WCAG 2.2 AA...");

for (const test of testCases) {
  const fgHex = tokens[test.fg];
  const bgHex = tokens[test.bg];

  if (!fgHex || !bgHex) {
    console.error(`Token missing: fg=${test.fg} or bg=${test.bg}`);
    failed = true;
    continue;
  }

  const ratio = contrastRatio(fgHex, bgHex);
  const passed = ratio >= test.minRatio;
  const status = passed ? "✓ PASS" : "✗ FAIL";
  const ratioStr = ratio.toFixed(2);

  console.log(
    `${status}: ${test.fg} (${fgHex}) on ${test.bg} (${bgHex}) -> ${ratioStr}:1 (required: ${test.minRatio}:1) [${test.description}]`,
  );

  if (!passed) {
    failed = true;
  }
}

if (failed) {
  console.error("\nContrast check failed! One or more token pairs violate WCAG AA requirements.");
  process.exit(1);
} else {
  console.log("\nAll design token contrast ratios meet or exceed WCAG 2.2 AA standards.");
}
