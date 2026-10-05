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
    if (key === "") return undefined;
    if (Array.isArray(value)) {
      const index = Number(key);
      return index >= 0 && Number.isInteger(index) ? value[index] : undefined;
    }
    return isObject(value) ? value[key] : undefined;
  }, doc);
}

/**
 * A copy of `doc` with one path set. Groups (objects) on the way are created when missing.
 * Arrays are copied (not mutated). A path through a primitive replaces it with a group.
 */
function setPathRecurse(
  current: unknown,
  parts: string[],
  index: number,
  value: unknown
): unknown {
  if (index >= parts.length) return current;

  const key = parts[index];
  if (key === undefined) return current;
  const isLastKey = index === parts.length - 1;

  if (Array.isArray(current)) {
    const arrayIndex = Number(key);
    if (!Number.isInteger(arrayIndex) || arrayIndex < 0) {
      throw new Error(`Cannot setPath: invalid array index "${key}"`);
    }
    const copy = [...current];
    if (isLastKey) {
      copy[arrayIndex] = value;
    } else {
      copy[arrayIndex] = setPathRecurse(copy[arrayIndex], parts, index + 1, value);
    }
    return copy;
  }

  if (!isObject(current)) {
    current = {};
  }

  const obj = current as Record<string, unknown>;
  if (isLastKey) {
    return { ...obj, [key as string]: value };
  }

  const nextChild = obj[key as string];
  const newNextChild = setPathRecurse(nextChild, parts, index + 1, value);
  return { ...obj, [key as string]: newNextChild };
}

export function setPath<T extends Record<string, unknown>>(
  doc: T,
  path: string,
  value: unknown,
): T {
  const parts = path.split(".");
  if (parts[0] === "") throw new Error("Cannot setPath: empty path");
  return setPathRecurse(doc, parts, 0, value) as T;
}

function empty(value: unknown): boolean {
  return value === null || value === undefined;
}

function walk(
  before: unknown,
  after: unknown,
  prefix: string,
  out: string[],
  isArrayElement: boolean = false
): void {
  if (empty(before) && empty(after)) return;
  if (Array.isArray(before) || Array.isArray(after)) {
    const a = Array.isArray(before) ? before : [];
    const b = Array.isArray(after) ? after : [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      walk(a[i], b[i], prefix ? `${prefix}.${i}` : String(i), out, true);
    }
    return;
  }
  if (isObject(before) || isObject(after)) {
    const a = isObject(before) ? before : {};
    const b = isObject(after) ? after : {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!prefix && IGNORED.has(key)) continue;
      if (isArrayElement && key === "id") continue;
      walk(a[key], b[key], prefix ? `${prefix}.${key}` : key, out, false);
    }
    return;
  }
  if (before !== after) out.push(prefix);
}

/**
 * Dotted paths whose values differ between two documents (bookkeeping fields ignored).
 * The `id` field is ignored in array elements (Payload rows) but reported in populated
 * relationships (objects at other levels). Both documents must be read at the same depth:
 * relationships as ids on both sides, not a mix of populated objects and bare ids.
 */
export function changedPaths(before: unknown, after: unknown): string[] {
  const out: string[] = [];
  walk(before, after, "", out, false);
  return out;
}
