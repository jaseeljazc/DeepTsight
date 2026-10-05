"use client";

import * as React from "react";
import { swapImage } from "../../images/actions";
import type { ImageView, SpotCard } from "../../images/types";
import { Dialog, ErrorText } from "./dialog";
import { createdId, restError } from "./logic";
import { ACCEPT_IMAGES } from "./picker";
import { useRun } from "./use-run";

/** Replace file: upload a new file with the same rights record and point every spot at it. */
export function ReplaceDialog({
  card,
  open,
  onClose,
}: {
  card: SpotCard;
  open: boolean;
  onClose: () => void;
}) {
  const image = card.image;
  if (!image) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Replace file: ${card.title}`}>
      <ReplaceBody card={card} current={image} onClose={onClose} />
    </Dialog>
  );
}

/** Mounted only while the dialog is open, so every opening starts clean. */
function ReplaceBody({
  card,
  current,
  onClose,
}: {
  card: SpotCard;
  current: ImageView;
  onClose: () => void;
}) {
  const { run, busy, error, setError } = useRun();
  const [uploading, setUploading] = React.useState(false);
  const errorId = React.useId();
  const places = [`${card.group} → ${card.title}`, ...card.sharedWith];
  const describedBy = error ? errorId : undefined;

  async function upload(file: File): Promise<number | null> {
    const body = new FormData();
    body.append("file", file);
    body.append(
      "_payload",
      JSON.stringify({
        kind: "image",
        ...current.meta,
        focalX: current.focalX,
        focalY: current.focalY,
        _status: "published",
      }),
    );
    setUploading(true);
    try {
      const res = await fetch("/api/media", { method: "POST", body, credentials: "same-origin" });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(restError(json));
        return null;
      }
      const id = createdId(json);
      if (id === null) setError("The upload finished but the new image could not be found.");
      return id;
    } catch {
      setError("The upload did not reach the server. Nothing was saved.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Choose the new image file.");
      return;
    }
    if (form.get("rights") !== "on") {
      setError("Confirm the usage rights still apply to the new photograph.");
      return;
    }
    const newId = await upload(file);
    if (newId === null) return;
    const result = await run(() => swapImage(current.id, newId));
    if (result.ok) onClose();
  }

  return (
    <>
      <p>All of these places will change to the new file (as drafts):</p>
      <ul>
        {places.map((place) => (
          <li key={place}>{place}</li>
        ))}
      </ul>
      <p>
        The caption, alternative text and rights record are copied. The new image is not approved
        until an approver approves it.
      </p>
      <form onSubmit={submit}>
        <label className="dts-img__field">
          <span>New image file</span>
          <input
            name="file"
            type="file"
            accept={ACCEPT_IMAGES}
            required
            aria-describedby={describedBy}
          />
        </label>
        <label className="dts-img__check">
          <input name="rights" type="checkbox" aria-describedby={describedBy} />
          <span>The source, licence and usage rights above still apply to this photograph.</span>
        </label>
        <ErrorText id={errorId} message={error} />
        <div className="dts-img__dialog-actions">
          <button type="button" className="dts-img__btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="dts-img__btn dts-img__btn--primary"
            disabled={busy || uploading}
          >
            {uploading ? "Uploading…" : "Replace file (save as draft)"}
          </button>
        </div>
      </form>
    </>
  );
}
