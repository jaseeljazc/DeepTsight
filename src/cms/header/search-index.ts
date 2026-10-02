import type { Field } from "payload";
import { labelText } from "../nav/label";

/*
 * What the header search can find besides sections: every editable field and tab of every
 * collection and global, by its label and plain-English description. Built on the server from the
 * Payload config, so it is never stale and carries no content, only the editor's own labels.
 */

export type FieldHit = {
  label: string;
  /** Where it lives: the tabs and groups above it. */
  trail: string[];
  /** Payload's DOM id for the field, so the page can scroll to it. Absent for a tab. */
  fieldId?: string;
  /** Tab to open before the field exists on the page. */
  tab?: string;
  hint?: string;
};

type Context = { prefix: string; tab?: string; trail: string[]; anchor?: string };

const HINT_LENGTH = 140;

function humanise(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

function adminOf(field: Field): { hidden?: unknown; description?: unknown } {
  const admin = (field as { admin?: { hidden?: unknown; description?: unknown } }).admin;
  return admin ?? {};
}

function fieldId(path: string): string {
  return `field-${path.replace(/\./g, "__")}`;
}

export function collectFields(
  fields: Field[],
  language: string,
  context: Context = {
    prefix: "",
    trail: [],
  },
): FieldHit[] {
  const hits: FieldHit[] = [];

  for (const field of fields) {
    if (field.type === "tabs") {
      for (const tab of field.tabs) {
        const tabName = "name" in tab && typeof tab.name === "string" ? tab.name : undefined;
        const tabLabel = labelText(tab.label, language, tabName ? humanise(tabName) : "");
        const next: Context = {
          prefix: tabName ? `${context.prefix}${tabName}.` : context.prefix,
          tab: tabLabel || context.tab,
          trail: tabLabel ? [...context.trail, tabLabel] : context.trail,
          anchor: context.anchor,
        };
        if (tabLabel) {
          const description = typeof tab.description === "string" ? tab.description : undefined;
          hits.push({
            label: tabLabel,
            trail: context.trail,
            tab: tabLabel,
            hint: description?.slice(0, HINT_LENGTH),
          });
        }
        hits.push(...collectFields(tab.fields, language, next));
      }
      continue;
    }

    if (field.type === "row" || field.type === "collapsible") {
      hits.push(...collectFields(field.fields, language, context));
      continue;
    }

    if (field.type === "ui" || !("name" in field) || typeof field.name !== "string") continue;
    const name = field.name;
    const admin = adminOf(field);
    if (admin.hidden === true || name === "id" || name.startsWith("_")) continue;

    const label = labelText(field.label, language, humanise(name));
    const path = `${context.prefix}${name}`;
    const description = typeof admin.description === "string" ? admin.description : undefined;
    // Rows of an array have no stable path, so what is inside one points at the array itself.
    const anchor = context.anchor ?? fieldId(path);

    hits.push({
      label,
      trail: context.trail,
      fieldId: anchor,
      tab: context.tab,
      hint: description?.slice(0, HINT_LENGTH),
    });

    if (field.type === "group") {
      hits.push(
        ...collectFields(field.fields, language, {
          prefix: `${path}.`,
          tab: context.tab,
          trail: [...context.trail, label],
          anchor: context.anchor,
        }),
      );
    } else if (field.type === "array") {
      hits.push(
        ...collectFields(field.fields, language, {
          prefix: `${path}.`,
          tab: context.tab,
          trail: [...context.trail, label],
          anchor,
        }),
      );
    }
  }

  return hits;
}
