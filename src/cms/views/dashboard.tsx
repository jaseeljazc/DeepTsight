import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Inbox,
  Layers,
  Minus,
  Newspaper,
  Pencil,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import type { AdminViewServerProps } from "payload";
import { isAdmin } from "../access";
import { EnquiryChart } from "./dashboard-chart";
import { loadDashboard, type RecentKind } from "./dashboard-data";
import {
  ACTION_WORDS,
  NAMES_TARGET,
  ago,
  exact,
  sentence,
  today,
  toneFor,
  type Tone,
} from "./dashboard-format";

/*
 * The admin dashboard: counts with recent change, the latest edits, recent activity, enquiries per
 * month and shortcuts. Replaces Payload's default grid of collection cards (the sidebar lists every
 * collection). A server component reading through the Local API after an isAdmin check (user +
 * verified second factor); without it nothing is queried or shown.
 * Styles: src/app/(payload)/admin-theme.css.
 */

const ADMIN = "/admin/collections";

const KIND: Record<RecentKind, { label: string; Icon: LucideIcon; tone: Tone }> = {
  service: { label: "Service", Icon: Layers, tone: "blue" },
  credential: { label: "Credential", Icon: BadgeCheck, tone: "green" },
  article: { label: "Article", Icon: Newspaper, tone: "orange" },
  image: { label: "Image", Icon: ImageIcon, tone: "purple" },
};

function Tile({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`dts-tile dts-tile--${tone}`} aria-hidden="true">
      {children}
    </span>
  );
}

function activityIcon(action: string, collection: string | null | undefined): LucideIcon {
  if (action === "delete") return Trash2;
  if (!NAMES_TARGET.has(action)) return ShieldCheck;
  if (collection === "media") return ImageIcon;
  if (collection === "enquiries") return Inbox;
  if (collection === "users" || action === "flag-change") return Settings;
  return FileText;
}

export async function DashboardView({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult;
  if (!isAdmin(req)) return null;

  const data = await loadDashboard(req.payload);
  const name = (req.user as { name?: string | null } | null)?.name;
  const { stats } = data;

  const cards: {
    href: string;
    Icon: LucideIcon;
    tone: Tone;
    label: string;
    value: number;
    added: number;
    note: string;
  }[] = [
    {
      href: `${ADMIN}/services`,
      Icon: Layers,
      tone: "blue",
      label: "Services",
      value: stats.services.total,
      added: stats.services.added,
      note: `${stats.services.on} shown on the site`,
    },
    {
      href: `${ADMIN}/credentials`,
      Icon: BadgeCheck,
      tone: "green",
      label: "Credentials",
      value: stats.credentials.total,
      added: stats.credentials.added,
      note: `${stats.credentials.verified} verified`,
    },
    {
      href: `${ADMIN}/media`,
      Icon: ImageIcon,
      tone: "purple",
      label: "Images",
      value: stats.media.total,
      added: stats.media.added,
      note: `${stats.media.approved} approved for public use`,
    },
    {
      href: `${ADMIN}/enquiries`,
      Icon: Inbox,
      tone: "orange",
      label: "Enquiries",
      value: stats.enquiries.total,
      added: stats.enquiries.added,
      note: `${stats.enquiries.unread} unread`,
    },
  ];

  return (
    <div className="dts-dashboard">
      <header className="dts-dashboard__head">
        <div>
          <h1>Dashboard</h1>
          <p>
            {name
              ? `Welcome back, ${name}. Here is the state of the site.`
              : "Here is the state of the site."}
          </p>
        </div>
        <p className="dts-date">
          <CalendarDays aria-hidden="true" />
          {today()}
        </p>
      </header>

      {stats.enquiries.failed > 0 && (
        <p className="dts-notice" role="alert">
          {stats.enquiries.failed} email notification{stats.enquiries.failed === 1 ? "" : "s"}{" "}
          failed. Those enquiries are saved here but did not reach the mailbox.{" "}
          <Link className="dts-link" href={`${ADMIN}/enquiries?where[emailStatus][equals]=failed`}>
            Show them
          </Link>
        </p>
      )}

      <ul className="dts-stats">
        {cards.map(({ href, Icon, tone, label, value, added, note }) => (
          <li key={label}>
            <Link className="dts-card dts-stat" href={href}>
              <Tile tone={tone}>
                <Icon />
              </Tile>
              <span className="dts-stat__body">
                <span className="dts-stat__label">{label}</span>
                <span className="dts-stat__value">{value}</span>
                <span className={`dts-stat__trend${added > 0 ? "dts-stat__trend--up" : ""}`}>
                  {added > 0 ? <ArrowUp aria-hidden="true" /> : <Minus aria-hidden="true" />}
                  {added > 0 ? `${added} added in 30 days` : "No change in 30 days"}
                </span>
                <span className="dts-stat__note">{note}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="dts-grid">
        <section className="dts-card" aria-labelledby="dts-recent">
          <div className="dts-card__head">
            <h2 id="dts-recent">Recent content</h2>
            <Link className="dts-link" href={`${ADMIN}/services`}>
              View services <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          {data.items.length === 0 ? (
            <p className="dts-card__empty">Nothing has been edited yet.</p>
          ) : (
            <div className="dts-table-wrap">
              <table className="dts-table">
                <caption className="dts-sr-only">The five most recently edited items</caption>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Updated</th>
                    <th scope="col">
                      <span className="dts-sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => {
                    const { label, Icon, tone } = KIND[item.kind];
                    return (
                      <tr key={`${item.kind}-${item.id}`}>
                        <th scope="row">
                          <span className="dts-row">
                            <Tile tone={tone}>
                              <Icon />
                            </Tile>
                            <span>
                              <Link className="dts-row__title" href={item.href}>
                                {item.title}
                              </Link>
                              <span className="dts-meta">{item.detail}</span>
                            </span>
                          </span>
                        </th>
                        <td>
                          <span className={`dts-pill dts-pill--${tone}`}>{label}</span>
                        </td>
                        <td>
                          <span
                            className={`dts-pill dts-pill--${item.published ? "green" : "orange"}`}
                          >
                            {item.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td title={exact(item.updatedAt)}>{ago(item.updatedAt)}</td>
                        <td>
                          <Link
                            className="dts-icon-link"
                            href={item.href}
                            aria-label={`Open ${item.title}`}
                          >
                            <ArrowRight aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dts-card" aria-labelledby="dts-activity">
          <div className="dts-card__head">
            <h2 id="dts-activity">Recent activity</h2>
            <Link className="dts-link" href={`${ADMIN}/audit-log`}>
              View all <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          {data.activity.length === 0 ? (
            <p className="dts-card__empty">No activity recorded yet.</p>
          ) : (
            <ul className="dts-activity">
              {data.activity.map((entry) => {
                const Icon = activityIcon(entry.action, entry.targetCollection);
                return (
                  <li key={entry.id}>
                    <Tile tone={toneFor(entry.action, entry.targetCollection)}>
                      <Icon />
                    </Tile>
                    <span className="dts-activity__text">
                      <strong>
                        {ACTION_WORDS[entry.action] ?? entry.action}
                        {entry.targetCollection && NAMES_TARGET.has(entry.action)
                          ? `: ${sentence(entry.targetCollection)}`
                          : ""}
                        {entry.field ? ` (${entry.field})` : ""}
                      </strong>
                      <span className="dts-meta">{entry.userEmail ?? "System"}</span>
                    </span>
                    <time dateTime={entry.at} title={exact(entry.at)}>
                      {ago(entry.at)}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="dts-grid dts-grid--lower">
        <section className="dts-card" aria-labelledby="dts-chart">
          <div className="dts-card__head">
            <h2 id="dts-chart">Enquiries per month</h2>
          </div>
          <EnquiryChart months={data.months} />
        </section>

        <section className="dts-card" aria-labelledby="dts-actions">
          <div className="dts-card__head">
            <h2 id="dts-actions">Quick actions</h2>
          </div>
          <ul className="dts-actions">
            <li>
              <Link className="dts-action" href={`${ADMIN}/services`}>
                <Tile tone="blue">
                  <Pencil />
                </Tile>
                <span>
                  <strong>Edit a service</strong>
                  <span>Text, icon, images and order</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link className="dts-action" href={`${ADMIN}/media/create`}>
                <Tile tone="purple">
                  <Upload />
                </Tile>
                <span>
                  <strong>Add an image</strong>
                  <span>Upload with its rights record</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link className="dts-action" href={`${ADMIN}/enquiries`}>
                <Tile tone="orange">
                  <Inbox />
                </Tile>
                <span>
                  <strong>Open the inbox</strong>
                  <span>Read and manage enquiries</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
            <li>
              {/* The public site is a different document from the admin, so this is a plain link. */}
              <a className="dts-action" href="/" target="_blank" rel="noopener noreferrer">
                <Tile tone="green">
                  <ExternalLink />
                </Tile>
                <span>
                  <strong>View the live site</strong>
                  <span>Opens in a new tab</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
