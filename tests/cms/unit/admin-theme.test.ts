/**
 * The admin theme repeats the site's colour tokens as values (the admin does not load globals.css).
 * This keeps them honest: every repeated token equals the site's, and every text pairing meets
 * WCAG AA. Offline; reads the stylesheet and src/styles/tokens.generated.ts.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { colorTokens } from "../../../src/styles/tokens.generated";

const css = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "(payload)", "admin-theme.css"),
  "utf8",
);

function variable(name: string): string {
  const match = new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(css);
  if (!match?.[1]) throw new Error(`${name} not found in admin-theme.css`);
  return match[1].toUpperCase();
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

test("repeated tokens equal the site's tokens", () => {
  const pairs: [string, string][] = [
    ["--dts-primary", colorTokens.primary],
    ["--dts-primary-deep", colorTokens.primaryDeep],
    ["--dts-primary-tint", colorTokens.dotFaint],
    ["--dts-error", colorTokens.error],
    ["--dts-status", colorTokens.status],
    ["--dts-panel", colorTokens.panel],
    ["--dts-rule", colorTokens.rule],
    ["--dts-ink", colorTokens.ink900],
    ["--dts-steel", colorTokens.steel600],
    ["--color-base-0", colorTokens.white],
    ["--color-base-50", colorTokens.panel],
    ["--color-base-100", colorTokens.ground],
    ["--color-base-150", colorTokens.groundDeep],
    ["--color-base-200", colorTokens.rule],
    ["--color-base-350", colorTokens.control],
    ["--color-base-500", colorTokens.steel600],
    ["--color-base-700", colorTokens.ink700],
    ["--color-base-800", colorTokens.ink800],
    ["--color-base-900", colorTokens.ink900],
  ];
  for (const [name, token] of pairs) assert.equal(variable(name), token.toUpperCase(), name);
});

test("text colours meet WCAG AA on white and on the panel ground", () => {
  const text = [400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000].map((n) =>
    variable(`--color-base-${n}`),
  );
  for (const colour of text) {
    assert.ok(contrast(colour, "#FFFFFF") >= 4.5, `${colour} on white`);
    assert.ok(contrast(colour, variable("--dts-panel")) >= 4.5, `${colour} on panel`);
  }
  assert.ok(contrast("#FFFFFF", variable("--dts-primary")) >= 4.5, "white on primary button");
  assert.ok(contrast("#FFFFFF", variable("--dts-primary-deep")) >= 4.5, "white on hovered button");
  assert.ok(
    contrast(variable("--dts-primary-deep"), variable("--dts-primary-tint")) >= 4.5,
    "active nav item",
  );
  for (const name of ["--dts-error", "--dts-status", "--dts-primary-deep", "--dts-steel"]) {
    assert.ok(contrast(variable(name), "#FFFFFF") >= 4.5, `${name} on white`);
  }
});

test("the neutral scale only gets darker", () => {
  const steps = [
    0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950,
    1000,
  ];
  const lum = steps.map((n) => luminance(variable(`--color-base-${n}`)));
  for (let i = 1; i < lum.length; i += 1)
    assert.ok((lum[i] ?? 0) <= (lum[i - 1] ?? 0) + 1e-9, `step ${steps[i]}`);
});

test("no shadows and no radius above 4px in the admin theme", () => {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // The \S makes the pattern fail on "none" (without it, backtracking over the space matches).
  assert.ok(!/box-shadow:\s*(?!none)\S/.test(withoutComments), "box-shadow other than none");
  for (const match of withoutComments.matchAll(/radius[^:]*:\s*(\d+)px/g))
    assert.ok(Number(match[1]) <= 4, match[0]);
});
