import * as React from "react";
import { cn } from "@/lib/utils";
import { BrandIllustration } from "./brand-illustration";

export type SeeConnectDeliverProps = {
  pillars: { title: string; description: string }[];
  className?: string;
};

/**
 * The client's See / Connect / Deliver illustration, one panel above each line. The illustration
 * is a single file, so each panel is the same file cropped to its third (`pillar-art`), which
 * lets the grid gap, not the artwork, set the space between them. The panels already carry the
 * three words, so from md the headings are for assistive technology only; on a phone the panels
 * stack and the headings show.
 */
export function SeeConnectDeliver({ pillars, className }: SeeConnectDeliverProps) {
  return (
    <div className={cn("border-rule border-t pt-10", className)}>
      <ul className="max-w-illustration mx-auto grid grid-cols-1 gap-x-34 gap-y-12 md:grid-cols-3">
        {pillars.map((pillar, index) => (
          <li key={pillar.title} className="md:text-center">
            <div data-pillar={index} className="pillar-art max-w-pillar mx-auto w-full">
              <BrandIllustration
                name="see-connect-deliver"
                alt=""
                sizes="(max-width: 768px) 36rem, 30rem"
              />
            </div>
            <h3 className="font-display text-h3 text-ink-900 mt-4 font-medium md:sr-only">
              {pillar.title}
            </h3>
            <p className="text-ink-700 text-body mt-1 md:mt-4">{pillar.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
