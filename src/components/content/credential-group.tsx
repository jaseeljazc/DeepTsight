import * as React from "react";
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
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="marker-square bg-status size-marker" />
      Current
    </span>
  );
}

export function CredentialGroup({ group, number }: CredentialGroupProps) {
  const items = group.items.filter(isCurrent);
  if (items.length === 0) return null;

  return (
    <Part id={group.category} number={number} title={group.title}>
      {group.category === "publications" ? (
        <ol className="border-ink-900 border-t">
          {items.map((item) => (
            <li key={item.id} className="border-rule border-b py-6">
              <p className="text-steel-600 text-caption font-mono">
                <MarkedText text={item.year ?? "Year TBD — CLIENT"} />
              </p>
              <p className="font-display text-ink-900 text-h3 mt-2 font-medium">
                <MarkedText text={item.title} />
              </p>
              <p className="text-ink-700 text-small mt-2">
                <MarkedText text={item.issuer} />
              </p>
              <p className="text-small mt-3 flex flex-wrap items-center gap-x-6">
                <Status item={item} />
                {item.url && item.verified && (
                  <Link href={item.url} isExternal className="text-caption font-mono">
                    DOI or publisher page
                  </Link>
                )}
              </p>
            </li>
          ))}
        </ol>
      ) : (
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
                  <MarkedText text={item.title} />
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
      )}
    </Part>
  );
}
