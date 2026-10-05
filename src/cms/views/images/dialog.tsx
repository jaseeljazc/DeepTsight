"use client";

import * as React from "react";

/*
 * A native modal <dialog>: the browser traps focus, Escape closes it, and focus returns to the
 * button that opened it. Children render only while open, so each opening starts clean.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dts-img__dialog" aria-labelledby={titleId} onClose={onClose}>
      <h2 id={titleId}>{title}</h2>
      {open ? children : null}
    </dialog>
  );
}

/** An error in words, announced at once, with an id controls can point at (aria-describedby). */
export function ErrorText({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="dts-img__error" role="alert">
      {message}
    </p>
  );
}
