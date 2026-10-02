import * as React from "react";

/*
 * Admin branding: a typeset wordmark, like the site's (src/components/layout/wordmark.tsx), until the
 * approved logo file arrives. Styles are in src/app/(payload)/admin-theme.css.
 * TODO(CLIENT): replace with the approved logo artwork (OPEN-01, OPEN-02, OPEN-10).
 */

/** Login screen and sidebar header. */
export function Logo() {
  return (
    <span className="dts-wordmark">
      <span aria-hidden="true" className="dts-wordmark__marker" />
      <span className="dts-wordmark__name">DeepTsight</span>
      <span className="dts-wordmark__sub">CMS</span>
    </span>
  );
}

/** Small mark for the collapsed sidebar and the account menu. */
export function Icon() {
  return (
    <span aria-hidden="true" className="dts-icon">
      D
    </span>
  );
}
