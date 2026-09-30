/**
 * Reads design tokens from src/styles/globals.css, the single source of truth for the design
 * system. Used by the contrast check and by generate-tokens.ts.
 */
import fs from "node:fs";
import path from "node:path";

export const GLOBALS_CSS = path.resolve("src/styles/globals.css");

function readThemeBlock(): string {
  const css = fs.readFileSync(GLOBALS_CSS, "utf-8");
  const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (!theme?.[1]) throw new Error("No @theme block found in globals.css");
  return theme[1];
}

/** Colour tokens keyed by name without the prefix: --color-ink-900 -> "ink-900". */
export function readColorTokens(): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const match of readThemeBlock().matchAll(
    /--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g,
  )) {
    const [, name, value] = match;
    if (name && value) tokens[name] = value.toUpperCase();
  }
  if (Object.keys(tokens).length === 0) throw new Error("No colour tokens found in globals.css");
  return tokens;
}

/** Type-scale token names (--text-h2 -> "h2"), excluding their line-height and tracking parts. */
export function readFontSizeTokens(): string[] {
  const names = new Set<string>();
  for (const match of readThemeBlock().matchAll(/--text-([a-z0-9]+(?:-[a-z0-9]+)*)\s*:/g)) {
    const name = match[1];
    if (name) names.add(name);
  }
  return [...names];
}
