import * as React from "react";
import { encode } from "uqr";

/**
 * QR code drawn on the server as SVG elements (no image service, no HTML strings). Used once, to
 * enrol an authenticator app.
 */
export function QrCode({ text, label }: { text: string; label: string }) {
  const { data, size } = encode(text, { ecc: "M", border: 2 });
  const cells: React.ReactNode[] = [];
  data.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }),
  );
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${size} ${size}`}
      width={size * 6}
      height={size * 6}
      shapeRendering="crispEdges"
      style={{ background: "white", fill: "black" }}
    >
      {cells}
    </svg>
  );
}
