"use client";

import * as React from "react";
import { setSpotImage } from "../../images/actions";
import type { SpotCard } from "../../images/types";
import { Dialog, ErrorText, useDialogLock } from "./dialog";
import { libraryUrl } from "./logic";
import { UploadForm, type UploadResult } from "./picker-upload";
import { useRun } from "./use-run";

interface LibraryItem {
  id: number;
  caption: string | null;
  filename: string | null;
}

/** Change image: choose from the library, or upload a new image, then save it as a draft. */
export function PickerDialog({
  card,
  open,
  onClose,
}: {
  card: SpotCard;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={`Change image: ${card.title}`}>
      <PickerBody card={card} onClose={onClose} />
    </Dialog>
  );
}

/** Mounted only while the dialog is open, so every opening starts with a clean selection. */
function PickerBody({ card, onClose }: { card: SpotCard; onClose: () => void }) {
  const { run, busy, error, setError } = useRun();
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<LibraryItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [reload, setReload] = React.useState(0);
  const [chosen, setChosen] = React.useState<number | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploaded, setUploaded] = React.useState<string | null>(null);
  const errorId = React.useId();
  const working = busy || uploading;
  useDialogLock(working);

  React.useEffect(() => {
    const controller = new AbortController();
    // Wait for a pause in typing before asking the server; a newer search cancels an older one.
    const timer = setTimeout(
      () => {
        fetch(libraryUrl(card.badgeOnly, query), {
          credentials: "same-origin",
          signal: controller.signal,
        })
          .then(async (res) => {
            if (!res.ok) throw new Error("library");
            const body = (await res.json()) as { docs?: LibraryItem[] };
            setItems((body.docs ?? []).filter((doc) => doc.filename));
            setLoaded(true);
          })
          .catch(() => {
            if (!controller.signal.aborted) setError("The image library could not be loaded.");
          });
      },
      query ? 250 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, reload, card.badgeOnly, setError]);

  function onUploadStart(problem: string | null) {
    setError(problem);
    setUploaded(null);
    if (!problem) setUploading(true);
  }

  function onUploadDone(result: UploadResult) {
    setUploading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setChosen(result.id);
    setQuery("");
    setReload((n) => n + 1);
    setUploaded("Uploaded and selected. Choose “Use this image” to put it in this spot.");
  }

  async function use() {
    if (chosen === null) return;
    const id = chosen;
    const result = await run(() => setSpotImage(card.owner, card.path, id));
    if (result.ok) onClose();
  }

  const describedBy = error ? errorId : undefined;

  return (
    <>
      <p>{card.where}</p>
      <label className="dts-img__field">
        <span>Search the library by caption</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <ul className="dts-img__library" aria-label="Image library">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={chosen === item.id}
              onClick={() => setChosen(item.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/file/${encodeURIComponent(item.filename ?? "")}`}
                alt=""
                loading="lazy"
              />
              <span>
                {item.caption || item.filename}
                {chosen === item.id ? " (selected)" : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {loaded && items.length === 0 && <p>No images match.</p>}

      <UploadForm
        badgeOnly={card.badgeOnly}
        uploading={uploading}
        describedBy={describedBy}
        onStart={onUploadStart}
        onDone={onUploadDone}
      />

      <p className="dts-img__notice" role="status">
        {uploaded}
      </p>
      <ErrorText id={errorId} message={error} />
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" disabled={working} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          disabled={chosen === null || working}
          aria-describedby={describedBy}
          onClick={use}
        >
          Use this image (save as draft)
        </button>
      </div>
    </>
  );
}
