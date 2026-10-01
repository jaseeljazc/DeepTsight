import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";
import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { firstPublishedAtField, seoGroup, slugField } from "../fields";
import {
  collectionAfterChange,
  collectionAfterDelete,
  collectionBeforeChange,
  type TagsFor,
} from "../hooks/lifecycle";
import { validateArticle } from "../hooks/validators";
import { previewUrl } from "../preview-url";
import { GROUPS, contentAccess, contentVersions } from "./shared";

/*
 * Insights (FR-25 to FR-29, Phase 13). Formatted text is limited to headings (H2, H3), bold,
 * italic, links, lists and quotations: no raw HTML, images or embeds (03 §9). It is rendered to
 * React nodes by src/components/content/rich-text.tsx, never as an HTML string (SEC-07).
 */

const WORDS_PER_MINUTE = 220;

/** Plain words of a Lexical document, for the reading time. */
export function lexicalWordCount(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const record = node as { text?: unknown; children?: unknown; root?: unknown };
  let count = typeof record.text === "string" ? record.text.split(/\s+/).filter(Boolean).length : 0;
  if (record.root) count += lexicalWordCount(record.root);
  if (Array.isArray(record.children)) {
    for (const child of record.children) count += lexicalWordCount(child);
  }
  return count;
}

const computeFields: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const body = data["body"] ?? originalDoc?.["body"];
  data["readingMinutes"] = Math.max(1, Math.ceil(lexicalWordCount(body) / WORDS_PER_MINUTE));
  // Set once, on the first publish; later edits keep the original date.
  if (data["_status"] === "published" && !(originalDoc?.["publishedAt"] ?? data["publishedAt"])) {
    data["publishedAt"] = new Date().toISOString();
  }
  return data;
};

const tags: TagsFor = (doc, previous) => [
  "articles",
  `article:${String(doc["slug"] ?? "")}`,
  ...(previous?.["slug"] && previous["slug"] !== doc["slug"]
    ? [`article:${String(previous["slug"])}`]
    : []),
];

export const Articles: CollectionConfig = {
  slug: "articles",
  labels: { singular: "Article", plural: "Articles" },
  admin: {
    group: GROUPS.insights,
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "_status"],
    preview: (doc) => previewUrl(`/insights/${String(doc["slug"] ?? "")}`),
    description:
      "Technical notes for the Insights section. Save drafts freely; only published articles appear, and only while Insights is switched on in Site settings. Never name a client, site, plant or network.",
  },
  access: contentAccess,
  versions: contentVersions,
  defaultSort: "-publishedAt",
  hooks: {
    beforeChange: [computeFields, collectionBeforeChange("articles", validateArticle)],
    afterChange: [collectionAfterChange("articles", { tags })],
    afterDelete: [collectionAfterDelete("articles", tags)],
  },
  fields: [
    slugField("Web address of the article, after /insights/."),
    { name: "title", type: "text", required: true },
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: { description: "One or two sentences for the article list and search results." },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
          BoldFeature(),
          ItalicFeature(),
          LinkFeature({ enabledCollections: [], disableAutoLinks: "creationOnly" }),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlockquoteFeature(),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      admin: {
        description: "Headings (H2, H3), bold, italic, links, lists and quotations only.",
      },
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "article-categories",
      hasMany: true,
    },
    {
      name: "publishedAt",
      label: "Published",
      type: "date",
      admin: { position: "sidebar", readOnly: true, description: "Set on the first publish." },
    },
    {
      name: "readingMinutes",
      label: "Reading time (minutes)",
      type: "number",
      admin: { position: "sidebar", readOnly: true, description: "Worked out from the length." },
    },
    seoGroup(),
    firstPublishedAtField,
  ],
};

export const ArticleCategories: CollectionConfig = {
  slug: "article-categories",
  labels: { singular: "Article category", plural: "Article categories" },
  admin: {
    group: GROUPS.insights,
    useAsTitle: "name",
    description: "Categories shown on articles.",
  },
  access: contentAccess,
  versions: contentVersions,
  hooks: {
    // No extra checks; this stamps firstPublishedAt, which locks the slug (D-09).
    beforeChange: [collectionBeforeChange("article-categories", () => [])],
    afterChange: [collectionAfterChange("article-categories", { tags: () => ["articles"] })],
    afterDelete: [collectionAfterDelete("article-categories", () => ["articles"])],
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("Short identifier for the category."),
    firstPublishedAtField,
  ],
};
