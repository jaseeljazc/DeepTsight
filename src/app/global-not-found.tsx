import type { Metadata } from "next";
import { PublicDocument } from "@/components/layout/public-document";
import { publicMetadata } from "@/lib/public-metadata";
import NotFound from "./(public)/not-found";

/*
 * 404 for addresses that match no route. With two root layouts (public site and CMS admin) there is
 * no single layout to render it in, so Next.js renders this whole document instead
 * (experimental.globalNotFound). It must look exactly like the public site's 404.
 */
export const metadata: Metadata = {
  ...publicMetadata,
  // No layout template applies here, so the brand suffix is written out.
  title: "Page not found | DeepTsight Consulting",
};

export default function GlobalNotFound() {
  return (
    <PublicDocument>
      <NotFound />
    </PublicDocument>
  );
}
