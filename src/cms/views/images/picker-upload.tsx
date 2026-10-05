"use client";

import * as React from "react";
import { createdId, restError } from "./logic";

export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/avif";

export type UploadResult = { ok: true; id: number } | { ok: false; message: string };

/** Uploads one file through Payload REST (POST /api/media, multipart with a _payload field). */
export async function postMedia(
  file: File,
  payload: Record<string, unknown>,
  signal: AbortSignal,
): Promise<UploadResult> {
  const body = new FormData();
  body.append("file", file);
  body.append("_payload", JSON.stringify(payload));
  try {
    const res = await fetch("/api/media", {
      method: "POST",
      body,
      credentials: "same-origin",
      signal,
    });
    const json: unknown = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: restError(json) };
    const id = createdId(json);
    if (id === null) {
      return { ok: false, message: "The upload finished but the image could not be found." };
    }
    return { ok: true, id };
  } catch {
    return { ok: false, message: "The upload did not reach the server. Nothing was saved." };
  }
}

/** The picker's "Upload a new image" form, with the rights record a new image needs. */
export function UploadForm({
  badgeOnly,
  uploading,
  describedBy,
  onStart,
  onDone,
}: {
  badgeOnly: boolean;
  uploading: boolean;
  /** The id of the dialog's error, while there is one. */
  describedBy: string | undefined;
  /** Called before the upload starts; the message (if any) is a problem with the form. */
  onStart: (problem: string | null) => void;
  onDone: (result: UploadResult) => void;
}) {
  const controller = React.useRef<AbortController | null>(null);

  // Closing the dialog cancels an upload still in flight.
  React.useEffect(() => () => controller.current?.abort(), []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      onStart("Choose an image file to upload.");
      return;
    }
    onStart(null);
    controller.current = new AbortController();
    const signal = controller.current.signal;
    const result = await postMedia(
      file,
      {
        kind: "image",
        assetClass: badgeOnly ? "issuer-badge" : "photograph",
        alt: String(form.get("alt") ?? ""),
        caption: String(form.get("caption") ?? ""),
        source: String(form.get("source") ?? ""),
        licence: String(form.get("licence") ?? ""),
        usageRights: String(form.get("usageRights") ?? ""),
        _status: "published",
      },
      signal,
    );
    if (!signal.aborted) onDone(result);
  }

  return (
    <details className="dts-img__upload">
      <summary>Upload a new image</summary>
      <form onSubmit={submit}>
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
          Never upload photographs that show a client site, plant, equipment tags or screens. A new
          image is not approved until an approver approves it in Media.
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
  );
}
