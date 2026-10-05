import type { Payload } from "payload";

/*
 * The Local API with loose argument types, the same approach as src/content/cms-source.ts: the
 * generated collection types would force a cast at every call here.
 */

export type Doc = Record<string, unknown>;

export function asDoc(value: unknown): Doc {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Doc) : {};
}

export interface LocalApi {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[] }>;
  findByID(args: Record<string, unknown>): Promise<unknown>;
  findGlobal(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
  updateGlobal(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
}

export function localApi(payload: Payload): LocalApi {
  return payload as unknown as LocalApi;
}
