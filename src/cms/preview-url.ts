/** An internal path only: starts with one "/", no scheme, no "//", no backslash, no control characters. */
export function safePreviewPath(value: string | null): string | null {
  if (!value || value.length > 300) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return null;
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  try {
    // Must resolve to the same origin and the same path it claims to be.
    const resolved = new URL(value, "http://preview.local");
    if (resolved.origin !== "http://preview.local") return null;
    return `${resolved.pathname}${resolved.search}`;
  } catch {
    return null;
  }
}

/** Preview address used by the admin's Preview button (handled by src/app/preview/route.ts). */
export function previewUrl(path: string): string {
  return `/preview?path=${encodeURIComponent(path)}`;
}
