/**
 * generate-dither.ts
 * Writes the site's dot-matrix globe to public/dither/ in the exact language of the hero plant
 * (src/components/content/power-plant-dither-paths.ts): a 7-unit grid, square dots of 3.2, 4.4
 * and 5.6 units for the light, mid and deep tones, and the same left-to-right fade.
 *
 * Run with `pnpm dither` after changing the globe. Local only: the globe is computed from the
 * hand-traced outlines in scripts/lib/coastlines.ts; nothing is fetched.
 */
import fs from "node:fs";
import path from "node:path";
import { colorTokens } from "../src/styles/tokens.generated";
import { AUSTRALIA, OTHER_LAND, PERTH, type Ring } from "./lib/coastlines";

const CELL = 7;
const DOT = { light: 3.2, mid: 4.4, deep: 5.6 } as const;
const OUT_DIR = path.resolve("public/dither");
const META = path.resolve("src/components/content/dither-meta.generated.ts");

/** 4x4 ordered-dither thresholds, centred in [0, 1). */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

type Grid = { cols: number; rows: number; darkness: Float32Array };
type Fade = "left" | "right" | "none";

/** Darkness 0..1 → tone level 0 (none), 1 light, 2 mid, 3 deep. */
function level(d: number, cx: number, cy: number): number {
  const t = BAYER[cy % 4]![cx % 4]!;
  return Math.max(0, Math.min(3, Math.floor(d * 3 + t)));
}

function square(cx: number, cy: number, size: number): string {
  const o = (CELL - size) / 2;
  const x = +(cx * CELL + o).toFixed(1);
  const y = +(cy * CELL + o).toFixed(1);
  return `M${x} ${y}h${size}v${size}h-${size}Z`;
}

function toSvg(grid: Grid, fade: Fade, id: string): string {
  const paths = { light: [] as string[], mid: [] as string[], deep: [] as string[] };
  for (let cy = 0; cy < grid.rows; cy++) {
    for (let cx = 0; cx < grid.cols; cx++) {
      const l = level(grid.darkness[cy * grid.cols + cx]!, cx, cy);
      if (l === 1) paths.light.push(square(cx, cy, DOT.light));
      if (l === 2) paths.mid.push(square(cx, cy, DOT.mid));
      if (l === 3) paths.deep.push(square(cx, cy, DOT.deep));
    }
  }
  const w = grid.cols * CELL;
  const h = grid.rows * CELL;
  // Same stops as the hero plant, mirrored for a right-hand fade.
  const stops =
    fade === "none"
      ? [
          [0, 1],
          [1, 1],
        ]
      : [
          [0, 0.22],
          [0.3, 0.6],
          [0.55, 1],
          [1, 1],
        ];
  const [x1, x2] = fade === "right" ? [1, 0] : [0, 1];
  const gradient = stops
    .map(([o, a]) => `<stop offset="${o}" stop-color="#fff" stop-opacity="${a}"/>`)
    .join("");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`,
    `<defs><linearGradient id="${id}-f" x1="${x1}" y1="0" x2="${x2}" y2="0">${gradient}</linearGradient>`,
    `<mask id="${id}-m"><rect width="${w}" height="${h}" fill="url(#${id}-f)"/></mask></defs>`,
    `<g mask="url(#${id}-m)">`,
    `<path fill="${colorTokens.dotLight}" opacity="0.8" d="${paths.light.join("")}"/>`,
    `<path fill="${colorTokens.dotMid}" opacity="0.9" d="${paths.mid.join("")}"/>`,
    `<path fill="${colorTokens.primary}" d="${paths.deep.join("")}"/>`,
    `</g></svg>`,
  ].join("");
}

/* ------------------------------------------------------------------ globe */

const rad = Math.PI / 180;

function inRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const inAny = (lon: number, lat: number, rings: Ring[]) => rings.some((r) => inRing(lon, lat, r));

/** Distance in degrees to the nearest graticule line, every `step` degrees. */
function graticuleDistance(lon: number, lat: number, step: number): number {
  const dLat = Math.abs(lat - Math.round(lat / step) * step);
  const dLon = Math.abs(lon - Math.round(lon / step) * step) * Math.cos(lat * rad);
  return Math.min(dLat, dLon);
}

type GlobeOptions = { cells: number; lon0: number; lat0: number };

function globe({ cells, lon0, lat0 }: GlobeOptions) {
  const radius = cells / 2 - 1.5;
  const centre = cells / 2;
  const darkness = new Float32Array(cells * cells);
  const SS = 3; // supersamples per axis
  const sin0 = Math.sin(lat0 * rad);
  const cos0 = Math.cos(lat0 * rad);

  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      let sum = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (cx + (sx + 0.5) / SS - centre) / radius;
          const y = -(cy + (sy + 0.5) / SS - centre) / radius;
          const rho = Math.hypot(x, y);
          if (rho > 1) continue;
          const c = Math.asin(rho);
          const lat =
            rho === 0 ? lat0 : Math.asin(Math.cos(c) * sin0 + (y * Math.sin(c) * cos0) / rho) / rad;
          let lon =
            lon0 +
            Math.atan2(x * Math.sin(c), rho * cos0 * Math.cos(c) - y * sin0 * Math.sin(c)) / rad;
          lon = ((((lon + 180) % 360) + 360) % 360) - 180;
          const z = Math.sqrt(1 - rho * rho);

          let d: number;
          if (inAny(lon, lat, AUSTRALIA)) d = 1;
          else if (inAny(lon, lat, OTHER_LAND)) d = 0.74 - 0.14 * (1 - z);
          else {
            // Ocean: nearly empty at the centre, a light rim towards the limb
            d = 0.04 + 0.34 * Math.pow(1 - z, 2);
            if (graticuleDistance(lon, lat, 15) < 0.6) d += 0.3;
          }
          sum += d;
        }
      }
      darkness[cy * cells + cx] = sum / (SS * SS);
    }
  }

  // Perth's position on the figure, as fractions of its width and height.
  const [plon, plat] = PERTH;
  const px = Math.cos(plat * rad) * Math.sin((plon - lon0) * rad);
  const py =
    cos0 * Math.sin(plat * rad) - sin0 * Math.cos(plat * rad) * Math.cos((plon - lon0) * rad);
  const perth = {
    x: +((centre + px * radius) / cells).toFixed(4),
    y: +((centre - py * radius) / cells).toFixed(4),
  };

  return { grid: { cols: cells, rows: cells, darkness } satisfies Grid, perth };
}

/* ------------------------------------------------------------------ run */

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const write = (name: string, svg: string) => {
    fs.writeFileSync(path.join(OUT_DIR, name), svg);
    console.log(`wrote public/dither/${name} (${Math.round(svg.length / 1024)} kB)`);
  };

  const g = globe({ cells: 124, lon0: 124, lat0: -25 });
  write("globe-perth.svg", toSvg(g.grid, "none", "globe"));

  fs.writeFileSync(
    META,
    `// Generated by scripts/generate-dither.ts. Do not edit.\n\n` +
      `/** Perth on public/dither/globe-perth.svg, as fractions of the figure's width and height. */\n` +
      `export const GLOBE_PERTH = ${JSON.stringify(g.perth)} as const;\n`,
  );
  console.log(`perth at ${JSON.stringify(g.perth)}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
