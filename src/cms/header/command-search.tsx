"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/*
 * "Jump to": type to filter the admin's sections and press Enter to open one. Ctrl or Cmd + K
 * focuses it from anywhere. It searches destinations, not content (Payload has no
 * cross-collection search), and says so in its label.
 */

export type JumpItem = { label: string; group: string; href: string };

const MAX_RESULTS = 8;

export function CommandSearch({ items }: { items: JumpItem[] }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  const results = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? items.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(needle))
      : items;
    return matches.slice(0, MAX_RESULTS);
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
        aria-label="Jump to a section"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        placeholder="Jump to a section"
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
        aria-label="Sections"
        className="dts-search__list"
        hidden={!showList}
      >
        {results.map((item, index) => (
          <li
            key={item.href}
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
