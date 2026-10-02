import type { PayloadRequest } from "payload";
import type { AuditAction } from "../collections/audit-log";

export interface AuditEntry {
  action: AuditAction;
  targetCollection?: string;
  docId?: string | number;
  field?: string;
  from?: unknown;
  to?: unknown;
  /** Defaults to req.user. */
  user?: { id: string | number; email?: string | null } | null;
}

function asText(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value.slice(0, 500);
  return JSON.stringify(value)?.slice(0, 500);
}

/**
 * Writes one audit entry through the Local API, inside the request's transaction. If the entry
 * cannot be written the operation fails too (fail closed): an unaudited approval change must not
 * go through.
 */
export async function writeAudit(req: PayloadRequest, entry: AuditEntry): Promise<void> {
  const user = entry.user ?? (req.user as { id: string | number; email?: string | null } | null);
  try {
    await req.payload.create({
      collection: "audit-log",
      overrideAccess: true,
      req,
      data: {
        at: new Date().toISOString(),
        userId: user ? String(user.id) : undefined,
        userEmail: user?.email ?? undefined,
        action: entry.action,
        targetCollection: entry.targetCollection,
        docId: entry.docId === undefined ? undefined : String(entry.docId),
        field: entry.field,
        from: asText(entry.from),
        to: asText(entry.to),
      },
    });
  } catch (error) {
    req.payload.logger.error(
      `Audit write failed for ${entry.action}: ${error instanceof Error ? error.name : "UnknownError"}`,
    );
    throw error;
  }
}
