import assert from "node:assert/strict";
import { test } from "node:test";
import { REMOVED_FIGURE_ID, assertFigures, removedFigure } from "../../../src/content/rules";
import { figureSchema } from "../../../src/content/schema";

test("an empty figure id means the image was removed and is not an error", () => {
  assert.doesNotThrow(() => assertFigures({ hero: REMOVED_FIGURE_ID }, new Set(), "Test"));
});

test("an id that points at nothing is still an error", () => {
  assert.throws(() => assertFigures({ hero: "img-missing" }, new Set(["img-a"]), "Test"));
});

test("the placeholder for a removed image is a valid marked slot", () => {
  const figure = figureSchema.parse(removedFigure());
  assert.equal(figure.kind, "slot");
  assert.equal(figure.id, REMOVED_FIGURE_ID);
  assert.match(figure.kind === "slot" ? figure.subject : "", /removed/i);
});
