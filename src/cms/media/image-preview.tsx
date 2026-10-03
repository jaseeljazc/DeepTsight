"use client";

import * as React from "react";
import { X } from "lucide-react";

/*
 * Click an image in the admin to see it large. Payload draws these thumbnails itself (an upload
 * field's picture, the file on a media item's own page), so this provider listens for clicks on them
 * instead of replacing the field. The thumbnails are made keyboard-reachable here too: Tab to one,
 * then Enter or Space. A native <dialog> gives Esc to close and keeps focus inside while it is open.
 * Styles: src/app/(payload)/admin-theme.css (.dts-lightbox).
 */

const THUMBNAILS = ".upload-relationship-details__thumbnail img, .file-details__thumbnail img";

type Shown = { src: string; alt: string };

function thumbnailFrom(target: EventTarget | null): HTMLImageElement | null {
  if (!(target instanceof Element)) return null;
  const image = target.closest(THUMBNAILS);
  return image instanceof HTMLImageElement ? image : null;
}

function markPreviewable(root: ParentNode): void {
  for (const image of root.querySelectorAll<HTMLImageElement>(THUMBNAILS)) {
    if (image.dataset["dtsPreview"]) continue;
    image.dataset["dtsPreview"] = "true";
    image.setAttribute("role", "button");
    image.setAttribute("tabindex", "0");
    image.setAttribute("aria-label", `Preview ${image.alt || "image"}`);
    image.title = "Click to see this image large";
  }
}

export function ImagePreviewProvider({ children }: { children?: React.ReactNode }) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const [shown, setShown] = React.useState<Shown | null>(null);

  React.useEffect(() => {
    markPreviewable(document);
    const observer = new MutationObserver(() => markPreviewable(document));
    observer.observe(document.body, { childList: true, subtree: true });

    const open = (image: HTMLImageElement) => setShown({ src: image.src, alt: image.alt });
    const onClick = (event: MouseEvent) => {
      const image = thumbnailFrom(event.target);
      if (image) open(image);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const image = thumbnailFrom(event.target);
      if (!image) return;
      event.preventDefault();
      open(image);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  React.useEffect(() => {
    const element = dialog.current;
    if (shown && element && !element.open) element.showModal();
  }, [shown]);

  return (
    <>
      {children}
      <dialog
        ref={dialog}
        className="dts-lightbox"
        aria-label={shown?.alt ? `Preview of ${shown.alt}` : "Image preview"}
        onClose={() => setShown(null)}
        onClick={(event) => {
          // A click on the dark area around the picture is a click on the dialog itself.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        {shown && (
          <>
            <div className="dts-lightbox__bar">
              <p>{shown.alt}</p>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Close preview"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            {/* An image served by this site's own media route, so next/image adds nothing here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shown.src} alt={shown.alt} />
          </>
        )}
      </dialog>
    </>
  );
}
