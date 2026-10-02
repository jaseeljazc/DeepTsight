/* Wording and time formatting for the dashboard. */

const relative = new Intl.RelativeTimeFormat("en-AU", { numeric: "auto" });

/** "2 hours ago", "yesterday". The exact time is kept in the element's title. */
export function ago(value: string | undefined): string {
  if (!value) return "";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function exact(value: string | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleString("en-AU", {
    timeZone: "Australia/Perth",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function today(): string {
  return new Date().toLocaleDateString("en-AU", {
    timeZone: "Australia/Perth",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function sentence(slug: string | null | undefined): string {
  const text = (slug ?? "").replace(/-/g, " ");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

export const ACTION_WORDS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  publish: "Published",
  unpublish: "Unpublished",
  login: "Signed in",
  "login-blocked": "Blocked a sign-in",
  "mfa-enrolled": "Set up the authenticator",
  "mfa-verified": "Verified an authenticator code",
  "mfa-failed": "Entered a wrong authenticator code",
  "recovery-code-used": "Used a recovery code",
  "flag-change": "Changed an approval setting",
};

/** Only changes to content name what changed; sign-in events do not (their target is just the accounts list). */
export const NAMES_TARGET = new Set([
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "flag-change",
]);

export type Tone = "blue" | "green" | "purple" | "orange" | "grey";

/** Which icon colour an audit entry gets, by what it touched. */
export function toneFor(action: string, collection: string | null | undefined): Tone {
  if (action === "delete" || action === "login-blocked" || action === "mfa-failed") return "orange";
  if (NAMES_TARGET.has(action) === false) return "green";
  if (collection === "media") return "purple";
  if (collection === "enquiries") return "orange";
  if (collection === "users" || action === "flag-change") return "grey";
  return "blue";
}
