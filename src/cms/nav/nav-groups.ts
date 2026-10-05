/*
 * How the admin sidebar groups the CMS's collections and globals. Anything not listed here still
 * appears, under "More", so a new collection is never hidden from the menu.
 */

export type NavEntry = { slug: string; label: string; href: string };
export type NavGroup = { label: string; entries: NavEntry[] };

const GROUPS: { label: string; slugs: string[] }[] = [
  {
    label: "Content",
    slugs: [
      "services",
      "proof-items",
      "credentials",
      "credential-groups",
      "articles",
      "article-categories",
      "images",
      "media",
    ],
  },
  { label: "Site", slugs: ["home", "about", "pages", "seo", "legal-pages", "site-settings"] },
  { label: "Inbox", slugs: ["enquiries", "enquiry-types"] },
  { label: "Admin", slugs: ["users", "audit-log"] },
];

export function groupEntries(entries: NavEntry[]): NavGroup[] {
  const placed = new Set<string>();
  const groups: NavGroup[] = GROUPS.map(({ label, slugs }) => {
    const members = slugs
      .map((slug) => entries.find((entry) => entry.slug === slug))
      .filter((entry): entry is NavEntry => entry !== undefined);
    members.forEach((entry) => placed.add(entry.slug));
    return { label, entries: members };
  }).filter((group) => group.entries.length > 0);

  const rest = entries.filter((entry) => !placed.has(entry.slug));
  if (rest.length > 0) groups.push({ label: "More", entries: rest });
  return groups;
}
