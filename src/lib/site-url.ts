import { publicEnv } from "./public-env";

/*
 * The one place the site's origin comes from (ARCHITECTURE.md §8). Content stores paths; every
 * absolute URL (canonicals, JSON-LD, sitemap, robots, share image) is built here, so changing the
 * domain is a change to NEXT_PUBLIC_SITE_URL only.
 */

export const siteUrl = publicEnv.siteUrl;

/** Host name for display, such as the footer title block ("deeptsight.com.au"). */
export const siteHost = new URL(siteUrl).host;

/** Absolute URL for a site path ("/about" → "https://…/about"). The home page has no trailing slash. */
export function absoluteUrl(path: string): string {
  if (path === "" || path === "/") return siteUrl;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
