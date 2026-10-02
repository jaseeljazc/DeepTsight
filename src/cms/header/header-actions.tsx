import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { PayloadRequest, ServerProps } from "payload";
import { isAdmin } from "../access";
import { labelText } from "../nav/label";
import { groupEntries } from "../nav/nav-groups";
import { BackLink, type BackTargets } from "./back-link";
import { CommandSearch, type JumpItem } from "./command-search";
import { collectFields } from "./search-index";

/*
 * Top bar pieces around Payload's breadcrumbs: the back button, the search box and the inbox
 * bell. All are rendered only for an account that has passed the second factor.
 */

type ActionProps = ServerProps & { req?: PayloadRequest };

const ADMIN = "/admin";

export function SearchAction(props: ActionProps) {
  const { payload, i18n, req } = props;
  if (!req || !isAdmin(req)) return null;

  const language = i18n.language;
  const entries = [
    ...payload.config.collections.map((collection) => ({
      slug: collection.slug,
      label: labelText(collection.labels?.plural, language, collection.slug),
      href: `${ADMIN}/collections/${collection.slug}`,
      fields: collection.fields,
    })),
    ...payload.config.globals.map((global) => ({
      slug: global.slug,
      label: labelText(global.label, language, global.slug),
      href: `${ADMIN}/globals/${global.slug}`,
      fields: global.fields,
    })),
  ];

  const sections: JumpItem[] = [
    { label: "Dashboard", group: "Overview", href: ADMIN },
    ...groupEntries(entries).flatMap((group) =>
      group.entries.map((entry) => ({ label: entry.label, group: group.label, href: entry.href })),
    ),
  ];

  // Fields come after every section, so a section name always outranks a field with the same name.
  const fields: JumpItem[] = entries.flatMap((entry) =>
    collectFields(entry.fields, language).map((hit) => ({
      label: hit.label,
      group: [entry.label, ...hit.trail].join(" › "),
      href: entry.href,
      hint: hit.hint,
      fieldId: hit.fieldId,
      tab: hit.tab,
    })),
  );

  return <CommandSearch items={[...sections, ...fields]} />;
}

export function BackAction(props: ActionProps) {
  const { payload, i18n, req } = props;
  if (!req || !isAdmin(req)) return null;

  const labels: BackTargets = Object.fromEntries(
    payload.config.collections.map((collection) => [
      collection.slug,
      labelText(collection.labels?.plural, i18n.language, collection.slug),
    ]),
  );
  return <BackLink adminRoute={ADMIN} labels={labels} />;
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
