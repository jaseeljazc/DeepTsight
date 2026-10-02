import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  Layers,
  Pencil,
  Upload,
} from "lucide-react";
import type { AdminViewServerProps, Payload } from "payload";
import { isAdmin } from "../access";

/*
 * The admin dashboard: counts, the latest enquiries, recent changes and shortcuts. Replaces
 * Payload's default grid of collection cards (the sidebar already lists every collection).
 * A server component reading through the Local API after an isAdmin check (user + verified second
 * factor); without it nothing is queried or shown. Styles: src/app/(payload)/admin-theme.css.
 */

const ADMIN = "/admin/collections";

const ACTION_WORDS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  publish: "Published",
  unpublish: "Unpublished",
  login: "Signed in",
  "login-blocked": "Blocked a sign-in",
  "mfa-enrolled": "Set up the authenticator",
  "mfa-verified": "Verified an authenticator code",
  "mfa-failed": "Entered a wrong authenticator code",
  "recovery-code-used": "Used a recovery code",
  "flag-change": "Changed an approval setting",
};

const EMAIL_STATUS: Record<string, { label: string; tone: "ok" | "bad" | "" }> = {
  sent: { label: "Sent", tone: "ok" },
  failed: { label: "Failed", tone: "bad" },
  pending: { label: "Pending", tone: "" },
  simulated: { label: "Not sent (test)", tone: "" },
};

/** Only changes to content name what changed; sign-in events do not (their target is just the accounts list). */
const NAMES_TARGET = new Set(["create", "update", "delete", "publish", "unpublish", "flag-change"]);

const relative = new Intl.RelativeTimeFormat("en-AU", { numeric: "auto" });

/** "2 hours ago", "yesterday". The exact time is kept in the element's title. */
function ago(value: string | undefined): string {
  if (!value) return "";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function exact(value: string | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleString("en-AU", {
    timeZone: "Australia/Perth",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function sentence(slug: string | null | undefined): string {
  const text = (slug ?? "").replace(/-/g, " ");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

async function load(payload: Payload) {
  const base = { overrideAccess: true } as const;
  const [
    services,
    servicesOn,
    credentials,
    credentialsVerified,
    media,
    mediaApproved,
    unread,
    failed,
    enquiries,
    activity,
  ] = await Promise.all([
    payload.count({ ...base, collection: "services" }),
    payload.count({ ...base, collection: "services", where: { enabled: { equals: true } } }),
    payload.count({ ...base, collection: "credentials" }),
    payload.count({ ...base, collection: "credentials", where: { verified: { equals: true } } }),
    payload.count({ ...base, collection: "media" }),
    payload.count({ ...base, collection: "media", where: { approvedForPublic: { equals: true } } }),
    payload.count({ ...base, collection: "enquiries", where: { read: { equals: false } } }),
    payload.count({
      ...base,
      collection: "enquiries",
      where: { emailStatus: { equals: "failed" } },
    }),
    payload.find({ ...base, collection: "enquiries", sort: "-submittedAt", limit: 5, depth: 0 }),
    payload.find({ ...base, collection: "audit-log", sort: "-at", limit: 8, depth: 0 }),
  ]);
  return {
    services: { total: services.totalDocs, on: servicesOn.totalDocs },
    credentials: { total: credentials.totalDocs, verified: credentialsVerified.totalDocs },
    media: { total: media.totalDocs, approved: mediaApproved.totalDocs },
    unread: unread.totalDocs,
    failed: failed.totalDocs,
    enquiries: enquiries.docs,
    activity: activity.docs,
  };
}

export async function DashboardView({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult;
  if (!isAdmin(req)) return null;

  const data = await load(req.payload);
  const name = (req.user as { name?: string | null; email?: string } | null)?.name;

  const stats = [
    {
      href: `${ADMIN}/services`,
      Icon: Layers,
      label: "Services",
      value: data.services.total,
      note: `${data.services.on} shown on the site`,
    },
    {
      href: `${ADMIN}/credentials`,
      Icon: BadgeCheck,
      label: "Credentials",
      value: data.credentials.total,
      note: `${data.credentials.verified} verified`,
    },
    {
      href: `${ADMIN}/media`,
      Icon: ImageIcon,
      label: "Images",
      value: data.media.total,
      note: `${data.media.approved} approved for public use`,
    },
    {
      href: `${ADMIN}/enquiries`,
      Icon: Inbox,
      label: "Unread enquiries",
      value: data.unread,
      note:
        data.failed > 0
          ? `${data.failed} email notification${data.failed === 1 ? "" : "s"} failed`
          : "All notifications sent",
    },
  ];

  return (
    <div className="dts-dashboard">
      <header className="dts-dashboard__head">
        <h1>Dashboard</h1>
        <p>{name ? `${name}, here is the state of the site.` : "The state of the site."}</p>
      </header>

      {data.failed > 0 && (
        <p className="dts-notice" role="alert">
          {data.failed} email notification{data.failed === 1 ? "" : "s"} failed. Those enquiries are
          saved here but did not reach the mailbox.{" "}
          <Link className="dts-link" href={`${ADMIN}/enquiries?where[emailStatus][equals]=failed`}>
            Show them
          </Link>
        </p>
      )}

      <ul className="dts-stats">
        {stats.map(({ href, Icon, label, value, note }) => (
          <li key={label} className="dts-stat">
            <Link className="dts-stat__link" href={href}>
              <span className="dts-stat__icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="dts-stat__label">{label}</span>
              <span className="dts-stat__value">{value}</span>
              <span className="dts-stat__note">{note}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="dts-grid">
        <section className="dts-panel" aria-labelledby="dts-enquiries">
          <div className="dts-panel__head">
            <h2 id="dts-enquiries">Recent enquiries</h2>
            <Link className="dts-link" href={`${ADMIN}/enquiries`}>
              View all
            </Link>
          </div>
          {data.enquiries.length === 0 ? (
            <p className="dts-panel__empty">
              No enquiries yet. They appear here as soon as the contact form is used.
            </p>
          ) : (
            <div className="dts-table-wrap">
              <table className="dts-table">
                <caption
                  className="payload-visually-hidden"
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                  }}
                >
                  The five most recent enquiries
                </caption>
                <thead>
                  <tr>
                    <th scope="col">From</th>
                    <th scope="col">Area</th>
                    <th scope="col">Email</th>
                    <th scope="col">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {data.enquiries.map((enquiry) => {
                    const status = EMAIL_STATUS[enquiry.emailStatus] ?? {
                      label: enquiry.emailStatus,
                      tone: "",
                    };
                    return (
                      <tr key={enquiry.id}>
                        <th scope="row">
                          <Link className="dts-link" href={`${ADMIN}/enquiries/${enquiry.id}`}>
                            {enquiry.name}
                          </Link>
                          {!enquiry.read && <span className="dts-pill dts-pill--new"> Unread</span>}
                          <span className="dts-meta">{enquiry.workEmail}</span>
                        </th>
                        <td>{enquiry.enquiryTypeLabel}</td>
                        <td>
                          <span
                            className={`dts-pill${status.tone ? ` dts-pill--${status.tone}` : ""}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td title={exact(enquiry.submittedAt)}>{ago(enquiry.submittedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dts-panel" aria-labelledby="dts-activity">
          <div className="dts-panel__head">
            <h2 id="dts-activity">Recent activity</h2>
            <Link className="dts-link" href={`${ADMIN}/audit-log`}>
              View all
            </Link>
          </div>
          {data.activity.length === 0 ? (
            <p className="dts-panel__empty">No activity recorded yet.</p>
          ) : (
            <ul className="dts-activity">
              {data.activity.map((entry) => (
                <li key={entry.id}>
                  <span>
                    {ACTION_WORDS[entry.action] ?? entry.action}
                    {entry.targetCollection && NAMES_TARGET.has(entry.action)
                      ? `: ${sentence(entry.targetCollection)}`
                      : ""}
                    {entry.field ? ` (${entry.field})` : ""}
                    <span className="dts-meta">{entry.userEmail ?? "System"}</span>
                  </span>
                  <time dateTime={entry.at} title={exact(entry.at)}>
                    {ago(entry.at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="dts-panel" aria-labelledby="dts-actions">
        <div className="dts-panel__head">
          <h2 id="dts-actions">Quick actions</h2>
        </div>
        <ul className="dts-actions">
          <li>
            <Link className="dts-action" href={`${ADMIN}/services`}>
              <Pencil aria-hidden="true" />
              <strong>Edit a service</strong>
              <span>Text, icon, images and order</span>
            </Link>
          </li>
          <li>
            <Link className="dts-action" href={`${ADMIN}/media/create`}>
              <Upload aria-hidden="true" />
              <strong>Add an image</strong>
              <span>Upload with its rights record</span>
            </Link>
          </li>
          <li>
            <Link className="dts-action" href={`${ADMIN}/enquiries`}>
              <Inbox aria-hidden="true" />
              <strong>Open the inbox</strong>
              <span>Read and manage enquiries</span>
            </Link>
          </li>
          <li>
            {/* The public site is a different document from the admin, so this is a plain link. */}
            <a className="dts-action" href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              <strong>View the live site</strong>
              <span>Opens in a new tab</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
