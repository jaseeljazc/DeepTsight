"use client";

import * as React from "react";
import { swapImage } from "../../images/actions";
import type { ImageView, SpotCard } from "../../images/types";
import { useAnnounce } from "./announce";
import { Dialog, ErrorText, useAlive, useDialogLock } from "./dialog";
import { ACCEPT_IMAGES, postMedia } from "./picker-upload";
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

const orBlank = (value: string): string => value.trim() || "(not recorded)";

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
  const announce = useAnnounce();
  const alive = useAlive();
  const [uploading, setUploading] = React.useState(false);
  const controller = React.useRef<AbortController | null>(null);
  const errorId = React.useId();
  const rightsId = React.useId();
  const working = busy || uploading;
  useDialogLock(working);
  // Closing the dialog cancels an upload still in flight.
  React.useEffect(() => () => controller.current?.abort(), []);

  // The swap changes the spots whose latest draft uses this image: this one and sharedWith.
  const places = [`${card.group} → ${card.title}`, ...card.sharedWith];
  const describedBy = error ? errorId : undefined;

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
      setError("Confirm the source, licence and usage rights still apply to the new image.");
      return;
    }
    controller.current = new AbortController();
    setUploading(true);
    const upload = await postMedia(
      file,
      {
        kind: "image",
        ...current.meta,
        focalX: current.focalX,
        focalY: current.focalY,
        _status: "published",
      },
      controller.current.signal,
    );
    setUploading(false);
    if (!alive.current) {
      // The dialog was forced closed mid-upload: change nothing, but say what happened.
      if (upload.ok) {
        announce(
          "The new file was uploaded, but the dialog was closed, so no spot was changed. It is listed under Unused images.",
        );
      }
      return;
    }
    if (!upload.ok) {
      setError(upload.message);
      return;
    }
    const newId = upload.id;
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
      <dl className="dts-img__rights" id={rightsId}>
        <dt>Source</dt>
        <dd>{orBlank(current.meta.source)}</dd>
        <dt>Licence</dt>
        <dd>{orBlank(current.meta.licence)}</dd>
        <dt>Usage rights</dt>
        <dd>{orBlank(current.meta.usageRights)}</dd>
      </dl>
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
          <input
            name="rights"
            type="checkbox"
            aria-describedby={[rightsId, describedBy].filter(Boolean).join(" ")}
          />
          <span>The source, licence and usage rights above still apply to the new image.</span>
        </label>
        <ErrorText id={errorId} message={error} />
        <div className="dts-img__dialog-actions">
          <button type="button" className="dts-img__btn" disabled={working} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="dts-img__btn dts-img__btn--primary" disabled={working}>
            {uploading ? "Uploading…" : "Replace file (save as draft)"}
          </button>
        </div>
      </form>
    </>
  );
}
