import assert from "node:assert/strict";
import { test } from "node:test";
import { objectPositionOf } from "../../../src/lib/focal";
import { mapMedia } from "../../../src/content/mappers";
import { figureSchema } from "../../../src/content/schema";

test("no focal point means no object-position (the image stays centred)", () => {
  assert.equal(objectPositionOf(undefined), undefined);
  assert.equal(objectPositionOf({}), undefined);
  assert.equal(objectPositionOf({ focalX: null, focalY: null }), undefined);
});

test("a focal point becomes an object-position in percent", () => {
  assert.equal(objectPositionOf({ focalX: 20, focalY: 80 }), "20% 80%");
});

test("a missing axis falls back to the centre", () => {
  assert.equal(objectPositionOf({ focalX: 30 }), "30% 50%");
  assert.equal(objectPositionOf({ focalY: 10 }), "50% 10%");
});

test("values outside 0-100 or not numbers are clamped, never NaN", () => {
  assert.equal(objectPositionOf({ focalX: 150, focalY: -20 }), "100% 0%");
  assert.equal(objectPositionOf({ focalX: Number.NaN, focalY: 40 }), "50% 40%");
});

test("mapMedia carries the focal point into the figure contract", () => {
  const figure = figureSchema.parse(
    mapMedia({
      id: 7,
      kind: "image",
      filename: "a.jpg",
      alt: "Test",
      caption: "Test",
      width: 100,
      height: 100,
      source: "s",
      licence: "l",
      usageRights: "u",
      approvedForPublic: true,
      focalX: 25,
      focalY: 75,
    }),
  );
  assert.equal(figure.kind, "image");
  if (figure.kind === "image") {
    assert.equal(figure.focalX, 25);
    assert.equal(figure.focalY, 75);
  }
});
