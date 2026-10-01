/**
 * Rich text renderer (Phase 13, 03 §9): React nodes only, safe links, unknown nodes dropped.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RichText, safeHref } from "../../../src/components/content/rich-text";
import { lexicalWordCount } from "../../../src/cms/collections/articles";

const text = (value: string, format = 0) => ({ type: "text", text: value, format });

const doc = {
  root: {
    type: "root",
    children: [
      { type: "heading", tag: "h2", children: [text("Segregation in practice")] },
      {
        type: "paragraph",
        children: [text("Plain, "), text("bold", 1), text(" and "), text("italic", 2)],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "link",
            fields: { linkType: "custom", url: "https://example.com/a", newTab: true },
            children: [text("external")],
          },
          {
            type: "link",
            fields: { linkType: "custom", url: "javascript:alert(1)" },
            children: [text("bad link")],
          },
          {
            type: "link",
            fields: { linkType: "custom", url: "/services" },
            children: [text("internal")],
          },
        ],
      },
      {
        type: "list",
        listType: "number",
        children: [{ type: "listitem", children: [text("one")] }],
      },
      { type: "quote", children: [text("A quotation")] },
      { type: "html", html: "<script>alert(1)</script>", children: [] },
      { type: "paragraph", children: [text("<img src=x onerror=alert(1)>")] },
    ],
  },
};

test("renders allowed nodes as elements and escapes text", () => {
  const html = renderToStaticMarkup(React.createElement(RichText, { value: doc }));
  assert.match(html, /<h2>Segregation in practice<\/h2>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /<ol><li>one<\/li><\/ol>/);
  assert.match(html, /<blockquote>A quotation<\/blockquote>/);
  assert.ok(!html.includes("<script"), "no raw HTML node");
  assert.ok(!html.includes("<img"), "text is escaped");
  assert.match(html, /&lt;img src=x/);
});

test("links: external get rel, unsafe schemes become plain text", () => {
  const html = renderToStaticMarkup(React.createElement(RichText, { value: doc }));
  assert.match(
    html,
    /<a href="https:\/\/example.com\/a" rel="noopener noreferrer" target="_blank">external<\/a>/,
  );
  assert.ok(!html.includes("javascript:"), "javascript: link dropped");
  assert.match(html, /bad link/);
  assert.match(html, /<a href="\/services">internal<\/a>/);
});

test("safeHref allows http, https, mailto and site paths only", () => {
  assert.equal(safeHref("https://example.com")?.external, true);
  assert.equal(safeHref("mailto:test@example.com")?.external, false);
  assert.equal(safeHref("/about")?.href, "/about");
  for (const bad of [
    "javascript:alert(1)",
    "data:text/html,x",
    "//evil.example.com",
    "/\\evil",
    "vbscript:x",
    42,
  ]) {
    assert.equal(safeHref(bad), null, String(bad));
  }
});

test("reading time counts words in the document", () => {
  assert.equal(lexicalWordCount(doc), 17);
});
