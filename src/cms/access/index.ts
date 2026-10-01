import type { Access, FieldAccess, PayloadRequest } from "payload";
import { MFA_COOKIE, isValidMfaCookie, readCookie } from "../mfa/cookie";

/*
 * One rule for the whole CMS (docs/cms/03_SECURITY_AND_OPS.md §3): an "admin" is a signed-in user
 * with a role AND a valid second-factor cookie bound to that user's current session. Every access
 * function, custom endpoint, the preview route and the inbox use it. Default deny.
 */

export const ROLES = ["editor", "approver"] as const;
export type Role = (typeof ROLES)[number];

type CmsUser = { id: number | string; collection?: string; roles?: unknown; _sid?: unknown };

function cmsUser(req: Pick<PayloadRequest, "user">): CmsUser | null {
  const user = req.user as CmsUser | null | undefined;
  if (!user || user.collection !== "users") return null;
  return user;
}

export function rolesOf(req: Pick<PayloadRequest, "user">): Role[] {
  const roles = cmsUser(req)?.roles;
  return Array.isArray(roles)
    ? roles.filter((role): role is Role => (ROLES as readonly string[]).includes(String(role)))
    : [];
}

export function sessionIdOf(req: Pick<PayloadRequest, "user">): string | undefined {
  const sid = cmsUser(req)?._sid;
  return typeof sid === "string" && sid.length > 0 ? sid : undefined;
}

/** Signed in with a password (first factor only). */
export function hasPasswordSession(req: Pick<PayloadRequest, "user">): boolean {
  return cmsUser(req) !== null && sessionIdOf(req) !== undefined;
}

export function hasValidMfa(req: Pick<PayloadRequest, "user" | "headers">): boolean {
  const user = cmsUser(req);
  if (!user) return false;
  const value = readCookie(req.headers.get("cookie"), MFA_COOKIE);
  return isValidMfaCookie(value, user.id, sessionIdOf(req));
}

export function isAdmin(req: Pick<PayloadRequest, "user" | "headers">): boolean {
  return hasValidMfa(req) && rolesOf(req).length > 0;
}

export function isApprover(req: Pick<PayloadRequest, "user" | "headers">): boolean {
  return isAdmin(req) && rolesOf(req).includes("approver");
}

export const adminOnly: Access = ({ req }) => isAdmin(req);
export const nobody: Access = () => false;

/** Approval flags: only approvers with a verified second factor may change them (03 §4). */
export const approverOnlyField: FieldAccess = ({ req }) => isApprover(req);
export const adminOnlyField: FieldAccess = ({ req }) => isAdmin(req);
export const noFieldAccess: FieldAccess = () => false;
