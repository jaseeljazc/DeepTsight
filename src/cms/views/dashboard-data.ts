import type { Payload } from "payload";

/*
 * Everything the dashboard reads, in one place. Local API with overrideAccess: the caller
 * (dashboard.tsx) has already checked isAdmin. Counts and a handful of recent rows only.
 */

const TIME_ZONE = "Australia/Perth";
const MONTHS_SHOWN = 10;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type RecentKind = "service" | "credential" | "article" | "image";

export type RecentItem = {
  id: number | string;
  kind: RecentKind;
  title: string;
  detail: string;
  published: boolean;
  updatedAt: string;
  href: string;
};

export type MonthBucket = { key: string; label: string; received: number; unread: number };

const monthKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
});

/** "2026-10" for a moment, in the site's own time zone. */
function keyOf(date: Date): string {
  return monthKey.format(date).slice(0, 7);
}

function monthsEndingNow(): MonthBucket[] {
  const [year, month] = keyOf(new Date()).split("-").map(Number) as [number, number];
  const buckets: MonthBucket[] = [];
  for (let back = MONTHS_SHOWN - 1; back >= 0; back -= 1) {
    const index = year * 12 + (month - 1) - back;
    const y = Math.floor(index / 12);
    const m = index % 12;
    buckets.push({
      key: `${y}-${String(m + 1).padStart(2, "0")}`,
      label: MONTH_NAMES[m] ?? "",
      received: 0,
      unread: 0,
    });
  }
  return buckets;
}

export async function loadDashboard(payload: Payload) {
  const base = { overrideAccess: true } as const;
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const recent = { ...base, sort: "-updatedAt", limit: 5, depth: 0 } as const;
  const created = (collection: "services" | "credentials" | "media" | "enquiries") =>
    payload.count({ ...base, collection, where: { createdAt: { greater_than: since30 } } });

  const buckets = monthsEndingNow();
  const firstKey = buckets[0]?.key ?? "";
  const rangeStart = new Date(`${firstKey}-01T00:00:00+08:00`).toISOString();

  const [
    services,
    servicesOn,
    servicesNew,
    credentials,
    credentialsVerified,
    credentialsNew,
    media,
    mediaApproved,
    mediaNew,
    enquiries,
    enquiriesNew,
    unread,
    failed,
    recentServices,
    recentCredentials,
    recentArticles,
    recentMedia,
    activity,
    inRange,
  ] = await Promise.all([
    payload.count({ ...base, collection: "services" }),
    payload.count({ ...base, collection: "services", where: { enabled: { equals: true } } }),
    created("services"),
    payload.count({ ...base, collection: "credentials" }),
    payload.count({ ...base, collection: "credentials", where: { verified: { equals: true } } }),
    created("credentials"),
    payload.count({ ...base, collection: "media" }),
    payload.count({ ...base, collection: "media", where: { approvedForPublic: { equals: true } } }),
    created("media"),
    payload.count({ ...base, collection: "enquiries" }),
    created("enquiries"),
    payload.count({ ...base, collection: "enquiries", where: { read: { equals: false } } }),
    payload.count({
      ...base,
      collection: "enquiries",
      where: { emailStatus: { equals: "failed" } },
    }),
    payload.find({ ...recent, collection: "services" }),
    payload.find({ ...recent, collection: "credentials" }),
    payload.find({ ...recent, collection: "articles" }),
    payload.find({ ...recent, collection: "media" }),
    payload.find({ ...base, collection: "audit-log", sort: "-at", limit: 6, depth: 0 }),
    payload.find({
      ...base,
      collection: "enquiries",
      where: { submittedAt: { greater_than_equal: rangeStart } },
      limit: 2000,
      depth: 0,
      select: { submittedAt: true, read: true },
    }),
  ]);

  for (const row of inRange.docs) {
    if (!row.submittedAt) continue;
    const bucket = buckets.find((candidate) => candidate.key === keyOf(new Date(row.submittedAt)));
    if (!bucket) continue;
    bucket.received += 1;
    if (!row.read) bucket.unread += 1;
  }

  const items: RecentItem[] = [
    ...recentServices.docs.map((doc) => ({
      id: doc.id,
      kind: "service" as const,
      title: doc.title,
      detail: `/services/${doc.slug}`,
      published: doc._status === "published",
      updatedAt: doc.updatedAt,
      href: `/admin/collections/services/${doc.id}`,
    })),
    ...recentCredentials.docs.map((doc) => ({
      id: doc.id,
      kind: "credential" as const,
      title: doc.title,
      detail: doc.verified ? "Verified" : "Not yet verified",
      published: doc._status === "published",
      updatedAt: doc.updatedAt,
      href: `/admin/collections/credentials/${doc.id}`,
    })),
    ...recentArticles.docs.map((doc) => ({
      id: doc.id,
      kind: "article" as const,
      title: doc.title,
      detail: "Insights article",
      published: doc._status === "published",
      updatedAt: doc.updatedAt,
      href: `/admin/collections/articles/${doc.id}`,
    })),
    ...recentMedia.docs.map((doc) => ({
      id: doc.id,
      kind: "image" as const,
      title: doc.caption || doc.filename || "Image position",
      detail: doc.approvedForPublic ? "Approved for public use" : "Not approved for public use",
      published: doc._status === "published",
      updatedAt: doc.updatedAt,
      href: `/admin/collections/media/${doc.id}`,
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return {
    stats: {
      services: {
        total: services.totalDocs,
        on: servicesOn.totalDocs,
        added: servicesNew.totalDocs,
      },
      credentials: {
        total: credentials.totalDocs,
        verified: credentialsVerified.totalDocs,
        added: credentialsNew.totalDocs,
      },
      media: {
        total: media.totalDocs,
        approved: mediaApproved.totalDocs,
        added: mediaNew.totalDocs,
      },
      enquiries: {
        total: enquiries.totalDocs,
        unread: unread.totalDocs,
        failed: failed.totalDocs,
        added: enquiriesNew.totalDocs,
      },
    },
    items,
    activity: activity.docs,
    months: buckets,
  };
}
