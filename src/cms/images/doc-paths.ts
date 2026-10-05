/*
 * Read, change and compare plain documents by dotted path ("media.why", "steps.1.title"). The
 * Images page changes exactly one path of the latest draft, so a card that is out of date can never
 * overwrite another editor's changes to the rest of the section.
 */

const IGNORED = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "_status",
  "globalType",
  "publishedAt",
  "firstPublishedAt",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getPath(doc: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (Array.isArray(value)) return value[Number(key)];
    return isObject(value) ? value[key] : undefined;
  }, doc);
}

/** A copy of `doc` with one path set. Groups on the way are created when missing. */
export function setPath<T extends Record<string, unknown>>(
  doc: T,
  path: string,
  value: unknown,
): T {
  const [head, ...rest] = path.split(".");
  if (head === undefined) return doc;
  if (rest.length === 0) return { ...doc, [head]: value };
  const child = isObject(doc[head]) ? (doc[head] as Record<string, unknown>) : {};
  return { ...doc, [head]: setPath(child, rest.join("."), value) };
}

function empty(value: unknown): boolean {
  return value === null || value === undefined;
}

function walk(before: unknown, after: unknown, prefix: string, out: string[]): void {
  if (empty(before) && empty(after)) return;
  if (Array.isArray(before) || Array.isArray(after)) {
    const a = Array.isArray(before) ? before : [];
    const b = Array.isArray(after) ? after : [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      walk(a[i], b[i], prefix ? `${prefix}.${i}` : String(i), out);
    }
    return;
  }
  if (isObject(before) || isObject(after)) {
    const a = isObject(before) ? before : {};
    const b = isObject(after) ? after : {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!prefix && IGNORED.has(key)) continue;
      walk(a[key], b[key], prefix ? `${prefix}.${key}` : key, out);
    }
    return;
  }
  if (before !== after) out.push(prefix);
}

/** Dotted paths whose values differ between two documents (bookkeeping fields ignored). */
export function changedPaths(before: unknown, after: unknown): string[] {
  const out: string[] = [];
  walk(before, after, "", out);
  return out;
}
