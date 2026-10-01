"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { GLOBE_LAND_POINTS, PERTH_COORDS } from "./globe-data.generated";

export type DotGlobeProps = {
  /** Visible pin label. */
  label: string;
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
const COLOR_PRIMARY = "#0E50ED";
const COLOR_DOT_MID = "#4F7EFF";
const COLOR_DOT_LIGHT = "#A4BEFF";
const COLOR_RULE = "#C9CECB";

const emptySubscribe = () => () => {};

/**
 * Revolving dot-matrix globe matching the hero power plant's telemetry aesthetic.
 * Renders an orthographic sphere of precomputed land dots on HTML5 canvas at 60fps,
 * revolving smoothly around its polar axis with Perth pinned as a terminal marker.
 *
 * Supports drag-to-inspect and honors prefers-reduced-motion.
 */
export function DotGlobe({ label, className }: DotGlobeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pinRef = React.useRef<HTMLSpanElement | null>(null);

  // React 18/19 safe client hydration flag without cascading render effect
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [isDragging, setIsDragging] = React.useState(false);

  // Start with Australia and Perth front and center (124 degrees longitude)
  const rotLonRef = React.useRef(124 * DEG2RAD);
  const dragStartXRef = React.useRef(0);
  const dragStartLonRef = React.useRef(124 * DEG2RAD);
  const isHoveredRef = React.useRef(false);
  const isDraggingRef = React.useRef(false);

  React.useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

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
      if (!isDraggingRef.current && !prefersReduced) {
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
      for (let i = 0; i < GLOBE_LAND_POINTS.length; i++) {
        const pt = GLOBE_LAND_POINTS[i];
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

      // 5. Compute Perth's position on the revolving sphere
      const pPhi = PERTH_COORDS.lat * DEG2RAD;
      const pLam = PERTH_COORDS.lon * DEG2RAD - rotLon;
      const px = Math.cos(pPhi) * Math.sin(pLam);
      const py = COS_TILT * Math.sin(pPhi) - SIN_TILT * Math.cos(pPhi) * Math.cos(pLam);
      const pz = SIN_TILT * Math.sin(pPhi) + COS_TILT * Math.cos(pPhi) * Math.cos(pLam);

      if (pinRef.current) {
        if (pz > 0) {
          const screenX = CX + px * RADIUS;
          const screenY = CY - py * RADIUS;
          const opacity = pz < 0.18 ? Math.max(0, pz / 0.18) : 1;
          const xPct = ((screenX / GLOBE_SIZE) * 100).toFixed(2);
          const yPct = ((screenY / GLOBE_SIZE) * 100).toFixed(2);

          pinRef.current.style.setProperty("--pin-x", `${xPct}%`);
          pinRef.current.style.setProperty("--pin-y", `${yPct}%`);
          pinRef.current.style.opacity = `${opacity}`;
          pinRef.current.style.visibility = opacity > 0.05 ? "visible" : "hidden";
        } else {
          pinRef.current.style.opacity = "0";
          pinRef.current.style.visibility = "hidden";
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
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

  const initialPinStyle = {
    "--pin-x": "44.14%",
    "--pin-y": "56.08%",
    opacity: 1,
    visibility: "visible",
    transition: isDragging ? "none" : "opacity 0.15s ease-out",
  } as React.CSSProperties;

  return (
    <div
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
      aria-label="Interactive revolving dot-matrix globe with Perth pinned. Drag horizontally to rotate."
      role="img"
    >
      {/* SSR / Fallback image */}
      {!isClient && (
        <Image
          src="/dither/globe-perth.svg"
          alt="Dot-matrix globe turned to Australia, with Perth marked on the west coast."
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

      {/* Pinned Perth Terminal and Label */}
      <span ref={pinRef} className="globe-pin" style={initialPinStyle} aria-hidden="true">
        <span className="globe-pin-lead" />
        <span className="globe-pin-label text-small text-ink-900 font-mono font-medium">
          {label}
        </span>
      </span>
    </div>
  );
}
