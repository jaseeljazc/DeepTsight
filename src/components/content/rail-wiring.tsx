import * as React from "react";

/**
 * Four cores drop from the four service terminals, run to one junction and land on a common
 * terminal, drawn like the wiring on a marshalling rail. The cores draw in turn as the diagram
 * scrolls into view. It only illustrates the line of copy beside it ("one accountable
 * practitioner"), so it is hidden from assistive technology and from screens too narrow for
 * the four columns it lines up with.
 */
export function RailWiring() {
  return (
    <div aria-hidden="true" className="rail-wiring hidden xl:block">
      <svg viewBox="0 0 1000 110" focusable="false" className="block h-auto w-full">
        <path className="rail-wire rail-wire-1" pathLength={1} d="M125 0 V56 H500" />
        <path className="rail-wire rail-wire-2" pathLength={1} d="M375 0 V56 H500" />
        <path className="rail-wire rail-wire-3" pathLength={1} d="M625 0 V56 H500" />
        <path className="rail-wire rail-wire-4" pathLength={1} d="M875 0 V56 H500" />
        <path className="rail-wire rail-wire-trunk" pathLength={1} d="M500 56 V110" />
        <rect className="rail-wire-node" x="121" y="0" width="8" height="8" />
        <rect className="rail-wire-node" x="371" y="0" width="8" height="8" />
        <rect className="rail-wire-node" x="621" y="0" width="8" height="8" />
        <rect className="rail-wire-node" x="871" y="0" width="8" height="8" />
        <rect className="rail-wire-node rail-wire-junction" x="496" y="52" width="8" height="8" />
      </svg>
    </div>
  );
}
