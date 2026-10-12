import * as React from "react";
import { MarkedText } from "@/components/primitives/placeholder";
import type { HomeContent } from "@/content/types";
import { cn } from "@/lib/utils";
import { BrandIllustration } from "./brand-illustration";
import { sectorIllustrations } from "./illustrations";

export type SectorTilesProps = {
  sectors: HomeContent["perthContext"]["sectors"];
  className?: string;
};

/**
 * The sectors as a ruled grid of tiles, each with the client's illustration of that industry above
 * its name. The name says everything, so the illustration is decorative (alt=""). A sector without
 * an illustration is a name-only tile.
 */
export function SectorTiles({ sectors, className }: SectorTilesProps) {
  return (
    <ul
      aria-label="Sectors"
      className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7", className)}
    >
      {sectors.map((sector) => (
        <li
          key={sector.name}
          className="bg-panel border-rule rounded-panel flex flex-col justify-end border p-3"
        >
          {sector.illustration && (
            <BrandIllustration
              name={sectorIllustrations[sector.illustration]}
              alt=""
              sizes="(max-width: 640px) 45vw, (max-width: 1280px) 22vw, 10rem"
              className="mb-3"
            />
          )}
          <p className="text-small text-ink-900 font-medium">
            <MarkedText text={sector.name} />
          </p>
        </li>
      ))}
    </ul>
  );
}
