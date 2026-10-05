import { APIError, type CollectionBeforeDeleteHook } from "payload";
import { findUsages } from "./data";

/*
 * An image that a page still uses must not be deleted by accident. The Media section's own delete
 * is refused with a message that points to the Images page. That page's delete action sets this
 * request-context key after its two-step confirmation.
 *
 * The key can only be set from server code (the Local API's `context` argument). Request context
 * cannot be set through the REST API or the admin, so a browser can never skip this check (same
 * pattern as IMPORT_PUBLISH in hooks/lifecycle.ts).
 *
 * findUsages reads with overrideAccess. That is safe here because Payload only reaches this hook
 * after the collection's delete access (admin only) has passed, or from server code that has
 * already checked isAdmin().
 */
export const ALLOW_IN_USE_DELETE = "allowInUseDelete";

function refusal(count: number | null): APIError {
  const where =
    count === null
      ? "It may be in use."
      : `This image is used in ${count} place${count === 1 ? "" : "s"}.`;
  return new APIError(
    `${where} Delete it from "Images on the website", which shows where it is used.`,
    409,
  );
}

export const refuseInUseDelete: CollectionBeforeDeleteHook = async ({ id, req, context }) => {
  if (context[ALLOW_IN_USE_DELETE] === true) return;
  const numeric = typeof id === "number" ? id : Number(id);
  // Fail closed: an id we cannot check is never deleted here.
  if (!Number.isFinite(numeric)) throw refusal(null);
  const usages = await findUsages(req.payload, numeric);
  if (usages.length > 0) throw refusal(usages.length);
};
