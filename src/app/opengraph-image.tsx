import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getSite } from "@/content";
import { colorTokens as c } from "@/styles/tokens.generated";
import { siteHost } from "@/lib/site-url";

export const alt = "DeepTsight Consulting: industrial engineering and OT cybersecurity, Perth";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * Social share card. next/og cannot read CSS variables, so colours come from the tokens
 * generated from globals.css. Pixel sizes are specific to this fixed 1200 × 630 canvas.
 */
export default async function Image() {
  const site = await getSite();
  // The official logo file, unchanged (public/brand). next/og takes it as a data URI.
  const logo = await readFile(path.join(process.cwd(), "public/brand/deeptsight-logo-horizontal.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: c.ground,
        padding: "72px 80px",
        color: c.ink900,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img only */}
        <img src={logoSrc} alt="DeepTsight" width={305} height={60} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            fontSize: "58px",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: c.ink900,
            maxWidth: "980px",
          }}
        >
          {site.tagline}
        </div>
        <div style={{ fontSize: "24px", color: c.ink700, maxWidth: "860px", lineHeight: 1.4 }}>
          Control systems and E&I engineering, OT cybersecurity, IT/OT segregation and plant
          reliability.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${c.ink900}`,
          paddingTop: "20px",
          fontSize: "20px",
          color: c.steel600,
        }}
      >
        <span>{site.locationLabel}</span>
        <span style={{ color: c.primary }}>{siteHost}</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
