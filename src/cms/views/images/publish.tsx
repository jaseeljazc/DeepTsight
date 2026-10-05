"use client";

import * as React from "react";
import { publishImage, publishSpot } from "../../images/actions";
import type { SpotCard } from "../../images/types";
import { Dialog, ErrorText } from "./dialog";
import { useRun } from "./use-run";

const SHOWN = 8;

/** Publish: says what else goes live with this section before it does. */
export function PublishDialog({
  card,
  open,
  onClose,
}: {
  card: SpotCard;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={`Publish: ${card.title}`}>
      <PublishBody card={card} onClose={onClose} />
    </Dialog>
  );
}

/** Mounted only while the dialog is open, so an old error never shows on a new opening. */
function PublishBody({ card, onClose }: { card: SpotCard; onClose: () => void }) {
  const { run, busy, error } = useRun();
  const errorId = React.useId();
  const others = card.otherChanges;

  async function publish() {
    const imageId = card.image?.id;
    let ok = true;
    if (card.pending) ok = (await run(() => publishSpot(card.owner))).ok;
    if (ok && card.focalPending && imageId !== undefined) {
      ok = (await run(() => publishImage(imageId))).ok;
    }
    if (ok) onClose();
  }

  return (
    <>
      {card.pending && (
        <p>
          Publishing makes the whole <strong>{card.group}</strong> section live, not just this
          image.
        </p>
      )}
      {card.pending && others.length > 0 && (
        <>
          <p>These other changes in the section are unpublished and will go live too:</p>
          <ul>
            {others.slice(0, SHOWN).map((path) => (
              <li key={path}>{path}</li>
            ))}
          </ul>
          {others.length > SHOWN && <p>…and {others.length - SHOWN} more.</p>}
        </>
      )}
      {card.focalPending && <p>The focal point change for this image will be published as well.</p>}
      <ErrorText id={errorId} message={error} />
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          disabled={busy}
          aria-describedby={error ? errorId : undefined}
          onClick={publish}
        >
          Publish now
        </button>
      </div>
    </>
  );
}
