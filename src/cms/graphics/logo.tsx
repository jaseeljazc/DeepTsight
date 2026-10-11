import * as React from "react";
import Image from "next/image";

/*
 * Admin branding: the official DeepTsight logo files (public/brand, supplied 2026-10-11), used
 * unchanged. Styles are in src/app/(payload)/admin-theme.css.
 */

/** Login screen: the colour logo with "CMS" beside it. */
export function Logo() {
  return (
    <span className="dts-wordmark">
      <Image
        className="dts-wordmark__logo"
        src="/brand/deeptsight-logo-horizontal.svg"
        alt="DeepTsight"
        width={401}
        height={79}
        unoptimized
      />
      <span className="dts-wordmark__sub">CMS</span>
    </span>
  );
}

/** The sidebar header sits on the dark navigation: the white logo with "CMS" beside it. */
export function LogoOnDark() {
  return (
    <>
      <Image
        className="dts-brand__logo"
        src="/brand/deeptsight-logo-white.svg"
        alt="DeepTsight"
        width={401}
        height={79}
        unoptimized
      />
      <span className="dts-brand__sub">CMS</span>
    </>
  );
}

/** Small mark for the collapsed sidebar and the account menu. */
export function Icon() {
  return (
    <Image
      aria-hidden="true"
      alt=""
      className="dts-icon"
      src="/brand/deeptsight-mark.svg"
      width={22}
      height={22}
      unoptimized
    />
  );
}
