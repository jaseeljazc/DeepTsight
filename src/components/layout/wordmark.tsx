import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type WordmarkProps = {
  onDark?: boolean;
  /** `lg` in the footer; the header, menu and 404 use the default. */
  size?: "default" | "lg";
  className?: string;
};

/* The official logo files (supplied 2026-10-11, public/brand), used unchanged. Their artboard is
   400.62 × 78.87; width and height below keep that ratio, CSS sets the rendered height. */
const LOGO_WIDTH = 401;
const LOGO_HEIGHT = 79;

/**
 * The DeepTsight logo: the colour logo with fill-primary mark on light grounds,
 * the white logo on the ink band. Inlined to avoid browser SVG image caching and
 * guarantee the mark matches the primary button token.
 */
export function Wordmark({ onDark = false, size = "default", className }: WordmarkProps) {
  if (onDark) {
    return (
      <Image
        src="/brand/deeptsight-logo-white.svg"
        alt="DeepTsight"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        unoptimized
        className={cn("w-auto select-none", size === "lg" ? "h-logo-lg" : "h-logo", className)}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400.62 78.87"
      aria-label="DeepTsight"
      role="img"
      className={cn("w-auto select-none", size === "lg" ? "h-logo-lg" : "h-logo", className)}
    >
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_1-2" data-name="Layer 1">
          <g className="fill-ink-900">
            <path d="M88.91,59.21V19.71H104c11.53,0,20,6.79,20,19.75s-8.47,19.75-20,19.75Zm6.71-5.87h8.12c7.62,0,13.49-4.06,13.49-13.92s-5.87-13.93-13.49-13.93H95.62Z" />
            <path d="M128,43.49c0-9.24,5.31-15.74,15.3-15.74,9.68,0,15.17,6.37,15.17,15.49v1.87H134.59c.62,4.88,3.24,8.37,9.18,8.37,5.18,0,7.36-2.18,7.93-4.74h6.49c-.93,6.3-5.87,10.43-14.42,10.43C133.65,59.17,128,52.8,128,43.49ZM151.57,40c-1.06-3.93-2.93-6.68-8.24-6.68S136,36.06,135,40Z" />
            <path d="M163.06,43.49c0-9.24,5.31-15.74,15.3-15.74,9.68,0,15.18,6.37,15.18,15.49v1.87H169.62c.62,4.87,3.25,8.37,9.18,8.37,5.18,0,7.37-2.18,7.93-4.74h6.49c-.93,6.3-5.87,10.42-14.42,10.42C168.68,59.16,163.06,52.79,163.06,43.49ZM186.61,40c-1.07-3.93-2.94-6.68-8.25-6.68S171,36.06,170,40Z" />
            <path d="M206,28.5v4.06c2.5-3.12,6.43-4.68,10.87-4.68,8,0,14.49,5.12,14.49,15.61s-6.44,15.67-14.49,15.67A13.64,13.64,0,0,1,206,54.42V71.28h-6.3V28.5Zm9.18,24.79c5.31,0,9.68-2.62,9.68-9.8s-4.37-9.74-9.68-9.74c-6.12,0-9.18,4.12-9.18,9.74S209,53.29,215.14,53.29Z" />
            <path d="M242.18,59.21V25.49H229.44V19.68h32.29v5.81h-12.8V59.21Z" />
            <path d="M264.54,48.36c.25,4.87,4.93,5.37,8.49,5.37,3.94,0,6.19-1.5,6.12-3.74s-3.62-3.38-7.68-4.38c-5.31-1.25-11.68-2.43-11.68-9.11,0-6.06,5.87-8.68,12.18-8.68,6.12,0,13.12,2.37,13.43,10.49h-6.25c-.18-3.69-3.49-5-7.12-5-2.68,0-5.62,1.06-5.62,3.06s2.19,2.69,6.56,3.75c5.06,1.25,13,3.18,13,9.68,0,6-5.55,9.37-13,9.37-6.3,0-14.73-1.88-14.73-10.81Z" />
            <path d="M291.46,26.79V19.73h6.93v7.06Zm.31,32.42V29.11h6.37v30.1Z" />
            <path d="M307.5,71.59V65.72h12.06c4.49,0,10.55-1,10.61-8.3V54.61c-2.49,3.06-6.49,4.56-10.8,4.56-8.12,0-14.55-5.06-14.55-15.68,0-10.43,6.43-15.67,14.49-15.67,4.37,0,8.37,1.56,10.86,4.87V28.44h6.37V57.35c0,11.18-8.8,14.24-17.05,14.24Zm22.67-28.1c0-5.56-3.24-9.8-9.11-9.8-5.37,0-9.75,2.62-9.75,9.86s4.38,9.75,9.75,9.75C327.24,53.3,330.17,49.24,330.17,43.49Z" />
            <path d="M344.22,59.17V15.08h6.37V33.19c2.68-3.5,6.56-4.81,10.62-4.81,8.86,0,12.42,6.8,12.42,14.49v16.3h-6.37V42.93c0-5.06-2.24-8.74-7.49-8.74-5,0-9.18,3.12-9.18,8.74V59.17Z" />
            <path d="M383.5,17.76h6.44v4.37c0,3.38-.13,5.94-2.56,6.87h13v5.56H389.81V50.17c0,2.5,1.13,3.19,3.06,3.19h7.75v5.81h-8.93c-4.88,0-8.19-2-8.19-8.81V34.56h-5.93V29h1.13c3.62,0,4.8-2,4.8-6.12Z" />
          </g>
          <g className="fill-primary">
            <polygon points="78.91 19.72 78.91 59.15 78.91 59.16 59.19 78.87 59.18 78.87 0 78.87 0 39.44 19.73 39.44 19.73 59.16 43.46 59.16 59.19 43.44 59.19 29.89 49.01 19.72 39.46 19.72 39.46 0 59.18 0 59.19 0 78.91 19.72 78.91 19.72" />
            <rect width="19.73" height="19.72" />
            <rect x="19.73" y="19.72" width="19.73" height="19.72" />
          </g>
        </g>
      </g>
    </svg>
  );
}
