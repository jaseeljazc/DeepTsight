import assert from "node:assert/strict";
import { test } from "node:test";
import { previewUrl, safePreviewPath } from "../../../src/cms/preview-url";

test("preview accepts internal paths only", () => {
  assert.equal(safePreviewPath("/services/ot-cybersecurity"), "/services/ot-cybersecurity");
  assert.equal(safePreviewPath("/"), "/");
  assert.equal(safePreviewPath("/about?x=1"), "/about?x=1");
  for (const bad of [
    null,
    "",
    "services",
    "//evil.example.com",
    "/\evil.example.com",
    "https://evil.example.com",
    "/javascript:alert(1)",
    "/%0d%0aSet-Cookie:x",
    "/\u0000",
  ]) {
    const result = safePreviewPath(bad);
    assert.ok(
      result === null || (result.startsWith("/") && !result.startsWith("//")),
      `refused: ${bad}`,
    );
  }
  assert.equal(safePreviewPath("//evil.example.com"), null);
  assert.equal(safePreviewPath("https://evil.example.com"), null);
});

test("preview links are encoded", () => {
  assert.equal(previewUrl("/services/a b"), "/preview?path=%2Fservices%2Fa%20b");
});
