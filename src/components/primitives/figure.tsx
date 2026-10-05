import * as React from "react";
import Image from "next/image";
import type { FigureData } from "@/content/types";
import { objectPositionOf } from "@/lib/focal";
import { cn } from "@/lib/utils";

export type FigureAspect = "banner" | "wide" | "landscape" | "classic" | "portrait" | "square";

const aspectClasses: Record<FigureAspect, string> = {
  // A slim 3:1 band for the Home hero, so the copy and the first schedule share the viewport.
  banner: "aspect-classic md:aspect-banner",
  // 21:9 reads as a letterbox on phones, so it relaxes to 4:3 below md.
  wide: "aspect-classic md:aspect-wide",
  landscape: "aspect-landscape",
  classic: "aspect-classic",
  portrait: "aspect-portrait",
  square: "aspect-square",
};

export type FigureProps = {
  figure: FigureData | undefined;
  aspect?: FigureAspect;
  /** Slow scroll-linked drift inside the frame. Large images only. */
  parallax?: boolean;
  /** Wipes the image in from the top as it enters the viewport. Never on above-the-fold images. */
  reveal?: boolean;
  /** Preloads the image. Only the first above-the-fold figure on a page (PERF-10). */
  preload?: boolean;
  sizes?: string;
  onDark?: boolean;
  /** Keeps the caption aligned to the page container when the frame bleeds edge to edge. */
  captionClassName?: string;
  className?: string;
};

/**
 * An image or a reserved image slot, always with a numbered caption in the manner of an
 * engineering report ("Fig. 02 — ..."). Numbers come from a CSS counter on <main>.
 */
export function Figure({
  figure,
  aspect = "landscape",
  parallax = false,
  reveal = false,
  preload = false,
  sizes = "(max-width: 768px) 100vw, 60vw",
  onDark = false,
  captionClassName,
  className,
}: FigureProps) {
  if (!figure) return null;

  const isSlot = figure.kind === "slot";
  const isMock = figure.kind === "image" && !figure.approvedForPublic;

  return (
    <figure className={cn("figure-numbered", className)}>
      <div
        className={cn(
          "relative overflow-hidden",
          onDark ? "bg-ink-800" : "bg-ground-deep",
          aspectClasses[aspect],
          parallax && "parallax-frame",
          reveal && "figure-reveal",
        )}
      >
        {figure.kind === "image" ? (
          <div className={parallax ? "parallax-layer" : "absolute inset-0"}>
            <Image
              src={figure.src}
              alt={figure.alt}
              fill
              preload={preload}
              sizes={sizes}
              className="photo-grade object-cover"
              style={{ objectPosition: objectPositionOf(figure) }}
            />
          </div>
        ) : (
          <SlotFrame subject={figure.subject} promptRef={figure.promptRef} onDark={onDark} />
        )}
      </div>

      <figcaption
        className={cn(
          "text-caption mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono",
          onDark ? "text-on-dark-muted" : "text-steel-600",
          captionClassName,
        )}
      >
        <span className={cn("figure-number shrink-0", onDark ? "text-on-dark" : "text-ink-900")} />
        <span>{figure.caption}</span>
        {isMock && (
          <span className="rounded-control border border-dashed border-current px-1">
            [PLACEHOLDER] mock image, replace before launch
          </span>
        )}
        {isSlot && (
          <span className="rounded-control border border-dashed border-current px-1">
            [PLACEHOLDER] photograph required
          </span>
        )}
      </figcaption>
    </figure>
  );
}

type SlotFrameProps = {
  subject: string;
  promptRef: string;
  onDark: boolean;
};

function SlotFrame({ subject, promptRef, onDark }: SlotFrameProps) {
  return (
    <div
      role="img"
      aria-label={`Image placeholder: ${subject}`}
      className={cn(
        "absolute inset-3 flex flex-col justify-between border border-dashed p-4 sm:inset-4 sm:p-6",
        onDark ? "border-on-dark-muted text-on-dark" : "border-control text-ink-700",
      )}
    >
      <span className="tag-plate self-start">[PLACEHOLDER] image</span>
      <span className="text-small sm:text-lead max-w-prose-sm font-sans">{subject}</span>
      <span className="text-caption font-mono opacity-80">Brief: {promptRef}</span>
    </div>
  );
}
