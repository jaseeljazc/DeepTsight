import * as React from "react";
import NextLink from "next/link";
import { Prose } from "@/components/primitives/prose";
import type { RichText as RichTextValue } from "@/content/types";

/*
 * Renders CMS rich text (Lexical JSON) as React elements inside the Prose primitive. Never as an
 * HTML string (SEC-07, 03 §9). Only the node types the editor allows are drawn: paragraphs, H2/H3,
 * bold, italic, links, lists and quotations. Anything else renders its text only, or nothing.
 */

type Node = {
  type?: unknown;
  tag?: unknown;
  text?: unknown;
  format?: unknown;
  listType?: unknown;
  children?: unknown;
  fields?: { url?: unknown; newTab?: unknown; linkType?: unknown };
  url?: unknown;
};

const BOLD = 1;
const ITALIC = 2;

/** http, https, mailto, or a path on this site. Anything else (javascript:, data:, //host) is refused. */
export function safeHref(value: unknown): { href: string; external: boolean } | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\"))
    return { href, external: false };
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:")
      return { href: url.toString(), external: true };
    if (url.protocol === "mailto:") return { href, external: false };
  } catch {
    return null;
  }
  return null;
}

function children(node: Node): Node[] {
  return Array.isArray(node.children) ? (node.children as Node[]) : [];
}

function renderChildren(node: Node, keyPrefix: string): React.ReactNode[] {
  return children(node).map((child, index) => renderNode(child, `${keyPrefix}.${index}`));
}

function renderText(node: Node, key: string): React.ReactNode {
  const text = typeof node.text === "string" ? node.text : "";
  const format = typeof node.format === "number" ? node.format : 0;
  let element: React.ReactNode = text;
  if (format & ITALIC) element = <em>{element}</em>;
  if (format & BOLD) element = <strong>{element}</strong>;
  return <React.Fragment key={key}>{element}</React.Fragment>;
}

function renderLink(node: Node, key: string): React.ReactNode {
  const content = renderChildren(node, key);
  const target =
    node.fields?.linkType === "internal" ? null : safeHref(node.fields?.url ?? node.url);
  if (!target) return <React.Fragment key={key}>{content}</React.Fragment>;
  if (target.external) {
    return (
      <a
        key={key}
        href={target.href}
        rel="noopener noreferrer"
        {...(node.fields?.newTab === true ? { target: "_blank" } : {})}
      >
        {content}
      </a>
    );
  }
  if (target.href.startsWith("mailto:")) {
    return (
      <a key={key} href={target.href}>
        {content}
      </a>
    );
  }
  return (
    <NextLink key={key} href={target.href}>
      {content}
    </NextLink>
  );
}

function renderNode(node: Node, key: string): React.ReactNode {
  switch (node.type) {
    case "text":
      return renderText(node, key);
    case "linebreak":
      return <br key={key} />;
    case "tab":
      return " ";
    case "paragraph":
      return <p key={key}>{renderChildren(node, key)}</p>;
    case "heading":
      return node.tag === "h3" ? (
        <h3 key={key}>{renderChildren(node, key)}</h3>
      ) : (
        <h2 key={key}>{renderChildren(node, key)}</h2>
      );
    case "quote":
      return <blockquote key={key}>{renderChildren(node, key)}</blockquote>;
    case "list":
      return node.listType === "number" ? (
        <ol key={key}>{renderChildren(node, key)}</ol>
      ) : (
        <ul key={key}>{renderChildren(node, key)}</ul>
      );
    case "listitem":
      return <li key={key}>{renderChildren(node, key)}</li>;
    case "link":
    case "autolink":
      return renderLink(node, key);
    default:
      // Unknown or disallowed node: keep any text, drop the formatting.
      return children(node).length > 0 ? (
        <React.Fragment key={key}>{renderChildren(node, key)}</React.Fragment>
      ) : null;
  }
}

export function RichText({ value, className }: { value: RichTextValue; className?: string }) {
  const root = value.root as Node;
  return <Prose className={className}>{renderChildren(root, "rt")}</Prose>;
}
