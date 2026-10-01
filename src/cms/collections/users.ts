import { APIError, type CollectionConfig } from "payload";
import { publicEnv } from "../../lib/public-env";
import { checkRateLimit, clientIp } from "../../lib/rate-limit";
import { ROLES, adminOnly, approverOnlyField, isApprover, noFieldAccess, nobody } from "../access";
import { writeAudit } from "../hooks/audit";
import { hashIp } from "../lib/secrets";
import { mfaEndpoints } from "../mfa/endpoints";

/** 10 sign-in attempts per 15 minutes per (hashed) IP address (docs/cms/03_SECURITY_AND_OPS.md §2). */
const LOGIN_IP_LIMIT = 10;
const LOGIN_IP_WINDOW_SECONDS = 15 * 60;

/** Set by scripts/cms/create-admin.ts. Every other way of creating an account is refused. */
export const ALLOW_ACCOUNT_CREATION = "allowAccountCreation";

const hiddenMfaField = {
  hidden: true,
  access: { read: noFieldAccess, create: noFieldAccess, update: noFieldAccess },
} as const;

/**
 * CMS accounts. Created only with scripts/cms/create-admin.ts; there is no sign-up, no "create
 * first user" and no password-reset email. Passwords are reset with scripts/cms/reset-admin-password.ts.
 */
export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    group: "System",
    defaultColumns: ["email", "name", "roles"],
    description:
      "People who can sign in to the CMS. Accounts are created by the developer, not here.",
  },
  auth: {
    tokenExpiration: 2 * 60 * 60,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    useAPIKey: false,
    cookies: {
      // The live site is https only (env rules); local http development cannot use Secure cookies.
      secure: publicEnv.siteUrl.startsWith("https://"),
      sameSite: "Strict",
    },
  },
  access: {
    admin: ({ req }) => adminOnly({ req }) === true,
    read: adminOnly,
    create: nobody,
    update: adminOnly,
    delete: ({ req }) => isApprover(req),
    unlock: adminOnly,
  },
  endpoints: mfaEndpoints,
  hooks: {
    beforeOperation: [
      async ({ operation, req, context }) => {
        if (operation === "create" && context[ALLOW_ACCOUNT_CREATION] !== true) {
          throw new APIError("Accounts are created by the site developer.", 403);
        }
        if (operation === "forgotPassword" || operation === "resetPassword") {
          // No email adapter: a reset email would only be written to the server log.
          throw new APIError("Password reset is done by the site developer.", 403);
        }
        if (operation === "login") {
          const allowed = await checkRateLimit(
            "cms-login",
            hashIp(clientIp(req.headers)),
            LOGIN_IP_LIMIT,
            LOGIN_IP_WINDOW_SECONDS,
          );
          if (!allowed) {
            throw new APIError("Too many sign-in attempts. Try again in 15 minutes.", 429);
          }
        }
      },
    ],
    afterLogin: [
      async ({ req, user }) => {
        await writeAudit(req, {
          action: "login",
          targetCollection: "users",
          docId: user.id,
          user: { id: user.id, email: (user as { email?: string }).email },
        });
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        if (operation !== "update") return;
        const before = JSON.stringify(previousDoc?.roles ?? []);
        const after = JSON.stringify(doc.roles ?? []);
        if (before !== after) {
          await writeAudit(req, {
            action: "flag-change",
            targetCollection: "users",
            docId: doc.id,
            field: "roles",
            from: previousDoc?.roles ?? [],
            to: doc.roles ?? [],
          });
        }
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      admin: { description: "Shown in the audit log next to this account's changes." },
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["editor"],
      options: ROLES.map((value) => ({
        value,
        label: value === "editor" ? "Editor" : "Approver",
      })),
      access: { update: approverOnlyField },
      admin: {
        description:
          "Editors change content. Approvers can also set the approval flags (verified, disclosure approved, approved for public).",
      },
    },
    // Second factor (TOTP). Never sent to the browser; read only by server code.
    { name: "totpSecret", type: "text", ...hiddenMfaField },
    { name: "pendingTotpSecret", type: "text", ...hiddenMfaField },
    { name: "totpLastStep", type: "number", ...hiddenMfaField },
    { name: "recoveryCodeHashes", type: "json", ...hiddenMfaField },
    { name: "mfaEnrolledAt", type: "date", ...hiddenMfaField },
  ],
};
