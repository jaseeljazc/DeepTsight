"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/*
 * Header search: type to find an admin section, or a setting by its label or description (for
 * example "business hours"), and press Enter to open it. A setting opens its page, switches to its
 * tab and scrolls to it. Ctrl or Cmd + K focuses it from anywhere. It searches the admin's own
 * labels, not the content records (Payload has no cross-collection search).
 */

export type JumpItem = {
  label: string;
  group: string;
  href: string;
  hint?: string;
  /** Payload's DOM id of the field to scroll to. */
  fieldId?: string;
  /** Tab that holds the field. */
  tab?: string;
};

const MAX_RESULTS = 8;

/** 0 = the label starts with the search, 1 = it contains it, 2 = only the rest of the item does. */
function rank(item: JumpItem, needle: string): number {
  const label = item.label.toLowerCase();
  if (label.startsWith(needle)) return 0;
  if (label.includes(needle)) return 1;
  const words = needle.split(/\s+/).filter(Boolean);
  const haystack = `${item.label} ${item.group} ${item.hint ?? ""}`.toLowerCase();
  return words.every((word) => haystack.includes(word)) ? 2 : -1;
}

/** Opens the item's tab if needed, then scrolls to the field once the page has drawn it. */
function reveal(item: JumpItem) {
  if (!item.fieldId && !item.tab) return;
  let tries = 0;
  let clicked = false;
  const timer = window.setInterval(() => {
    tries += 1;
    let target = item.fieldId ? document.getElementById(item.fieldId) : null;
    if (!target && item.tab && !clicked) {
      const tab = Array.from(
        document.querySelectorAll<HTMLElement>("button.tabs-field__tab-button"),
      ).find((button) => button.textContent?.trim() === item.tab);
      if (tab) {
        tab.click();
        clicked = true;
      }
    }
    target = item.fieldId ? document.getElementById(item.fieldId) : null;
    if (target) {
      window.clearInterval(timer);
      target.scrollIntoView({ block: "center" });
      if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName))
        target.focus({ preventScroll: true });
    } else if (tries > 30) {
      window.clearInterval(timer);
    }
  }, 100);
}

export function CommandSearch({ items }: { items: JumpItem[] }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  const results = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items.filter((item) => !item.fieldId && !item.tab).slice(0, MAX_RESULTS);
    return items
      .map((item, index) => ({ item, index, score: rank(item, needle) }))
      .filter((match) => match.score >= 0)
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .slice(0, MAX_RESULTS)
      .map((match) => match.item);
  }, [items, query]);

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(item: JumpItem | undefined) {
    if (!item) return;
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(item.href);
    reveal(item);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showList = open && results.length > 0;
  const activeId = showList ? `${listId}-${active}` : undefined;

  return (
    <div className="dts-search">
      <Search aria-hidden="true" className="dts-search__icon" />
      <input
        ref={inputRef}
        className="dts-search__input"
        type="text"
        role="combobox"
        aria-label="Search the admin"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        placeholder="Search sections and settings"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <kbd className="dts-search__hint" aria-hidden="true">
        Ctrl K
      </kbd>
      <ul
        id={listId}
        role="listbox"
        aria-label="Results"
        className="dts-search__list"
        hidden={!showList}
      >
        {results.map((item, index) => (
          <li
            key={`${item.href}#${item.fieldId ?? item.tab ?? ""}#${item.label}#${item.group}`}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            className="dts-search__option"
            // mousedown, not click: the input's blur would close the list before a click lands.
            onMouseDown={(event) => {
              event.preventDefault();
              go(item);
            }}
            onMouseEnter={() => setActive(index)}
          >
            <span>{item.label}</span>
            <span className="dts-search__group">{item.group}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
