/**
 * The admin theme repeats a few of the site's colour tokens as values (the admin does not load
 * globals.css) and defines its own dashboard palette. This keeps them honest: the shared tokens
 * equal the site's, and every text pairing meets WCAG AA. Offline; reads the stylesheet and
 * src/styles/tokens.generated.ts.
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

const atLeast = (foreground: string, background: string, ratio: number, what: string) =>
  assert.ok(
    contrast(foreground, background) >= ratio,
    `${what}: ${foreground} on ${background} is ${contrast(foreground, background).toFixed(2)}`,
  );

test("the brand and status colours equal the site's tokens", () => {
  const pairs: [string, string][] = [
    ["--dts-primary", colorTokens.primary],
    ["--dts-primary-deep", colorTokens.primaryDeep],
    ["--dts-error", colorTokens.error],
    ["--dts-status", colorTokens.status],
  ];
  for (const [name, token] of pairs) assert.equal(variable(name), token.toUpperCase(), name);
});

test("body and muted text meet WCAG AA on every surface", () => {
  const surfaces = [variable("--dts-surface"), variable("--dts-page"), variable("--color-base-50")];
  for (const surface of surfaces) {
    atLeast(variable("--dts-ink"), surface, 7, "ink");
    atLeast(variable("--dts-muted"), surface, 4.5, "muted");
    atLeast(variable("--dts-primary-deep"), surface, 4.5, "link");
    atLeast(variable("--dts-error"), surface, 4.5, "error");
  }
  const scale = [400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000].map((n) =>
    variable(`--color-base-${n}`),
  );
  for (const colour of scale) {
    atLeast(colour, variable("--dts-surface"), 4.5, "neutral scale on white");
    atLeast(colour, variable("--dts-page"), 4.5, "neutral scale on page");
  }
});

test("icon tiles and pills are legible", () => {
  for (const tone of ["blue", "green", "purple", "orange", "grey"]) {
    atLeast(variable(`--dts-${tone}-fg`), variable(`--dts-${tone}-bg`), 4.5, `${tone} pill`);
  }
  atLeast(variable("--dts-green-fg"), variable("--dts-surface"), 4.5, "positive trend on white");
  atLeast("#FFFFFF", variable("--dts-primary"), 4.5, "white on primary");
  atLeast("#FFFFFF", variable("--dts-primary-deep"), 4.5, "white on hovered primary");
  atLeast(
    variable("--dts-primary-deep"),
    variable("--dts-primary-tint"),
    4.5,
    "selected search row",
  );
  atLeast(variable("--dts-primary-deep"), variable("--dts-primary-tint"), 4.5, "account initials");
  atLeast(variable("--dts-alert"), variable("--dts-surface"), 3, "unread badge");
  atLeast(variable("--dts-bar-unread"), variable("--dts-surface"), 3, "unread bar");
  atLeast(variable("--dts-primary"), variable("--dts-surface"), 3, "received bar");
});

test("the sidebar's text is legible on the navy", () => {
  const nav = variable("--dts-nav-bg");
  for (const name of ["--dts-nav-text", "--dts-nav-caption"])
    atLeast(variable(name), nav, 4.5, name);
  atLeast("#FFFFFF", variable("--dts-nav-hover"), 4.5, "hovered link");
  atLeast(variable("--dts-nav-caption"), variable("--dts-nav-raised"), 4.5, "caption on card");
  atLeast(variable("--dts-nav-text"), variable("--dts-nav-raised"), 4.5, "text on card");
  atLeast("#FFFFFF", variable("--dts-primary"), 4.5, "active link");
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

test("no shadows and no radius above 16px in the admin theme", () => {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // The \S makes the pattern fail on "none" (without it, backtracking over the space matches).
  assert.ok(!/box-shadow:\s*(?!none)\S/.test(withoutComments), "box-shadow other than none");
  for (const match of withoutComments.matchAll(/radius[^:]*:\s*(\d+)px/g))
    assert.ok(Number(match[1]) <= 16, match[0]);
});
