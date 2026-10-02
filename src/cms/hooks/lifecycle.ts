import {
  ValidationError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook,
  type GlobalAfterChangeHook,
  type GlobalBeforeChangeHook,
  type PayloadRequest,
} from "payload";
import { isProductionSite } from "../../lib/public-env";
import { placeholderPaths } from "../../lib/placeholder";
import { writeAudit } from "./audit";
import { revalidateTags, shouldRevalidate } from "./revalidate";

/*
 * Hooks every content collection and global shares:
 * - publish guard: when a document is published, it is mapped to the site's Zod shape and
 *   validated, so an editor sees the problem on save instead of a page that silently fails to
 *   update (02 Conventions). Drafts may be incomplete.
 * - first publish: stamps firstPublishedAt, which locks the slug (D-09).
 * - audit: create, update, publish and delete, plus every approval-flag change with from/to (03 §5).
 * - revalidation: the content tags affected by the change (02 tag map).
 */

export const SKIP_AUDIT = "skipAudit";

/**
 * Set only by scripts/cms/import-from-source.ts, for records whose publish confirmation must stay
 * a human decision (project notes: "contains no client, site or plant names"). Request context
 * cannot be set through the REST API or the admin.
 */
export const IMPORT_PUBLISH = "importPublish";

export interface PublishIssue {
  path: string;
  message: string;
}

/** Validates a merged document about to be published. Returns no issues when it may publish. */
export type PublishValidator = (
  doc: Record<string, unknown>,
  req: PayloadRequest,
) => PublishIssue[] | Promise<PublishIssue[]>;

function toValidationError(issues: PublishIssue[], collection?: string, global?: string) {
  return new ValidationError({
    ...(collection ? { collection } : {}),
    ...(global ? { global } : {}),
    errors: issues.map((issue) => ({ path: issue.path, message: issue.message })),
  });
}

function isPublishing(data: Record<string, unknown>): boolean {
  return data["_status"] === "published";
}

/** On the live site nothing carrying a placeholder marker can be published (Phase 11, CLAUDE.md §3). */
function placeholderIssues(doc: Record<string, unknown>): PublishIssue[] {
  if (!isProductionSite) return [];
  return placeholderPaths(doc).map((path) => ({
    path,
    message:
      "Still contains a placeholder marker ([PLACEHOLDER], TODO(CLIENT) or TBD — CLIENT). Replace it before publishing.",
  }));
}

export function collectionBeforeChange(
  slug: string,
  validate: PublishValidator,
): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, context }) => {
    if (!isPublishing(data)) return data;
    const merged = { ...(originalDoc ?? {}), ...data } as Record<string, unknown>;
    if (context[IMPORT_PUBLISH] !== true) {
      const issues = [...(await validate(merged, req)), ...placeholderIssues(merged)];
      if (issues.length > 0) throw toValidationError(issues, slug);
    }
    if (!merged["firstPublishedAt"]) data["firstPublishedAt"] = new Date().toISOString();
    return data;
  };
}

export function globalBeforeChange(
  slug: string,
  validate: PublishValidator,
): GlobalBeforeChangeHook {
  return async ({ data, originalDoc, req }) => {
    if (!isPublishing(data)) return data;
    const merged = { ...(originalDoc ?? {}), ...data } as Record<string, unknown>;
    const issues = [...(await validate(merged, req)), ...placeholderIssues(merged)];
    if (issues.length > 0) throw toValidationError(issues, undefined, slug);
    return data;
  };
}

function flagValue(doc: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object") return (value as Record<string, unknown>)[key];
    return undefined;
  }, doc);
}

async function auditFlags(
  req: PayloadRequest,
  target: string,
  docId: string | number | undefined,
  flags: string[],
  before: unknown,
  after: unknown,
): Promise<void> {
  for (const flag of flags) {
    const from = flagValue(before, flag) ?? null;
    const to = flagValue(after, flag) ?? null;
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      await writeAudit(req, {
        action: "flag-change",
        targetCollection: target,
        docId,
        field: flag,
        from,
        to,
      });
    }
  }
}

/** Tags to invalidate for a change; receives the new and previous document. */
export type TagsFor = (
  doc: Record<string, unknown>,
  previousDoc?: Record<string, unknown>,
) => string[];

export function collectionAfterChange(
  slug: string,
  { flags = [], tags }: { flags?: string[]; tags: TagsFor },
): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, operation, req, context }) => {
    if (context[SKIP_AUDIT] !== true) {
      const published = doc._status === "published";
      const action =
        operation === "create"
          ? "create"
          : published && previousDoc?._status !== "published"
            ? "publish"
            : "update";
      await writeAudit(req, { action, targetCollection: slug, docId: doc.id });
      await auditFlags(req, slug, doc.id, flags, operation === "create" ? {} : previousDoc, doc);
    }
    if (shouldRevalidate(context)) await revalidateTags(tags(doc, previousDoc), req);
    return doc;
  };
}

export function collectionAfterDelete(slug: string, tags: TagsFor): CollectionAfterDeleteHook {
  return async ({ doc, id, req, context }) => {
    if (context[SKIP_AUDIT] !== true) {
      await writeAudit(req, { action: "delete", targetCollection: slug, docId: id });
    }
    if (shouldRevalidate(context)) await revalidateTags(tags(doc as Record<string, unknown>), req);
    return doc;
  };
}

export function globalAfterChange(
  slug: string,
  { flags = [], tags }: { flags?: string[]; tags: string[] },
): GlobalAfterChangeHook {
  return async ({ doc, previousDoc, req, context }) => {
    if (context[SKIP_AUDIT] !== true) {
      await writeAudit(req, {
        action: doc._status === "published" ? "publish" : "update",
        targetCollection: slug,
      });
      await auditFlags(req, slug, undefined, flags, previousDoc, doc);
    }
    if (shouldRevalidate(context)) await revalidateTags(tags, req);
    return doc;
  };
}
