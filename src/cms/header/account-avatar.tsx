import * as React from "react";
import type { ServerProps } from "payload";

/*
 * The account control in the top bar: initials, name and role. Payload wraps it in a link to the
 * account page. There is no photo upload on accounts, so initials stand in.
 */

type Person = { name?: string | null; email?: string; roles?: unknown };

function initials(person: Person): string {
  const source = (person.name ?? "").trim() || (person.email ?? "").split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}` : source.slice(0, 2);
  return letters.toUpperCase();
}

function roleLabel(roles: unknown): string {
  const list = Array.isArray(roles) ? roles.map(String) : [];
  if (list.includes("approver")) return "Approver";
  if (list.includes("editor")) return "Editor";
  return "Account";
}

export function AccountAvatar({ user }: ServerProps) {
  const person = (user ?? {}) as Person;
  const name = (person.name ?? "").trim() || person.email || "Account";
  return (
    <span className="dts-account">
      <span className="dts-account__initials" aria-hidden="true">
        {initials(person)}
      </span>
      <span className="dts-account__text">
        <span className="dts-account__name">{name}</span>
        <span className="dts-account__role">{roleLabel(person.roles)}</span>
      </span>
    </span>
  );
}
