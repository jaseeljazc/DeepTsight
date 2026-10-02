/*
 * Small readers for Payload documents. Payload returns null for empty fields, arrays as rows with
 * an `id`, and relationships either as ids (depth 0, inside hooks) or populated documents. The
 * mappers read through these helpers so they work on both shapes and never use `any`.
 */

export type Doc = Record<string, unknown>;

export function asDoc(value: unknown): Doc {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Doc) : {};
}

export function str(doc: Doc, key: string): string {
  const value = doc[key];
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

/** Optional string: empty and null become undefined, as the Zod schemas expect. */
export function opt(doc: Doc, key: string): string | undefined {
  const value = str(doc, key);
  return value.length > 0 ? value : undefined;
}

export function bool(doc: Doc, key: string): boolean {
  return doc[key] === true;
}

export function num(doc: Doc, key: string, fallback = 0): number {
  const value = doc[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function group(doc: Doc, key: string): Doc {
  return asDoc(doc[key]);
}

export function rows(doc: Doc, key: string): Doc[] {
  const value = doc[key];
  return Array.isArray(value) ? value.map(asDoc) : [];
}

/** A `stringList` field (rows of `{ value }`) as a plain string array. */
export function list(doc: Doc, key: string): string[] {
  return rows(doc, key).map((row) => str(row, "value"));
}

/** Relationship values as an array, whether ids or populated documents. */
export function refs(doc: Doc, key: string): unknown[] {
  const value = doc[key];
  if (Array.isArray(value)) return value;
  return value === null || value === undefined ? [] : [value];
}

/**
 * The stable key of a referenced document: a field of the populated document (slug, legacyId),
 * or the id itself when the reference is not populated (inside hooks).
 */
export function refKey(ref: unknown, key: string): string {
  if (ref && typeof ref === "object") {
    const doc = ref as Doc;
    const value = doc[key];
    if (typeof value === "string" && value.length > 0) return value;
    return str(doc, "id");
  }
  return typeof ref === "number" || typeof ref === "string" ? String(ref) : "";
}

export function updatedAt(doc: Doc): string | undefined {
  return opt(doc, "updatedAt");
}
