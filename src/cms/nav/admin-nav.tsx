import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Globe, LogOut } from "lucide-react";
import { EntityType, groupNavItems, type EntityToGroup } from "@payloadcms/ui/shared";
import type { PayloadRequest, ServerProps } from "payload";
import { isAdmin } from "../access";
import { Icon } from "../graphics/logo";
import { labelText } from "./label";
import { groupEntries, type NavEntry } from "./nav-groups";
import { NavClose, NavLinks, NavShell } from "./nav-client";

/*
 * The admin sidebar (replaces Payload's own). Lists what the signed-in account may open, grouped
 * for an editor rather than by database. Before the second factor is verified it shows only the
 * brand and sign-out, so no collection names are offered to a half-signed-in account.
 */

type AdminNavProps = ServerProps & {
  req?: PayloadRequest;
  visibleEntities?: { collections: string[]; globals: string[] };
};

const ADMIN_ROUTE = "/admin";

export async function AdminNav(props: AdminNavProps) {
  const { payload, permissions, i18n, req, visibleEntities } = props;
  const verified = req ? isAdmin(req) : false;

  let entries: NavEntry[] = [];
  if (verified && payload?.config && visibleEntities && permissions) {
    const grouped = groupNavItems(
      [
        ...payload.config.collections
          .filter(({ slug }) => visibleEntities.collections.includes(slug))
          .map((entity): EntityToGroup => ({ type: EntityType.collection, entity })),
        ...payload.config.globals
          .filter(({ slug }) => visibleEntities.globals.includes(slug))
          .map((entity): EntityToGroup => ({ type: EntityType.global, entity })),
      ],
      permissions,
      i18n,
    );
    entries = grouped.flatMap((group) =>
      group.entities.map((entity) => ({
        slug: entity.slug,
        label: labelText(entity.label, i18n.language, entity.slug),
        href: `${ADMIN_ROUTE}/${entity.type === EntityType.global ? "globals" : "collections"}/${entity.slug}`,
      })),
    );
  }

  return (
    <NavShell>
      <div className="dts-nav__top">
        <Link className="dts-brand" href={ADMIN_ROUTE} prefetch={false}>
          <Icon />
          <span className="dts-brand__name">DeepTsight</span>
          <span className="dts-brand__sub">CMS</span>
        </Link>
        <NavClose />
      </div>

      {verified && <NavLinks groups={groupEntries(entries)} adminRoute={ADMIN_ROUTE} />}

      <div className="dts-nav__foot">
        {verified && (
          // The public site is a different document from the admin, so this is a plain link.
          <a className="dts-nav__site" href="/" target="_blank" rel="noopener noreferrer">
            <span className="dts-nav__site-icon" aria-hidden="true">
              <Globe />
            </span>
            <span className="dts-nav__site-text">
              <strong>View live site</strong>
              <span>Opens in a new tab</span>
            </span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        )}
        <Link className="dts-nav__signout" href={`${ADMIN_ROUTE}/logout`} prefetch={false}>
          <LogOut aria-hidden="true" />
          Sign out
        </Link>
      </div>
    </NavShell>
  );
}
