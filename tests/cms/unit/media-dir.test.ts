import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { mediaDirFor } from "../../../src/cms/collections/media";

test("each database gets its own media folder", () => {
  delete process.env["MEDIA_DIR"];
  const dev = mediaDirFor("postgresql://u:p@localhost:5432/deeptsight_cms_dev");
  const testDb = mediaDirFor("postgresql://u:p@localhost:5432/deeptsight_cms_test");
  assert.equal(dev, path.resolve(".data", "media", "deeptsight_cms_dev"));
  assert.notEqual(dev, testDb);
  assert.equal(mediaDirFor(undefined), path.resolve(".data", "media", "default"));
});
