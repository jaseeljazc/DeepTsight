"use client";

import * as React from "react";
import { needsAttention } from "../../images/cards";
import type { ImagesPageData } from "../../images/types";
import { Announcer } from "./announce";
import { DeleteDialog } from "./delete";
import { filterCards, groupCards, pageNames, siblingsOf, uploadedOn } from "./logic";
import { SpotCardView } from "./spot-card";

type Tab = "used" | "unused";
const TABS: Tab[] = ["used", "unused"];

/** The interactive Images page: two tabs (used on the website, unused), search and filters. */
export function ImagesClient({ data }: { data: ImagesPageData }) {
  const [tab, setTab] = React.useState<Tab>("used");
  const [query, setQuery] = React.useState("");
  const [attentionOnly, setAttentionOnly] = React.useState(false);
  const [pageFilter, setPageFilter] = React.useState("");
  const [deleting, setDeleting] = React.useState<number | null>(null);
  const base = React.useId();
  const tabRefs = React.useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});

  const visible = filterCards(data.cards, { query, attentionOnly, page: pageFilter });
  const groups = groupCards(visible);
  const attention = data.cards.filter(needsAttention).length;
  const tabId = (t: Tab) => `${base}-tab-${t}`;
  const panelId = (t: Tab) => `${base}-panel-${t}`;
  const labels: Record<Tab, string> = {
    used: `Used on the website (${data.cards.length})`,
    unused: `Unused images (${data.unused.length})`,
  };

  // Arrow keys, Home and End move between the tabs (the WAI-ARIA tabs pattern).
  function onTabKey(event: React.KeyboardEvent<HTMLButtonElement>) {
    const index = TABS.indexOf(tab);
    const next: Record<string, number> = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    };
    const target = TABS[next[event.key] ?? -1];
    if (!target) return;
    event.preventDefault();
    setTab(target);
    tabRefs.current[target]?.focus();
  }

  return (
    <Announcer>
      <div role="tablist" aria-label="Images" className="dts-img__tabs">
        {TABS.map((t) => (
          <button
            key={t}
            ref={(node) => {
              tabRefs.current[t] = node;
            }}
            id={tabId(t)}
            role="tab"
            type="button"
            className="dts-img__tab"
            aria-selected={tab === t}
            aria-controls={panelId(t)}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={onTabKey}
          >
            {labels[t]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={panelId("used")}
        aria-labelledby={tabId("used")}
        hidden={tab !== "used"}
      >
        <div className="dts-img__toolbar">
          <label>
            <span className="dts-sr-only">Search images</span>
            <input
              type="search"
              placeholder="Search by page, spot or caption"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <span className="dts-sr-only">Show one page only</span>
            <select value={pageFilter} onChange={(event) => setPageFilter(event.target.value)}>
              <option value="">All pages</option>
              {pageNames(data.cards).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="dts-img__check">
            <input
              type="checkbox"
              checked={attentionOnly}
              onChange={(event) => setAttentionOnly(event.target.checked)}
            />
            <span>Needs attention ({attention})</span>
          </label>
        </div>
        <p className="dts-sr-only" role="status">
          {visible.length === data.cards.length
            ? ""
            : `${visible.length} of ${data.cards.length} image spots shown.`}
        </p>
        {groups.map((group, index) => {
          const headingId = `${base}-group-${index}`;
          return (
            <section key={group.name} className="dts-img__group" aria-labelledby={headingId}>
              <div className="dts-img__group-head">
                <h2 id={headingId}>{group.name}</h2>
                {group.path && (
                  <a href={group.path} target="_blank" rel="noopener noreferrer">
                    View page<span className="dts-sr-only"> {group.name} (opens in a new tab)</span>
                  </a>
                )}
              </div>
              <ul className="dts-img__grid">
                {group.cards.map((card) => (
                  <SpotCardView key={card.id} card={card} siblings={siblingsOf(card, data.cards)} />
                ))}
              </ul>
            </section>
          );
        })}
        {visible.length === 0 && <p>No image spots match.</p>}
        <p className="dts-img__where">
          Some graphics are drawn in code and cannot be changed here: the dotted power plant on
          Home, the Perth globe, the dotted numbers and the dotted bar.
        </p>
      </div>

      <div
        role="tabpanel"
        id={panelId("unused")}
        aria-labelledby={tabId("unused")}
        hidden={tab !== "unused"}
      >
        {data.unused.length === 0 ? (
          <p>Every image in the library is in use.</p>
        ) : (
          <ul className="dts-img__grid">
            {data.unused.map(({ image, createdAt }) => (
              <li key={image.id} className="dts-img__card">
                <div className="dts-img__frame" style={{ aspectRatio: "3 / 2" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt={image.alt} loading="lazy" />
                </div>
                <h3>{image.caption || image.filename}</h3>
                <p className="dts-img__where">{image.filename}</p>
                {uploadedOn(createdAt) && <p className="dts-img__where">{uploadedOn(createdAt)}</p>}
                <ul className="dts-img__status" aria-label="Status">
                  <li data-tone={image.approved ? "ok" : "warn"}>
                    {image.approved
                      ? "Approved for public use"
                      : "Not approved — hidden on the live site"}
                  </li>
                </ul>
                <div className="dts-img__actions">
                  <button
                    type="button"
                    className="dts-img__btn dts-img__btn--danger"
                    onClick={() => setDeleting(image.id)}
                  >
                    Delete image
                    <span className="dts-sr-only">: {image.caption || image.filename}</span>
                  </button>
                </div>
                <DeleteDialog
                  image={image}
                  open={deleting === image.id}
                  onClose={() => setDeleting(null)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Announcer>
  );
}
