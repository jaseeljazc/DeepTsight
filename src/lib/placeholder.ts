/*
 * Unverified-content markers (CLAUDE.md §3). The single definition of the marker strings, shared by
 * the placeholder components and the JSON-LD builders.
 */
export const PLACEHOLDER_MARKERS = ["[PLACEHOLDER]", "TODO(CLIENT)", "TBD — CLIENT"] as const;

/** True when a content string still carries an unverified-copy marker. */
export function isPlaceholder(text: string | undefined | null): boolean {
  if (!text) return false;
  return PLACEHOLDER_MARKERS.some((marker) => text.includes(marker));
}
