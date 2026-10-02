import assert from "node:assert/strict";
import { test } from "node:test";
import { placeholderPaths } from "../../../src/lib/placeholder";

test("placeholderPaths lists paths of marked strings only, never values", () => {
  const paths = placeholderPaths(
    {
      title: "Ready",
      identifier: "TBD — CLIENT",
      rows: [{ value: "fine" }, { value: "[PLACEHOLDER] mock" }],
      nested: { note: "TODO(CLIENT): confirm" },
      count: 3,
    },
    "doc",
  );
  assert.deepEqual(paths, ["doc.identifier", "doc.rows[1].value", "doc.nested.note"]);
  assert.ok(paths.every((path) => !path.includes("TBD")));
});
