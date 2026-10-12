"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { colorTokens } from "@/styles/tokens.generated";
import { GLOBE_LAND_POINTS, PERTH_COORDS } from "./globe-data.generated";

export const KERALA_COORDS = { lat: 9.94, lon: 76.27 } as const;
export const SAUDI_COORDS = { lat: 24.71, lon: 46.68 } as const;

export type GlobeMarker = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  leadDirection?: "left" | "right";
};

export const DEFAULT_GLOBE_MARKERS: readonly GlobeMarker[] = [
  {
    id: "perth",
    label: "Perth, WA",
    lat: PERTH_COORDS.lat,
    lon: PERTH_COORDS.lon,
    leadDirection: "left",
  },
  {
    id: "kerala",
    label: "Kerala, India",
    lat: KERALA_COORDS.lat,
    lon: KERALA_COORDS.lon,
    leadDirection: "left",
  },
  {
    id: "saudi",
    label: "Saudi Arabia",
    lat: SAUDI_COORDS.lat,
    lon: SAUDI_COORDS.lon,
    leadDirection: "left",
  },
];

export type DotGlobeProps = {
  /** Visible pin label for the primary Perth terminal (defaults to "Perth, WA"). */
  label?: string;
  /** Custom list of location markers pinned to the globe. Defaults to Perth, Kerala, and Saudi Arabia. */
  markers?: readonly GlobeMarker[];
  className?: string;
};

// Canvas resolution matching public/dither/globe-perth.svg (868 x 868).
const GLOBE_SIZE = 868;
const RADIUS = 390;
const CX = GLOBE_SIZE / 2;
const CY = GLOBE_SIZE / 2;
const DEG2RAD = Math.PI / 180;

// Camera tilted slightly south looking towards Australia (-20 degrees latitude)
const TILT_LAT = -20 * DEG2RAD;
const COS_TILT = Math.cos(TILT_LAT);
const SIN_TILT = Math.sin(TILT_LAT);

// Design system token colours
const COLOR_PRIMARY = colorTokens.primary;
const COLOR_DOT_MID = colorTokens.dotMid;
const COLOR_DOT_LIGHT = colorTokens.dotLight;
const COLOR_RULE = colorTokens.rule;

// Australia and Perth front and centre (124 degrees longitude)
const START_LON = 124 * DEG2RAD;
// How long the globe holds on Australia when it first comes into view, before it starts to spin
const START_HOLD_MS = 100;
// Share of the globe that must be on screen to count as "in view"
const IN_VIEW_THRESHOLD = 0.4;

const emptySubscribe = () => () => {};

// Pre-compute accented regions once at module load
// Type 2 = primary accent (Australia, Kerala, and Saudi Arabia)
const PROCESSED_LAND_POINTS: readonly [number, number, number][] = GLOBE_LAND_POINTS.map(
  ([lat, lon, type]) => {
    const isKerala = lat >= 8 && lat <= 13 && lon >= 74.5 && lon <= 78;
    const isSaudi = lat >= 16 && lat <= 32 && lon >= 36 && lon <= 55;
    const isHighlighted = type === 2 || isKerala || isSaudi;
    return [lat, lon, isHighlighted ? 2 : 1] as const;
  },
);

// Pins show only once clear of the limb. They switch rather than fade, so a label is never
// drawn at partial opacity (a half-faded label fails text contrast).
const PIN_VISIBLE_MZ = 0.18;

function getInitialMarkerStyle(marker: GlobeMarker): React.CSSProperties {
  const mPhi = marker.lat * DEG2RAD;
  const mLam = marker.lon * DEG2RAD - START_LON;
  const mx = Math.cos(mPhi) * Math.sin(mLam);
  const my = COS_TILT * Math.sin(mPhi) - SIN_TILT * Math.cos(mPhi) * Math.cos(mLam);
  const mz = SIN_TILT * Math.sin(mPhi) + COS_TILT * Math.cos(mPhi) * Math.cos(mLam);

  if (mz >= PIN_VISIBLE_MZ) {
    const screenX = CX + mx * RADIUS;
    const screenY = CY - my * RADIUS;
    const xPct = ((screenX / GLOBE_SIZE) * 100).toFixed(2);
    const yPct = ((screenY / GLOBE_SIZE) * 100).toFixed(2);

    return {
      "--pin-x": `${xPct}%`,
      "--pin-y": `${yPct}%`,
      visibility: "visible",
    } as React.CSSProperties;
  }

  return {
    "--pin-x": "50%",
    "--pin-y": "50%",
    visibility: "hidden",
  } as React.CSSProperties;
}

/**
 * Revolving dot-matrix globe matching the hero power plant's telemetry aesthetic.
 * Renders an orthographic sphere of precomputed land dots on HTML5 canvas at 60fps,
 * revolving smoothly around its polar axis with location terminals pinned.
 *
 * It stays still on Australia when it first comes into view, holds there for a moment, then
 * starts to spin. Later visits carry on from wherever it was. Nothing renders while off screen.
 *
 * Supports drag-to-inspect and honors prefers-reduced-motion.
 */
export function DotGlobe({ label, markers: customMarkers, className }: DotGlobeProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pinMapRef = React.useRef<Map<string, HTMLSpanElement>>(new Map());

  const resolvedMarkers = React.useMemo(() => {
    if (customMarkers && customMarkers.length > 0) return customMarkers;
    if (label) {
      return DEFAULT_GLOBE_MARKERS.map((m) => (m.id === "perth" ? { ...m, label } : m));
    }
    return DEFAULT_GLOBE_MARKERS;
  }, [customMarkers, label]);

  const markersRef = React.useRef(resolvedMarkers);
  React.useEffect(() => {
    markersRef.current = resolvedMarkers;
  }, [resolvedMarkers]);

  // React 18/19 safe client hydration flag without cascading render effect
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [isDragging, setIsDragging] = React.useState(false);

  const rotLonRef = React.useRef(START_LON);
  const dragStartXRef = React.useRef(0);
  const dragStartLonRef = React.useRef(START_LON);
  // No spin until the globe has been seen; set to "now + hold" on first view
  const spinFromRef = React.useRef(Number.POSITIVE_INFINITY);
  const isHoveredRef = React.useRef(false);
  const isDraggingRef = React.useRef(false);

  React.useEffect(() => {
    if (!isClient) return;

    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();
    let hasEntered = false;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReduced = mediaQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReduced = e.matches;
    };
    mediaQuery.addEventListener("change", onMotionChange);

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Revolve slowly like the Earth (~40s per full rotation)
      if (!isDraggingRef.current && !prefersReduced && time >= spinFromRef.current) {
        // Slow down slightly on hover for easier inspection
        const speed = isHoveredRef.current ? 0.05 : 0.14;
        rotLonRef.current -= speed * dt;
      }

      const rotLon = rotLonRef.current;

      ctx.clearRect(0, 0, GLOBE_SIZE, GLOBE_SIZE);

      // 1. Outer sphere silhouette hairline
      ctx.beginPath();
      ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = COLOR_RULE;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Graticule parallels (equator and standard parallels)
      const parallels = [-60, -30, 0, 30, 60];
      for (const lat of parallels) {
        ctx.beginPath();
        ctx.strokeStyle = lat === 0 ? "rgba(201, 206, 203, 0.65)" : "rgba(201, 206, 203, 0.3)";
        ctx.lineWidth = lat === 0 ? 1.5 : 1;
        let drawing = false;

        for (let lon = -180; lon <= 180; lon += 4) {
          const phi = lat * DEG2RAD;
          const lam = lon * DEG2RAD - rotLon;
          const x = Math.cos(phi) * Math.sin(lam);
          const y = COS_TILT * Math.sin(phi) - SIN_TILT * Math.cos(phi) * Math.cos(lam);
          const z = SIN_TILT * Math.sin(phi) + COS_TILT * Math.cos(phi) * Math.cos(lam);

          if (z > 0) {
            const px = CX + x * RADIUS;
            const py = CY - y * RADIUS;
            if (!drawing) {
              ctx.moveTo(px, py);
              drawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }

      // 3. Graticule meridians every 30 degrees
      for (let m = 0; m < 360; m += 30) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(201, 206, 203, 0.3)";
        ctx.lineWidth = 1;
        let drawing = false;

        for (let lat = -80; lat <= 80; lat += 4) {
          const phi = lat * DEG2RAD;
          const lam = m * DEG2RAD - rotLon;
          const x = Math.cos(phi) * Math.sin(lam);
          const y = COS_TILT * Math.sin(phi) - SIN_TILT * Math.cos(phi) * Math.cos(lam);
          const z = SIN_TILT * Math.sin(phi) + COS_TILT * Math.cos(phi) * Math.cos(lam);

          if (z > 0) {
            const px = CX + x * RADIUS;
            const py = CY - y * RADIUS;
            if (!drawing) {
              ctx.moveTo(px, py);
              drawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }

      // 4. Dot-matrix land points (high density, ~10,400 points)
      let lastFill = "";
      for (let i = 0; i < PROCESSED_LAND_POINTS.length; i++) {
        const pt = PROCESSED_LAND_POINTS[i];
        if (!pt) continue;
        const [lat, lon, type] = pt;
        const phi = lat * DEG2RAD;
        const lam = lon * DEG2RAD - rotLon;
        const x = Math.cos(phi) * Math.sin(lam);
        const y = COS_TILT * Math.sin(phi) - SIN_TILT * Math.cos(phi) * Math.cos(lam);
        const z = SIN_TILT * Math.sin(phi) + COS_TILT * Math.cos(phi) * Math.cos(lam);

        if (z > 0) {
          const px = CX + x * RADIUS;
          const py = CY - y * RADIUS;

          // Square dots foreshortened by depth
          const size = type === 2 ? 4.8 : 2.8 + z * 1.5;
          const fill = type === 2 ? COLOR_PRIMARY : z > 0.45 ? COLOR_DOT_MID : COLOR_DOT_LIGHT;

          if (fill !== lastFill) {
            ctx.fillStyle = fill;
            lastFill = fill;
          }

          ctx.fillRect(px - size / 2, py - size / 2, size, size);
        }
      }

      // 5. Compute each pin's position on the revolving sphere
      const currentMarkers = markersRef.current;
      for (let i = 0; i < currentMarkers.length; i++) {
        const m = currentMarkers[i];
        if (!m) continue;
        const pinEl = pinMapRef.current.get(m.id);
        if (!pinEl) continue;

        const mPhi = m.lat * DEG2RAD;
        const mLam = m.lon * DEG2RAD - rotLon;
        const mx = Math.cos(mPhi) * Math.sin(mLam);
        const my = COS_TILT * Math.sin(mPhi) - SIN_TILT * Math.cos(mPhi) * Math.cos(mLam);
        const mz = SIN_TILT * Math.sin(mPhi) + COS_TILT * Math.cos(mPhi) * Math.cos(mLam);

        if (mz >= PIN_VISIBLE_MZ) {
          const screenX = CX + mx * RADIUS;
          const screenY = CY - my * RADIUS;
          const xPct = ((screenX / GLOBE_SIZE) * 100).toFixed(2);
          const yPct = ((screenY / GLOBE_SIZE) * 100).toFixed(2);

          pinEl.style.setProperty("--pin-x", `${xPct}%`);
          pinEl.style.setProperty("--pin-y", `${yPct}%`);
          pinEl.style.visibility = "visible";
        } else {
          pinEl.style.visibility = "hidden";
        }
      }

      animId = requestAnimationFrame(render);
    };

    const start = () => {
      if (animId) return;
      lastTime = performance.now();
      animId = requestAnimationFrame(render);
    };
    const stop = () => {
      cancelAnimationFrame(animId);
      animId = 0;
    };

    // Draw the still Australia frame once, then animate only while in view
    render(performance.now());
    stop();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          stop();
          return;
        }
        if (!hasEntered) {
          hasEntered = true;
          rotLonRef.current = START_LON;
          spinFromRef.current = performance.now() + START_HOLD_MS;
        }
        start();
      },
      { threshold: IN_VIEW_THRESHOLD },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      stop();
      mediaQuery.removeEventListener("change", onMotionChange);
    };
  }, [isClient]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartLonRef.current = rotLonRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    rotLonRef.current = dragStartLonRef.current - dx / (RADIUS * 0.75);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    isDraggingRef.current = false;
  };

  const labelsText = resolvedMarkers.map((m) => m.label).join(", ");

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative touch-none select-none",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      aria-label={`Interactive revolving dot-matrix globe with ${labelsText} pinned. Drag horizontally to rotate.`}
      role="img"
    >
      {/* SSR / Fallback image */}
      {!isClient && (
        <Image
          src="/dither/globe-perth.svg"
          alt={`Dot-matrix globe turned to Australia, with ${labelsText} marked.`}
          width={GLOBE_SIZE}
          height={GLOBE_SIZE}
          unoptimized
          preload
          className="h-auto w-full select-none"
        />
      )}

      {/* Dynamic 60fps Revolving Canvas */}
      <canvas
        ref={canvasRef}
        width={GLOBE_SIZE}
        height={GLOBE_SIZE}
        className={cn("h-auto w-full select-none", !isClient && "hidden")}
      />

      {/* Pinned Terminals and Labels */}
      {resolvedMarkers.map((marker) => (
        <span
          key={marker.id}
          ref={(el) => {
            if (el) {
              pinMapRef.current.set(marker.id, el);
            } else {
              pinMapRef.current.delete(marker.id);
            }
          }}
          className={cn("globe-pin", marker.leadDirection === "right" && "globe-pin--right")}
          style={getInitialMarkerStyle(marker)}
          aria-hidden="true"
        >
          <span className="globe-pin-lead" />
          <span className="globe-pin-label text-small text-ink-900 font-mono font-medium">
            {marker.label}
          </span>
        </span>
      ))}
    </div>
  );
}
