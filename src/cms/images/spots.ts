import { SEO_ROUTES } from "../../content/mappers";
import type { FrameShape, PhoneShape } from "./frames";
import type { OwnerRef, SpotInstance } from "./types";

/*
 * Every image the site shows, declared once: which document owns it, where the field is, where it
 * appears in plain words, and the frame shape on desktop and phone. A unit test walks the Payload
 * config and fails if an upload field to `media` is missing here, so a new image can never be
 * missing from the Images page.
 */

interface Def {
  key: string;
  path: string;
  group: string;
  groupPath: string | null;
  title: string;
  where: string;
  pagePath: string | null;
  desktop: FrameShape;
  phone: PhoneShape;
  required: boolean;
  badgeOnly?: boolean;
}

const GLOBAL_DEFS: Record<"home" | "about" | "pages", Def[]> = {
  home: [
    {
      key: "why",
      path: "media.why",
      group: "Home",
      groupPath: "/",
      title: "Why DeepTsight",
      where: "Home page, Why DeepTsight section, beside the three pillars",
      pagePath: "/",
      desktop: "landscape",
      phone: "landscape",
      required: true,
    },
    {
      key: "problems",
      path: "media.problems",
      group: "Home",
      groupPath: "/",
      title: "Problems addressed",
      where: "Home page, Problems addressed section, beside the heading",
      pagePath: "/",
      desktop: "classic",
      phone: "classic",
      required: true,
    },
    {
      key: "close",
      path: "media.close",
      group: "Home",
      groupPath: "/",
      title: "Closing band",
      where: "Home page, wide band above the closing call to action",
      pagePath: "/",
      desktop: "wide",
      phone: "classic",
      required: true,
    },
  ],
  about: [
    {
      key: "portrait",
      path: "media.portrait",
      group: "About",
      groupPath: "/about",
      title: "Founder portrait",
      where: "About page, beside the career text",
      pagePath: "/about",
      desktop: "portrait",
      phone: "portrait",
      required: true,
    },
    {
      key: "site",
      path: "media.site",
      group: "About",
      groupPath: "/about",
      title: "Site image",
      where: "About page, lower image on the left",
      pagePath: "/about",
      desktop: "landscape",
      phone: "landscape",
      required: true,
    },
    {
      key: "desk",
      path: "media.desk",
      group: "About",
      groupPath: "/about",
      title: "Desk image",
      where: "About page, lower image on the right",
      pagePath: "/about",
      desktop: "portrait",
      phone: "portrait",
      required: true,
    },
  ],
  pages: [
    {
      key: "services",
      path: "services.figure",
      group: "Services page",
      groupPath: "/services",
      title: "Services page image",
      where: "Services page, wide image under the heading",
      pagePath: "/services",
      desktop: "wide",
      phone: "classic",
      required: true,
    },
    {
      key: "credentials",
      path: "credentials.figure",
      group: "Credentials page",
      groupPath: "/credentials",
      title: "Credentials page image",
      where: "Credentials page, wide image under the heading",
      pagePath: "/credentials",
      desktop: "wide",
      phone: "classic",
      required: true,
    },
    {
      key: "contact",
      path: "contact.figure",
      group: "Contact page",
      groupPath: "/contact",
      title: "Contact page image",
      where: "Contact page, beside the enquiry form (wide screens only)",
      pagePath: "/contact",
      desktop: "landscape",
      phone: "hidden",
      required: true,
    },
  ],
};

const SEO_LABELS: Record<string, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  credentials: "Credentials",
  insights: "Insights",
  contact: "Contact",
  thankYou: "Thank-you page",
  privacy: "Privacy notice",
  terms: "Terms of use",
  accessibility: "Accessibility statement",
};

function ownerLabelled(def: Def, owner: OwnerRef, id: string): SpotInstance {
  return {
    id,
    owner,
    path: def.path,
    group: def.group,
    groupPath: def.groupPath,
    title: def.title,
    where: def.where,
    pagePath: def.pagePath,
    desktop: def.desktop,
    phone: def.phone,
    required: def.required,
    badgeOnly: def.badgeOnly === true,
  };
}

/** Spots owned by a global: Home, About, page images and share images for the fixed pages. */
export function globalSpots(): SpotInstance[] {
  const spots: SpotInstance[] = [];
  for (const slug of ["home", "about", "pages"] as const) {
    for (const def of GLOBAL_DEFS[slug]) {
      spots.push(ownerLabelled(def, { kind: "global", slug }, `${slug}:${def.path}`));
    }
  }
  for (const [route, key] of Object.entries(SEO_ROUTES)) {
    const label = SEO_LABELS[key] ?? key;
    spots.push(
      ownerLabelled(
        {
          key,
          path: `${key}.ogImage`,
          group: "Share images",
          groupPath: null,
          title: `${label}`,
          where: `Picture shown when a link to the ${label.toLowerCase()} page (${route}) is shared`,
          pagePath: route,
          desktop: "share",
          phone: "share",
          required: false,
        },
        { kind: "global", slug: "seo" },
        `seo:${key}.ogImage`,
      ),
    );
  }
  return spots;
}

export function serviceSpots(service: { id: number; slug: string; title: string }): SpotInstance[] {
  const owner: OwnerRef = { kind: "collection", slug: "services", id: service.id };
  const page = `/services/${service.slug}`;
  const base = { group: `Service: ${service.title}`, groupPath: page, pagePath: page };
  return [
    ownerLabelled(
      {
        ...base,
        key: "hero",
        path: "media.hero",
        title: "Main image",
        where:
          "Service page, wide image under the heading (also the thumbnail in the Services list and Related services)",
        desktop: "wide",
        phone: "classic",
        required: true,
      },
      owner,
      `services:${service.id}:media.hero`,
    ),
    ownerLabelled(
      {
        ...base,
        key: "detail",
        path: "media.detail",
        title: "Detail image",
        where: "Service page, beside part 3.0 Capability",
        desktop: "landscape",
        phone: "landscape",
        required: true,
      },
      owner,
      `services:${service.id}:media.detail`,
    ),
    ownerLabelled(
      {
        ...base,
        key: "share",
        path: "seo.ogImage",
        title: "Share image",
        where: `Picture shown when a link to this service page is shared`,
        desktop: "share",
        phone: "share",
        required: false,
      },
      owner,
      `services:${service.id}:seo.ogImage`,
    ),
  ];
}

export function credentialSpot(credential: { id: number; title: string }): SpotInstance {
  return ownerLabelled(
    {
      key: "badge",
      path: "badge",
      group: "Credential badges",
      groupPath: "/credentials",
      title: credential.title,
      where: "Credentials page register and the Home credentials strip",
      pagePath: "/credentials",
      desktop: "square",
      phone: "square",
      required: false,
      badgeOnly: true,
    },
    { kind: "collection", slug: "credentials", id: credential.id },
    `credentials:${credential.id}:badge`,
  );
}

/** Field paths per owner slug, for the completeness test and for refusing unknown writes. */
export function registeredFieldPaths(): Record<
  "home" | "about" | "pages" | "seo" | "services" | "credentials",
  string[]
> {
  return {
    home: GLOBAL_DEFS.home.map((def) => def.path),
    about: GLOBAL_DEFS.about.map((def) => def.path),
    pages: GLOBAL_DEFS.pages.map((def) => def.path),
    seo: Object.values(SEO_ROUTES).map((key) => `${key}.ogImage`),
    services: ["media.hero", "media.detail", "seo.ogImage"],
    credentials: ["badge"],
  };
}

export function isRegisteredPath(owner: OwnerRef, path: string): boolean {
  return registeredFieldPaths()[owner.slug].includes(path);
}
