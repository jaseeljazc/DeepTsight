"use client";

import * as React from "react";

/*
 * One polite live region for the whole Images page. A dialog closes as soon as its action
 * succeeds, so its own messages would vanish with it; the outcome is announced (and shown) here.
 */
const AnnounceContext = React.createContext<(message: string) => void>(() => undefined);

export function useAnnounce(): (message: string) => void {
  return React.useContext(AnnounceContext);
}

export function Announcer({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = React.useState("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = React.useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    // Clear first so the same message twice is announced twice, and wait for the dialog to close
    // so the region is no longer behind the modal when it changes.
    setMessage("");
    timer.current = setTimeout(() => setMessage(next), 100);
  }, []);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <AnnounceContext.Provider value={announce}>
      <p className="dts-img__notice" role="status">
        {message}
      </p>
      {children}
    </AnnounceContext.Provider>
  );
}
