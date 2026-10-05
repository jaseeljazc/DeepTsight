"use client";

import * as React from "react";
import { setSpotImage } from "../../images/actions";
import type { SpotCard } from "../../images/types";
import { Dialog, ErrorText } from "./dialog";
import { createdId, libraryUrl, restError } from "./logic";
import { useRun } from "./use-run";

interface LibraryItem {
  id: number;
  caption: string | null;
  filename: string | null;
}

export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/avif";

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

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUploaded(null);
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Choose an image file to upload.");
      return;
    }
    const payload = {
      kind: "image",
      assetClass: card.badgeOnly ? "issuer-badge" : "photograph",
      alt: String(form.get("alt") ?? ""),
      caption: String(form.get("caption") ?? ""),
      source: String(form.get("source") ?? ""),
      licence: String(form.get("licence") ?? ""),
      usageRights: String(form.get("usageRights") ?? ""),
      _status: "published",
    };
    const body = new FormData();
    body.append("file", file);
    body.append("_payload", JSON.stringify(payload));
    setUploading(true);
    try {
      const res = await fetch("/api/media", { method: "POST", body, credentials: "same-origin" });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(restError(json));
        return;
      }
      const id = createdId(json);
      if (id === null) {
        setError("The upload finished but the image could not be found.");
        return;
      }
      setChosen(id);
      setQuery("");
      setReload((n) => n + 1);
      setUploaded("Uploaded and selected. Choose “Use this image” to put it in this spot.");
    } catch {
      setError("The upload did not reach the server. Nothing was saved.");
    } finally {
      setUploading(false);
    }
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

      <details className="dts-img__upload">
        <summary>Upload a new image</summary>
        <form onSubmit={upload}>
          <label className="dts-img__field">
            <span>Image file (JPEG, PNG, WebP or AVIF, up to 10 MB)</span>
            <input
              name="file"
              type="file"
              accept={ACCEPT_IMAGES}
              required
              aria-describedby={describedBy}
            />
          </label>
          <label className="dts-img__field">
            <span>Alternative text (what the image shows)</span>
            <input name="alt" required />
          </label>
          <label className="dts-img__field">
            <span>Caption</span>
            <input name="caption" required />
          </label>
          <label className="dts-img__field">
            <span>Source (where it came from)</span>
            <input name="source" required />
          </label>
          <label className="dts-img__field">
            <span>Licence</span>
            <input name="licence" required />
          </label>
          <label className="dts-img__field">
            <span>Usage rights</span>
            <input name="usageRights" required />
          </label>
          <p>
            Never upload photographs that show a client site, plant, equipment tags or screens. A
            new image is not approved until an approver approves it in Media.
          </p>
          <button
            className="dts-img__btn"
            type="submit"
            disabled={uploading}
            aria-describedby={describedBy}
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </details>

      <p className="dts-img__notice" role="status">
        {uploaded}
      </p>
      <ErrorText id={errorId} message={error} />
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          disabled={chosen === null || busy || uploading}
          aria-describedby={describedBy}
          onClick={use}
        >
          Use this image (save as draft)
        </button>
      </div>
    </>
  );
}
