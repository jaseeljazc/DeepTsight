import type { ZodType } from "zod";
import { RESERVED_ARTICLE_SLUGS } from "../../lib/insights";
import {
  aboutContentSchema,
  articleSchema,
  credentialSchema,
  homeContentSchema,
  legalPageSchema,
  pagesContentSchema,
  proofItemSchema,
  seoEntrySchema,
  serviceSchema,
  siteSourceSchema,
} from "../../content/schema";
import {
  mapAbout,
  mapCredential,
  mapHome,
  mapPages,
  mapProofItem,
  mapSeo,
  mapService,
  mapSite,
} from "../../content/mappers";
import { mapArticle, mapLegalPage } from "../../content/mappers";
import type { Doc } from "../../content/mappers/util";
import type { PublishIssue, PublishValidator } from "./lifecycle";

/*
 * Publish validators: the document is mapped to the site's shape and parsed with the same Zod
 * schema the site uses, so anything that would break the page is refused at publish time.
 */

function zodIssues(schema: ZodType, value: unknown): PublishIssue[] {
  const result = schema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: issue.path.join(".") || "document",
    message: issue.message,
  }));
}

function requireText(doc: Doc, paths: string[]): PublishIssue[] {
  return paths
    .filter((path) => {
      const value = path.split(".").reduce<unknown>((current, key) => {
        if (current && typeof current === "object") return (current as Doc)[key];
        return undefined;
      }, doc);
      return typeof value !== "string" || value.trim().length === 0;
    })
    .map((path) => ({ path, message: "Required before publishing." }));
}

export const validateService: PublishValidator = (doc) => {
  const issues = zodIssues(serviceSchema, mapService(doc));
  const steps = Array.isArray(doc["deliveryApproach"]) ? doc["deliveryApproach"].length : 0;
  if (steps !== 4) {
    issues.push({
      path: "deliveryApproach",
      message: "A service has exactly four delivery steps (the page animation shows four).",
    });
  }
  const related = Array.isArray(doc["relatedServices"]) ? doc["relatedServices"] : [];
  const selfId = doc["id"];
  if (
    selfId !== undefined &&
    related.some((ref) => (typeof ref === "object" && ref ? (ref as Doc)["id"] : ref) === selfId)
  ) {
    issues.push({ path: "relatedServices", message: "A service cannot be related to itself." });
  }
  return issues;
};

export const validateCredential: PublishValidator = (doc) => {
  const issues = zodIssues(credentialSchema, mapCredential(doc));
  const expiry = doc["expiry"];
  if (typeof expiry === "string" && expiry.length > 0 && !/^\d{4}$/.test(expiry)) {
    issues.push({
      path: "expiry",
      message: "Enter the expiry year as four digits, for example 2028.",
    });
  }
  return issues;
};

export const validateProofItem: PublishValidator = (doc) => {
  const issues = zodIssues(proofItemSchema, mapProofItem(doc));
  if (doc["noIdentifyingDetailsConfirmed"] !== true) {
    issues.push({
      path: "noIdentifyingDetailsConfirmed",
      message: "Confirm the note contains no client, site or plant names before publishing.",
    });
  }
  return issues;
};

export const validateMedia: PublishValidator = (doc) => {
  if (doc["kind"] === "slot") return requireText(doc, ["subject", "caption"]);
  const issues = requireText(doc, ["caption", "source", "licence", "usageRights"]);
  if (doc["decorative"] !== true) issues.push(...requireText(doc, ["alt"]));
  if (!doc["filename"]) issues.push({ path: "file", message: "Upload an image file." });
  return issues;
};

export const validateLegalPage: PublishValidator = (doc) =>
  zodIssues(legalPageSchema, mapLegalPage(doc));

export const validateCredentialGroup: PublishValidator = (doc) =>
  requireText(doc, ["category", "title"]);

export const validateSite: PublishValidator = (doc) => zodIssues(siteSourceSchema, mapSite(doc));

export const validateHome: PublishValidator = (doc) => {
  // The trust strip and proof items are relationships, checked by their own collections.
  return zodIssues(homeContentSchema, mapHome(doc, [], []));
};

export const validateAbout: PublishValidator = (doc) =>
  zodIssues(aboutContentSchema, mapAbout(doc));

export const validatePages: PublishValidator = (doc) =>
  zodIssues(pagesContentSchema, mapPages(doc));

export const validateSeo: PublishValidator = (doc) =>
  Object.entries(mapSeo(doc)).flatMap(([route, entry]) =>
    zodIssues(seoEntrySchema, entry).map((issue) => ({ ...issue, path: `${route} ${issue.path}` })),
  );

export const validateArticle: PublishValidator = (doc) => {
  // publishedAt is stamped by the articles hook just before this check on the first publish.
  const issues = zodIssues(articleSchema, { ...mapArticle(doc, true), status: "published" });
  const slug = typeof doc["slug"] === "string" ? doc["slug"] : "";
  if (RESERVED_ARTICLE_SLUGS.includes(slug))
    issues.push({
      path: "slug",
      message: `"${slug}" is reserved for the site. Choose a different web address.`,
    });
  const body = doc["body"] as { root?: { children?: unknown[] } } | undefined;
  if (!body?.root?.children?.length)
    issues.push({ path: "body", message: "Write the article before publishing." });
  return issues;
};
