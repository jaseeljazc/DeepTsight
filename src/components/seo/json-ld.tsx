import * as React from "react";

export type JsonLdProps = {
  data: Record<string, unknown> | null;
};

/*
 * JSON.stringify leaves "<", ">" and "&" as they are, so a value containing "</script>" would end
 * the tag early. Escaping them as Unicode sequences keeps the JSON identical for parsers while
 * making the markup inert. This matters once the values come from a CMS editor (SEC-07).
 * U+2028 and U+2029 are escaped because older JavaScript parsers treat them as line breaks.
 */
function serialise(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Structured data. The only dangerouslySetInnerHTML outside compiled MDX, accepted because the
 * input is a plain object serialised and escaped here, never markup.
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(data) }} />
  );
}
