"use client";

import * as React from "react";
import { deleteImage } from "../../images/actions";
import type { ImageView, UsageView } from "../../images/types";
import { Dialog, ErrorText, useDialogLock } from "./dialog";
import { useRun } from "./use-run";

/*
 * Delete image. An unused image needs one confirmation. For an image in use, the first call
 * returns the server's own list of places (never possibly stale card data), then a tick-box
 * confirmation is required before the second call deletes it.
 */
export function DeleteDialog({
  image,
  open,
  onClose,
}: {
  image: ImageView;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Delete image: ${image.caption || image.filename}`}
    >
      <DeleteBody image={image} onClose={onClose} />
    </Dialog>
  );
}

/** Mounted only while the dialog is open, so each opening asks the server afresh. */
function DeleteBody({ image, onClose }: { image: ImageView; onClose: () => void }) {
  const { run, busy, error } = useRun();
  const [usages, setUsages] = React.useState<UsageView[] | null>(null);
  const [understood, setUnderstood] = React.useState(false);
  const errorId = React.useId();
  const warningId = React.useId();
  const placesId = React.useId();
  const checkRef = React.useRef<HTMLInputElement>(null);

  const inUse = usages !== null;
  useDialogLock(busy);

  // The Delete button disables when the warning appears; move focus to the tick-box it waits on.
  React.useEffect(() => {
    if (inUse) checkRef.current?.focus();
  }, [inUse]);

  async function attempt(confirmed: boolean) {
    const result = await run(() => deleteImage(image.id, confirmed));
    if (!result.ok && result.needsConfirmation && result.usages) setUsages(result.usages);
    if (result.ok) onClose();
  }

  return (
    <>
      {!inUse && (
        <p>
          Deleting removes the image and its file for good; it cannot be undone. If the image is
          used anywhere on the website, you are shown where and asked to confirm before anything is
          deleted.
        </p>
      )}
      {usages !== null && (
        <>
          <p>
            <strong>This image is in use.</strong> It appears here:
          </p>
          <ul id={placesId}>
            {usages.map((u) => (
              <li key={u.spotId}>
                {u.group} → {u.title}: {u.where}
              </li>
            ))}
          </ul>
          <p id={warningId}>
            If you delete it, those spots are left without an image. On the live site the image
            disappears straight away. The pages cannot be published again until you choose a new
            image.
          </p>
          <label className="dts-img__check">
            <input
              ref={checkRef}
              type="checkbox"
              checked={understood}
              aria-describedby={`${placesId} ${warningId}`}
              onChange={(event) => setUnderstood(event.target.checked)}
            />
            <span>I understand these spots will be left without an image</span>
          </label>
        </>
      )}
      <ErrorText id={errorId} message={error} />
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--danger"
          disabled={busy || (inUse && !understood)}
          aria-describedby={error ? errorId : undefined}
          onClick={() => attempt(inUse)}
        >
          Delete image
        </button>
      </div>
    </>
  );
}
