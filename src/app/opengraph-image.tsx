import { ImageResponse } from "next/og";
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
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "16px", height: "16px", backgroundColor: c.primary }} />
        <span style={{ fontSize: "30px", fontWeight: 600, color: c.ink900 }}>DeepTsight</span>
        <span style={{ fontSize: "22px", color: c.steel600 }}>Consulting</span>
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
          Deep technical insight for safer, more reliable and more secure industrial operations.
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
        <span>Perth, Western Australia</span>
        <span style={{ color: c.primary }}>{siteHost}</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
