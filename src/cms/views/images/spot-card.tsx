"use client";

import * as React from "react";
import { objectPositionOf } from "../../../lib/focal";
import { cardStatus } from "../../images/cards";
import { FRAME_LABEL, FRAME_RATIO } from "../../images/frames";
import type { SpotCard } from "../../images/types";
import { previewUrl } from "../../preview-url";
import { DeleteDialog } from "./delete";
import { FocalDialog } from "./focal";
import { publishLabel } from "./logic";
import { PickerDialog } from "./picker";
import { PublishDialog } from "./publish";
import { ReplaceDialog } from "./replace";

type Which = "change" | "replace" | "focal" | "publish" | "delete" | null;

/** One image spot: the image in its real desktop frame, its status in words, and its actions. */
export function SpotCardView({ card, siblings }: { card: SpotCard; siblings: SpotCard[] }) {
  const [open, setOpen] = React.useState<Which>(null);
  const close = React.useCallback(() => setOpen(null), []);
  const image = card.image;
  const phone =
    card.phone === "hidden" ? "not shown on phones" : `phone: ${FRAME_LABEL[card.phone]}`;
  const waiting = card.pending || card.focalPending;

  return (
    <li className="dts-img__card" data-spot={card.id}>
      <div className="dts-img__frame" style={{ aspectRatio: String(FRAME_RATIO[card.desktop]) }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            style={{
              objectPosition: objectPositionOf({ focalX: image.focalX, focalY: image.focalY }),
            }}
          />
        ) : (
          <div className="dts-img__empty">
            No image{card.required ? " — the page shows a placeholder" : ""}
          </div>
        )}
      </div>
      <h3>{card.title}</h3>
      <p className="dts-img__where">{card.where}</p>
      <p className="dts-img__shape">
        Desktop: {FRAME_LABEL[card.desktop]}; {phone}
      </p>
      <ul className="dts-img__status" aria-label="Status">
        {cardStatus(card).map((status) => (
          <li key={status.text} data-tone={status.tone}>
            {status.text}
          </li>
        ))}
      </ul>
      <div className="dts-img__actions">
        <button
          type="button"
          className="dts-img__btn dts-img__btn--primary"
          onClick={() => setOpen("change")}
        >
          Change image<span className="dts-sr-only">: {card.title}</span>
        </button>
        {image && (
          <button type="button" className="dts-img__btn" onClick={() => setOpen("replace")}>
            Replace file<span className="dts-sr-only">: {card.title}</span>
          </button>
        )}
        {image && (
          <button type="button" className="dts-img__btn" onClick={() => setOpen("focal")}>
            Set focal point<span className="dts-sr-only">: {card.title}</span>
          </button>
        )}
        {waiting && card.pagePath && (
          <a
            className="dts-img__btn"
            href={previewUrl(card.pagePath)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview<span className="dts-sr-only"> {card.title} (opens in a new tab)</span>
          </a>
        )}
        {waiting && (
          <button
            type="button"
            className="dts-img__btn dts-img__btn--primary"
            onClick={() => setOpen("publish")}
          >
            {publishLabel(card)}
            <span className="dts-sr-only">: {card.title}</span>
          </button>
        )}
        <a className="dts-img__btn" href={card.adminHref}>
          Open section<span className="dts-sr-only">: {card.group}</span>
        </a>
        {image && (
          <button
            type="button"
            className="dts-img__btn dts-img__btn--danger"
            onClick={() => setOpen("delete")}
          >
            Delete image<span className="dts-sr-only">: {card.title}</span>
          </button>
        )}
      </div>
      <PickerDialog card={card} open={open === "change"} onClose={close} />
      <ReplaceDialog card={card} open={open === "replace"} onClose={close} />
      <FocalDialog card={card} siblings={siblings} open={open === "focal"} onClose={close} />
      <PublishDialog card={card} open={open === "publish"} onClose={close} />
      {image && <DeleteDialog image={image} open={open === "delete"} onClose={close} />}
    </li>
  );
}
