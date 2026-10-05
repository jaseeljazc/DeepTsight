import assert from "node:assert/strict";
import { test } from "node:test";
import { FRAME_LABEL, FRAME_RATIO } from "../../../src/cms/images/frames";

test("frame ratios match the site's aspect tokens", () => {
  assert.equal(FRAME_RATIO.wide, 21 / 9);
  assert.equal(FRAME_RATIO.landscape, 3 / 2);
  assert.equal(FRAME_RATIO.classic, 4 / 3);
  assert.equal(FRAME_RATIO.portrait, 4 / 5);
  assert.equal(FRAME_RATIO.square, 1);
  assert.equal(FRAME_RATIO.share, 1200 / 630);
});

test("every shape has words", () => {
  for (const shape of Object.keys(FRAME_RATIO)) {
    assert.ok(FRAME_LABEL[shape as keyof typeof FRAME_LABEL].length > 0, shape);
  }
});
