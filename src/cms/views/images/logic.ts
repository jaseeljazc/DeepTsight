import { needsAttention } from "../../images/cards";
import type { SpotCard } from "../../images/types";

/*
 * The Images page's pure logic: search, filters, grouping, the library query and focal point
 * arithmetic. No React and no Payload, so it is unit-tested (tests/cms/unit/images-logic.test.ts)
 * and safe to import from the client components beside it.
 */

/** A Payload REST error as one sentence. */
export function restError(body: unknown): string {
  if (!body || typeof body !== "object") return "The upload was refused. Nothing was saved.";
  const errors = (
    body as {
      errors?: { message?: string; data?: { errors?: { path?: string; message?: string }[] } }[];
    }
  ).errors;
  const first = Array.isArray(errors) ? errors[0] : undefined;
  const nested = first?.data?.errors
    ?.map((e) => `${e.path ?? "field"}: ${e.message ?? "invalid"}`)
    .join("; ");
  return nested || first?.message || "The upload was refused. Nothing was saved.";
}

/** The new media id from a Payload REST create response, or null. */
export function createdId(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const id = (body as { doc?: { id?: unknown } }).doc?.id;
  return typeof id === "number" ? id : null;
}

export function matchesQuery(card: SpotCard, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [card.group, card.title, card.where, card.image?.caption, card.image?.filename]
    .filter((part) => typeof part === "string")
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export interface CardFilter {
  query: string;
  attentionOnly: boolean;
  /** A group name, or "" for every page. */
  page: string;
}

export function filterCards(cards: SpotCard[], filter: CardFilter): SpotCard[] {
  return cards.filter(
    (card) =>
      matchesQuery(card, filter.query) &&
      (!filter.attentionOnly || needsAttention(card)) &&
      (filter.page === "" || card.group === filter.page),
  );
}

/** Group names in first-seen order. */
export function pageNames(cards: SpotCard[]): string[] {
  return [...new Set(cards.map((card) => card.group))];
}

export interface CardGroup {
  name: string;
  path: string | null;
  cards: SpotCard[];
}

/** Cards grouped by page, keeping the order the server sent them in. */
export function groupCards(cards: SpotCard[]): CardGroup[] {
  const groups = new Map<string, CardGroup>();
  for (const card of cards) {
    const entry = groups.get(card.group) ?? { name: card.group, path: card.groupPath, cards: [] };
    entry.cards.push(card);
    groups.set(card.group, entry);
  }
  return [...groups.values()];
}

/** Every card showing the same image as `card` (itself included), for the focal point previews. */
export function siblingsOf(card: SpotCard, all: SpotCard[]): SpotCard[] {
  const id = card.image?.id;
  if (id === undefined) return [card];
  return all.filter((other) => other.image?.id === id);
}

/** The REST address for the picker's library: images only, badges or non-badges, by caption. */
export function libraryUrl(badgeOnly: boolean, query: string): string {
  const filter = badgeOnly
    ? "where[assetClass][equals]=issuer-badge"
    : "where[assetClass][not_equals]=issuer-badge";
  const needle = query.trim();
  const search = needle ? `&where[caption][like]=${encodeURIComponent(needle)}` : "";
  return `/api/media?limit=100&depth=0&sort=-updatedAt&where[kind][equals]=image&${filter}${search}`;
}

export interface Point {
  x: number;
  y: number;
}

const clamp = (value: number): number => Math.min(100, Math.max(0, value));
const tenth = (value: number): number => Math.round(value * 10) / 10;

/** Where a pointer landed inside a box, in percent from the top-left, to one decimal place. */
export function pointFromPointer(
  clientX: number,
  clientY: number,
  box: { left: number; top: number; width: number; height: number },
): Point {
  if (box.width <= 0 || box.height <= 0) return { x: 50, y: 50 };
  return {
    x: tenth(clamp(((clientX - box.left) / box.width) * 100)),
    y: tenth(clamp(((clientY - box.top) / box.height) * 100)),
  };
}

/** Moves the point for an arrow key (2%, or 10% with Shift). Null for any other key. */
export function nudgePoint(point: Point, key: string, shift: boolean): Point | null {
  const step = shift ? 10 : 2;
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const move = moves[key];
  if (!move) return null;
  return { x: tenth(clamp(point.x + move[0])), y: tenth(clamp(point.y + move[1])) };
}

/** Sets one axis from a slider value, ignoring anything that is not a number. */
export function setAxis(point: Point, axis: "x" | "y", value: number): Point {
  if (!Number.isFinite(value)) return point;
  return { ...point, [axis]: tenth(clamp(value)) };
}
