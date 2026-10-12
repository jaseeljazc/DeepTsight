import * as React from "react";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";
import { hasPasswordSession, isAdmin } from "../access";
import { MFA_VIEW_PATH } from "../mfa/endpoints";
import { loadImagesPage } from "../images/data";
import { ImagesClient } from "./images/images-client";

/*
 * "Images on the website": every image the site shows, grouped by page, with where it appears and
 * what it looks like in its real frame. A server component: nothing is read before the isAdmin
 * check (signed in AND a verified second factor). Writes happen in src/cms/images/actions.ts.
 * Styles: src/app/(payload)/admin-theme.css (".dts-img-*").
 */
export async function ImagesView({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult;
  // Custom views skip Payload's own admin gate, so send the visitor where the rest of the admin
  // would: sign in first, then the second factor.
  if (!isAdmin(req)) redirect(hasPasswordSession(req) ? MFA_VIEW_PATH : "/admin/login");
  const data = await loadImagesPage(req.payload);
  return (
    <div className="dts-dashboard dts-img">
      <header className="dts-dashboard__head">
        <div>
          <h1>Images on the website</h1>
          <p>
            Every image the website shows, with where it appears. Changes are saved as drafts.
            Preview the page, then publish.
          </p>
        </div>
      </header>
      <ImagesClient data={data} />
    </div>
  );
}
