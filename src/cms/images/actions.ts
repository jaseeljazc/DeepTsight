"use server";

import { headers } from "next/headers";
import { APIError, getPayload, ValidationError, type Payload, type PayloadRequest } from "payload";
import config from "@payload-config";
import { isAdmin } from "../access";
import { setPath } from "./doc-paths";
import { ALLOW_IN_USE_DELETE } from "./in-use";
import { findUsages } from "./data";
import { asDoc, localApi, type Doc } from "./local-api";
import type { ActionResult, OwnerRef } from "./types";
import {
  decodeSpotId,
  imageProblemFor,
  isConfirmed,
  isImageRecord,
  parseId,
  parseOwner,
  parsePercent,
  parseSpotPath,
  writable,
} from "./validate";

/*
 * Every write the Images page makes. Each action first parses its arguments at runtime (a server
 * action receives whatever the browser sends), then authenticates the caller with the same isAdmin
 * rule as the rest of the CMS (signed in AND a valid second-factor cookie), re-reads the latest
 * draft at call time, and changes one path only. Writes go through the Local API with the user, so
 * the publish guard, the audit log and revalidation all run as for any other edit. Approval flags
 * are never sent (see writable()).
 *
 * The reads and writes use overrideAccess. That is safe ONLY because adminContext() has passed.
 * Nothing here logs request data.
 */

const NOT_ALLOWED = "You are not allowed to do this.";
const FAILED = "Something went wrong. Nothing was changed.";

/** Thrown when the caller is not an admin. Never carries the reason. */
class NotAllowedError extends Error {}

interface Context {
  payload: Payload;
  user: unknown;
}

async function adminContext(): Promise<Context> {
  const payload = await getPayload({ config });
  const requestHeaders = await headers();
  let user: unknown = null;
  try {
    ({ user } = await payload.auth({ headers: requestHeaders }));
  } catch {
    throw new NotAllowedError();
  }
  const probe = { user, headers: requestHeaders } as unknown as Pick<
    PayloadRequest,
    "user" | "headers"
  >;
  if (!isAdmin(probe)) throw new NotAllowedError();
  return { payload, user };
}

/**
 * Plain words for an error: generic for a failed sign-in check, validation messages with their
 * field names, Payload's own user-facing messages, and a generic line for anything else (database
 * errors are never passed to the browser).
 */
function describe(error: unknown): string {
  if (error instanceof NotAllowedError) return NOT_ALLOWED;
  if (error instanceof ValidationError) {
    const errors = (error.data as { errors?: { path?: string; message?: string }[] } | undefined)
      ?.errors;
    if (errors?.length) {
      return errors
        .map((item) => `${item.path ?? "field"}: ${item.message ?? "invalid"}`)
        .join("; ");
    }
  }
  if (error instanceof APIError && error.message) return error.message;
  return FAILED;
}

const refuse = (message: string): ActionResult => ({ ok: false, message });

async function readLatest(payload: Payload, owner: OwnerRef): Promise<Doc> {
  const api = localApi(payload);
  if (owner.kind === "global") {
    return asDoc(
      await api.findGlobal({ slug: owner.slug, draft: true, depth: 0, overrideAccess: true }),
    );
  }
  return asDoc(
    await api.findByID({
      collection: owner.slug,
      id: owner.id,
      draft: true,
      depth: 0,
      overrideAccess: true,
    }),
  );
}

/** The latest draft of a media record, or null when there is none. */
async function readMedia(payload: Payload, id: number): Promise<Doc | null> {
  const { docs } = await localApi(payload).find({
    collection: "media",
    where: { id: { equals: id } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  const doc = docs[0];
  return doc === undefined ? null : asDoc(doc);
}

async function save(
  { payload, user }: Context,
  owner: OwnerRef,
  data: Doc,
  draft: boolean,
): Promise<void> {
  const api = localApi(payload);
  const args = { data, draft, overrideAccess: true, user };
  if (owner.kind === "global") await api.updateGlobal({ slug: owner.slug, ...args });
  else await api.update({ collection: owner.slug, id: owner.id, ...args });
}

const places = (count: number): string => `${count} place${count === 1 ? "" : "s"}`;

export async function setSpotImage(
  ownerInput: OwnerRef,
  pathInput: string,
  mediaInput: number | null,
): Promise<ActionResult> {
  const owner = parseOwner(ownerInput);
  const path = owner ? parseSpotPath(owner, pathInput) : null;
  if (!owner || path === null) return refuse("That image spot is not recognised.");
  const mediaId = mediaInput === null ? null : parseId(mediaInput);
  if (mediaInput !== null && mediaId === null) return refuse("That image was not found.");
  try {
    const context = await adminContext();
    if (mediaId !== null) {
      const problem = imageProblemFor(await readMedia(context.payload, mediaId), owner, path);
      if (problem) return refuse(problem);
    }
    const latest = writable(await readLatest(context.payload, owner));
    await save(context, owner, setPath(latest, path, mediaId), true);
    return { ok: true, message: "Saved as a draft. Preview it, then publish." };
  } catch (error) {
    return refuse(describe(error));
  }
}

export async function publishSpot(ownerInput: OwnerRef): Promise<ActionResult> {
  const owner = parseOwner(ownerInput);
  if (!owner) return refuse("That section is not recognised.");
  try {
    const context = await adminContext();
    const latest = writable(await readLatest(context.payload, owner));
    await save(context, owner, { ...latest, _status: "published" }, false);
    return { ok: true, message: "Published." };
  } catch (error) {
    return refuse(describe(error));
  }
}

export async function saveFocalPoint(
  mediaInput: number,
  xInput: number,
  yInput: number,
): Promise<ActionResult> {
  const mediaId = parseId(mediaInput);
  if (mediaId === null) return refuse("That image was not found.");
  const x = parsePercent(xInput);
  const y = parsePercent(yInput);
  if (x === null || y === null) {
    return refuse("The focal point must be between 0 and 100 on both axes.");
  }
  try {
    const context = await adminContext();
    if (!isImageRecord(await readMedia(context.payload, mediaId))) {
      return refuse("That image was not found.");
    }
    await localApi(context.payload).update({
      collection: "media",
      id: mediaId,
      data: { focalX: Math.round(x * 10) / 10, focalY: Math.round(y * 10) / 10 },
      draft: true,
      overrideAccess: true,
      user: context.user,
    });
    return { ok: true, message: "Focal point saved as a draft." };
  } catch (error) {
    return refuse(describe(error));
  }
}

export async function publishImage(mediaInput: number): Promise<ActionResult> {
  const mediaId = parseId(mediaInput);
  if (mediaId === null) return refuse("That image was not found.");
  try {
    const context = await adminContext();
    const latest = await readMedia(context.payload, mediaId);
    if (!latest) return refuse("That image was not found.");
    await localApi(context.payload).update({
      collection: "media",
      id: mediaId,
      data: { ...writable(latest), _status: "published" },
      draft: false,
      overrideAccess: true,
      user: context.user,
    });
    return { ok: true, message: "Image published." };
  } catch (error) {
    return refuse(describe(error));
  }
}

/** Points every spot that uses `oldId` at `newId`, as drafts (used after Replace file). */
export async function swapImage(oldInput: number, newInput: number): Promise<ActionResult> {
  const oldId = parseId(oldInput);
  const newId = parseId(newInput);
  if (oldId === null || newId === null) return refuse("That image was not found.");
  if (oldId === newId) return refuse("The new image is the same as the old one.");
  try {
    const context = await adminContext();
    const replacement = await readMedia(context.payload, newId);
    // Spot ids encode owner and path; anything that does not decode to a registered spot is skipped.
    const spots = (await findUsages(context.payload, oldId))
      .map((usage) => decodeSpotId(usage.spotId))
      .filter((spot) => spot !== null);
    if (spots.length === 0) return { ok: true, message: "Nothing used the old image." };
    // Check every spot before writing any, so a mismatch changes nothing.
    for (const { owner, path } of spots) {
      const problem = imageProblemFor(replacement, owner, path);
      if (problem) return refuse(problem);
    }
    for (const { owner, path } of spots) {
      const latest = writable(await readLatest(context.payload, owner));
      await save(context, owner, setPath(latest, path, newId), true);
    }
    return { ok: true, message: `${places(spots.length)} now use the new image as a draft.` };
  } catch (error) {
    return refuse(describe(error));
  }
}

export async function deleteImage(
  mediaInput: number,
  confirmedInput: boolean,
): Promise<ActionResult> {
  const mediaId = parseId(mediaInput);
  if (mediaId === null) return refuse("That image was not found.");
  const confirmed = isConfirmed(confirmedInput);
  try {
    const context = await adminContext();
    if (!isImageRecord(await readMedia(context.payload, mediaId))) {
      return refuse("That image was not found.");
    }
    const usages = await findUsages(context.payload, mediaId);
    if (usages.length > 0 && !confirmed) {
      return {
        ok: false,
        needsConfirmation: true,
        usages,
        message:
          "This image is in use. Confirm to delete it and leave those spots without an image.",
      };
    }
    await localApi(context.payload).delete({
      collection: "media",
      id: mediaId,
      overrideAccess: true,
      user: context.user,
      // Skip the in-use guard only for a confirmed delete of an image known to be in use. An
      // unused image keeps the guard, so a spot that starts using it meanwhile still blocks this.
      ...(usages.length > 0 ? { context: { [ALLOW_IN_USE_DELETE]: true } } : {}),
    });
    return { ok: true, message: "Image deleted." };
  } catch (error) {
    return refuse(describe(error));
  }
}
