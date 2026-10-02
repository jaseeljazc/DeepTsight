import NextLink from "next/link";
import type { CategoryLink } from "@/lib/insights";
import { cn } from "@/lib/utils";

/** Filter by category: plain links, so it works without JavaScript and every state has its own address. */
export function CategoryFilter({
  categories,
  current,
}: {
  categories: CategoryLink[];
  current?: string;
}) {
  if (categories.length === 0) return null;
  const items = [
    { href: "/insights", label: "All", active: current === undefined },
    ...categories.map((category) => ({
      href: `/insights/category/${category.slug}`,
      label: category.name,
      active: current === category.slug,
    })),
  ];
  return (
    <nav aria-label="Filter articles by category" className="mb-10">
      <ul className="flex flex-wrap gap-x-6 gap-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <NextLink
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "link-rule min-h-target inline-flex items-center",
                item.active ? "text-ink-900 font-medium" : "text-steel-600 hover:text-ink-900",
              )}
            >
              {item.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
