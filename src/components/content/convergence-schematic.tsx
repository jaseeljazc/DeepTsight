import * as React from "react";
import { cn } from "@/lib/utils";

export type ConvergenceSchematicProps = {
  disciplines: string[];
  label: string;
  className?: string;
};

/**
 * Four discipline lines crossing one vertical line, drawn like a single-line diagram with
 * terminal markers at each junction. The lines draw across as the diagram scrolls into view.
 * The same meaning is stated in the surrounding copy, so the drawing itself is a figure with
 * a text alternative.
 */
export function ConvergenceSchematic({ disciplines, label, className }: ConvergenceSchematicProps) {
  const description = `${disciplines.join(", ")}: all four pass through ${label.toLowerCase()}.`;

  return (
    <figure
      role="img"
      aria-label={description}
      className={cn("schematic relative select-none", className)}
    >
      <div aria-hidden="true" className="relative">
        {/* The vertical line: the practitioner every discipline passes through */}
        <div className="schematic-trunk bg-ink-900 absolute top-0 bottom-0" />
        <p className="schematic-label text-ink-900 text-small relative mb-4 pr-3 text-right font-medium">
          {label}
        </p>
        <ul className="space-y-7 pb-6">
          {disciplines.map((discipline) => (
            <li key={discipline} className="relative">
              <span className="text-ink-700 text-small block pb-2">{discipline}</span>
              <span className="schematic-line bg-control block h-px w-full origin-left" />
              <span className="marker-square schematic-junction bg-primary size-marker absolute" />
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
