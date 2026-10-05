import * as React from "react";
import type { AdminViewServerProps } from "payload";
import { isAdmin } from "../access";
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
  if (!isAdmin(req)) return null;
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
