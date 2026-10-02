import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { PayloadRequest, ServerProps } from "payload";
import { isAdmin } from "../access";
import { labelText } from "../nav/label";
import { groupEntries } from "../nav/nav-groups";
import { CommandSearch, type JumpItem } from "./command-search";

/*
 * Top bar pieces next to Payload's breadcrumbs: the "jump to" box and the inbox bell. Both are
 * rendered only for an account that has passed the second factor.
 */

type ActionProps = ServerProps & { req?: PayloadRequest };

const ADMIN = "/admin";

export function SearchAction(props: ActionProps) {
  const { payload, i18n, req } = props;
  if (!req || !isAdmin(req)) return null;

  const entries = [
    ...payload.config.collections.map((collection) => ({
      slug: collection.slug,
      label: labelText(collection.labels?.plural, i18n.language, collection.slug),
      href: `${ADMIN}/collections/${collection.slug}`,
    })),
    ...payload.config.globals.map((global) => ({
      slug: global.slug,
      label: labelText(global.label, i18n.language, global.slug),
      href: `${ADMIN}/globals/${global.slug}`,
    })),
  ];
  const items: JumpItem[] = [
    { label: "Dashboard", group: "Overview", href: ADMIN },
    ...groupEntries(entries).flatMap((group) =>
      group.entries.map((entry) => ({ label: entry.label, group: group.label, href: entry.href })),
    ),
  ];
  return <CommandSearch items={items} />;
}

export async function InboxBell(props: ActionProps) {
  const { payload, req } = props;
  if (!req || !isAdmin(req)) return null;

  const unread = await payload.count({
    collection: "enquiries",
    where: { read: { equals: false } },
    overrideAccess: true,
  });
  const count = unread.totalDocs;
  const label = count > 0 ? `Enquiries, ${count} unread` : "Enquiries, none unread";

  return (
    <Link
      className="dts-bell"
      href={`${ADMIN}/collections/enquiries`}
      prefetch={false}
      aria-label={label}
    >
      <Bell aria-hidden="true" />
      {count > 0 && <span className="dts-bell__badge" aria-hidden="true" />}
    </Link>
  );
}
