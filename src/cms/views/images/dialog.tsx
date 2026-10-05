"use client";

import * as React from "react";

/*
 * A native modal <dialog>: the browser traps focus, Escape closes it, and focus returns to the
 * button that opened it. Children render only while open, so each opening starts clean.
 *
 * While the body is working (an upload or a server action), it locks the dialog with
 * useDialogLock: Escape is refused, so the work cannot carry on unseen behind a closed dialog.
 * Browsers may still force-close on a repeated Escape, so bodies also check useAlive() before
 * starting a follow-on step.
 */
const LockContext = React.createContext<(locked: boolean) => void>(() => undefined);

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
  const locked = React.useRef(false);
  const setLocked = React.useCallback((value: boolean) => {
    locked.current = value;
  }, []);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dts-img__dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        if (locked.current) event.preventDefault();
      }}
      onClose={onClose}
    >
      <h2 id={titleId}>{title}</h2>
      <LockContext.Provider value={setLocked}>{open ? children : null}</LockContext.Provider>
    </dialog>
  );
}

/** Refuses Escape on the surrounding dialog while `locked` is true. */
export function useDialogLock(locked: boolean): void {
  const setLocked = React.useContext(LockContext);
  React.useEffect(() => {
    setLocked(locked);
    return () => setLocked(false);
  }, [locked, setLocked]);
}

/** A ref that is true while the component is mounted (false once its dialog has closed). */
export function useAlive(): React.RefObject<boolean> {
  const alive = React.useRef(false);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
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
