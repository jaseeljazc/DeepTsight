import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/primitives/link";
import { MarkedText } from "@/components/primitives/placeholder";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import { Part } from "./part";
import type { Credential, CredentialGroup as CredentialGroupType } from "@/content/types";

export type CredentialGroupProps = {
  group: CredentialGroupType;
  number: string;
};

/** Expired items never render (FR-21). Non-numeric expiry values are kept for review. */
function isCurrent(item: Credential): boolean {
  if (!item.expiry) return true;
  const expiryYear = parseInt(item.expiry, 10);
  return isNaN(expiryYear) || expiryYear >= new Date().getFullYear();
}

function Status({ item }: { item: Credential }) {
  if (!item.verified) {
    return <MarkedText text="[PLACEHOLDER] Awaiting verification" />;
  }
  return (
    <span className="flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="marker-square bg-status size-marker" />
        Current
      </span>
      {item.url && (
        <Link href={item.url} isExternal className="text-caption">
          Verify<span className="sr-only"> {item.title} with the issuer</span>
        </Link>
      )}
    </span>
  );
}

/** Issuer's badge artwork. Decorative: the credential title beside it carries the same name. */
function CredentialBadge({ item }: { item: Credential }) {
  if (!item.badge) return null;
  return (
    <Image
      src={item.badge}
      alt=""
      width={112}
      height={112}
      className="size-badge shrink-0 object-contain"
    />
  );
}

export function CredentialGroup({ group, number }: CredentialGroupProps) {
  const items = group.items.filter(isCurrent);
  if (items.length === 0) return null;

  // Platforms are experience, not certificates: no identifier or status column to fill.
  if (group.category === "platforms") {
    return (
      <Part id={group.category} number={number} title={group.title}>
        <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="border-ink-900 border-t pt-4">
              <h3 className="text-ink-900 text-small font-medium">
                <MarkedText text={item.title} />
              </h3>
              <p className="text-ink-700 text-small mt-2">
                <MarkedText text={item.issuer} />
              </p>
              {!item.verified && (
                <p className="text-caption mt-3">
                  <Status item={item} />
                </p>
              )}
            </li>
          ))}
        </ul>
      </Part>
    );
  }

  return (
    <Part id={group.category} number={number} title={group.title}>
      <Table caption={group.title}>
        <TableHeader>
          <TableRow>
            <TableHead>Credential</TableHead>
            <TableHead>Issuer</TableHead>
            <TableHead>Identifier</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableHead
                scope="row"
                className="text-ink-900 text-small min-w-cell-lg py-5 font-medium"
              >
                <span className="flex items-center gap-4">
                  <CredentialBadge item={item} />
                  <MarkedText text={item.title} />
                </span>
              </TableHead>
              <TableCell className="min-w-cell-md">
                <MarkedText text={item.issuer} />
              </TableCell>
              <TableCell className="text-caption font-mono">
                <MarkedText
                  text={
                    [item.identifier, item.expiry && `expires ${item.expiry}`]
                      .filter(Boolean)
                      .join(", ") || "Not applicable"
                  }
                />
              </TableCell>
              <TableCell className="min-w-cell-sm">
                <Status item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Part>
  );
}
