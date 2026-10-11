import * as React from "react";
import { cn } from "@/lib/utils";
import { BrandIllustration } from "./brand-illustration";

export type SeeConnectDeliverProps = {
  pillars: { title: string; description: string }[];
  className?: string;
};

/**
 * The client's See / Connect / Deliver illustration, with each line set under the panel it belongs
 * to. The panels already carry the three words, so from md the headings are for assistive
 * technology only; on a phone the lines stack and the headings show.
 */
export function SeeConnectDeliver({ pillars, className }: SeeConnectDeliverProps) {
  return (
    <div className={cn("border-rule border-t pt-10", className)}>
      <BrandIllustration
        name="see-connect-deliver"
        alt=""
        sizes="(max-width: 1024px) 100vw, 64rem"
        className="max-w-illustration mx-auto"
      />
      <ul className="max-w-illustration mx-auto mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        {pillars.map((pillar) => (
          <li key={pillar.title} className="md:text-center">
            <h3 className="font-display text-h3 text-ink-900 font-medium md:sr-only">
              {pillar.title}
            </h3>
            <p className="text-ink-700 text-body mt-1 md:mt-0">{pillar.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
