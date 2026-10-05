"use client";

import * as React from "react";
import { objectPositionOf } from "../../../lib/focal";
import { saveFocalPoint } from "../../images/actions";
import { FRAME_LABEL, FRAME_RATIO } from "../../images/frames";
import type { ImageView, SpotCard } from "../../images/types";
import { Dialog, ErrorText, useDialogLock } from "./dialog";
import { nudgePoint, pointFromPointer, setAxis, type Point } from "./logic";
import { useRun } from "./use-run";

/** Set focal point: click the picture, use the arrow keys, or the two sliders. */
export function FocalDialog({
  card,
  siblings,
  open,
  onClose,
}: {
  card: SpotCard;
  /** Every card that uses the same image, including this one, for the previews. */
  siblings: SpotCard[];
  open: boolean;
  onClose: () => void;
}) {
  const image = card.image;
  if (!image) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Focal point: ${card.title}`}>
      <FocalBody image={image} siblings={siblings} onClose={onClose} />
    </Dialog>
  );
}

/** Mounted only while the dialog is open, so each opening starts from the saved point. */
function FocalBody({
  image,
  siblings,
  onClose,
}: {
  image: ImageView;
  siblings: SpotCard[];
  onClose: () => void;
}) {
  const { run, busy, error } = useRun();
  useDialogLock(busy);
  const errorId = React.useId();
  const helpId = React.useId();
  const [point, setPoint] = React.useState<Point>({ x: image.focalX, y: image.focalY });
  const imageId = image.id;

  function pick(event: React.PointerEvent<HTMLButtonElement>) {
    setPoint(
      pointFromPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect()),
    );
  }

  function nudge(event: React.KeyboardEvent<HTMLButtonElement>) {
    const next = nudgePoint(point, event.key, event.shiftKey);
    if (!next) return;
    event.preventDefault();
    setPoint(next);
  }

  const across = Math.round(point.x);
  const down = Math.round(point.y);
  const position = objectPositionOf({ focalX: point.x, focalY: point.y });

  return (
    <>
      <p id={helpId}>
        Click the most important part of the picture, or use the arrow keys on it (hold Shift for
        bigger steps), or the sliders below. Every frame on the site keeps that point in view.
      </p>
      <button
        type="button"
        className="dts-img__focal"
        onPointerDown={pick}
        onKeyDown={nudge}
        aria-label={`Focal point at ${across} percent across and ${down} percent down`}
        aria-describedby={helpId}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt="" />
        <span className="dts-img__focal-dot" style={{ left: `${point.x}%`, top: `${point.y}%` }} />
      </button>
      <div className="dts-img__ranges">
        <label className="dts-img__range">
          <span>Across: {across}%</span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={point.x}
            aria-valuetext={`${across} percent across`}
            onChange={(event) => setPoint((p) => setAxis(p, "x", event.target.valueAsNumber))}
          />
        </label>
        <label className="dts-img__range">
          <span>Down: {down}%</span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={point.y}
            aria-valuetext={`${down} percent down`}
            onChange={(event) => setPoint((p) => setAxis(p, "y", event.target.valueAsNumber))}
          />
        </label>
      </div>
      <ul className="dts-img__previews" aria-label="How each frame crops the picture">
        {siblings.flatMap((spot) =>
          (["desktop", "phone"] as const).flatMap((view) => {
            const shape = view === "desktop" ? spot.desktop : spot.phone;
            if (shape === "hidden") return [];
            return [
              <li key={`${spot.id}-${view}`}>
                <div className="dts-img__frame" style={{ aspectRatio: String(FRAME_RATIO[shape]) }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt="" style={{ objectPosition: position }} />
                </div>
                <p className="dts-img__shape">
                  {spot.group} → {spot.title}, {view}: {FRAME_LABEL[shape]}
                </p>
              </li>,
            ];
          }),
        )}
      </ul>
      <ErrorText id={errorId} message={error} />
      <div className="dts-img__dialog-actions">
        <button type="button" className="dts-img__btn" disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          disabled={busy}
          aria-describedby={error ? errorId : undefined}
          onClick={async () => {
            const result = await run(() => saveFocalPoint(imageId, point.x, point.y));
            if (result.ok) onClose();
          }}
        >
          Save focal point (as draft)
        </button>
      </div>
    </>
  );
}
