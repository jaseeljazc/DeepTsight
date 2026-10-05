"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import type { ActionResult } from "../../images/types";
import { useAnnounce } from "./announce";

/** Runs a server action, shows its message in words, and refreshes the page data on success. */
export function useRun() {
  const router = useRouter();
  const announce = useAnnounce();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function run(work: () => Promise<ActionResult>): Promise<ActionResult> {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await work();
      if (result.ok) {
        const message = result.message ?? "Done.";
        setNotice(message);
        announce(message);
        router.refresh();
      } else if (!result.needsConfirmation) {
        setError(result.message);
      }
      return result;
    } catch {
      const failure: ActionResult = {
        ok: false,
        message: "Something went wrong. Nothing was changed.",
      };
      setError(failure.message);
      return failure;
    } finally {
      setBusy(false);
    }
  }
  return { run, busy, error, notice, setError };
}
