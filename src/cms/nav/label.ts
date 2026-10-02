/*
 * Payload labels are a plain string or a map of language to string. The admin is English only, so
 * take the current language, then English, then whatever is there.
 */
export function labelText(label: unknown, language: string, fallback: string): string {
  if (typeof label === "string") return label;
  if (label && typeof label === "object") {
    const map = label as Record<string, unknown>;
    const pick = map[language] ?? map.en ?? Object.values(map)[0];
    if (typeof pick === "string") return pick;
  }
  return fallback;
}
