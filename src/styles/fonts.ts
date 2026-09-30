import localFont from "next/font/local";

// Five self-hosted files in total (PERF-09): Archivo 500/600, Plex Sans 400/500, Plex Mono 400.

export const fontArchivo = localFont({
  src: [
    {
      path: "../../public/fonts/archivo-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/archivo-600.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-archivo",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const fontPlexSans = localFont({
  src: [
    {
      path: "../../public/fonts/ibm-plex-sans-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex-sans-500.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-plex-sans",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const fontPlexMono = localFont({
  src: [
    {
      path: "../../public/fonts/ibm-plex-mono-400.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Consolas", "Menlo"],
});
