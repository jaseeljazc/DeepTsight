import type { IllustrationName as SectorIllustrationName } from "@/content/types";

/*
 * The client's brand illustrations (supplied 2026-10-11 in microicons-svg/, copied to
 * public/illustrations/). Each is one colour: the primary (#005BAA), or white for the ink band.
 * Shapes are the client's and are never redrawn. Sizes are each file's viewBox (see-connect-deliver's
 * is cropped to its drawn area, shapes untouched).
 */
export const illustrations = {
  "sector-oil-gas-upstream": { file: "sector-oil-gas-upstream.svg", width: 2048, height: 2048 },
  "sector-oil-gas-downstream": { file: "sector-oil-gas-downstream.svg", width: 2048, height: 2048 },
  "sector-mining": { file: "sector-mining.svg", width: 2048, height: 2048 },
  "sector-water": { file: "sector-water.svg", width: 2048, height: 2048 },
  "sector-power": { file: "sector-power.svg", width: 1024, height: 1024 },
  "sector-remote-operations": { file: "sector-remote-operations.svg", width: 1024, height: 1024 },
  "see-connect-deliver": { file: "see-connect-deliver.svg", width: 2552, height: 981 },
  "transformation-wave": { file: "transformation-wave.svg", width: 1678, height: 937 },
  "transformation-wave-on-dark": {
    file: "transformation-wave-on-dark.svg",
    width: 1678,
    height: 937,
  },
  "ot-zones-and-conduits": { file: "ot-zones-and-conduits.svg", width: 1678, height: 937 },
  "industrial-operations": { file: "industrial-operations.svg", width: 1024, height: 572 },
} as const satisfies Record<string, { file: string; width: number; height: number }>;

export type IllustrationKey = keyof typeof illustrations;

/** Every sector illustration the content contract allows has a file here. */
export const sectorIllustrations: Record<SectorIllustrationName, IllustrationKey> = {
  "sector-oil-gas-upstream": "sector-oil-gas-upstream",
  "sector-oil-gas-downstream": "sector-oil-gas-downstream",
  "sector-mining": "sector-mining",
  "sector-water": "sector-water",
  "sector-power": "sector-power",
  "sector-remote-operations": "sector-remote-operations",
};

/**
 * One illustration per service page, chosen for what it shows. Keyed by slug; a service without
 * an entry has none.
 */
export const serviceIllustrations: Record<string, { key: IllustrationKey; alt: string }> = {
  "control-systems-engineering": {
    key: "transformation-wave",
    alt: "Illustration: control hardware, PLC logic and ladder diagrams flowing towards secure, connected power delivery.",
  },
  "electrical-instrumentation": {
    key: "industrial-operations",
    alt: "Illustration: an industrial site where pipes, valves, instruments and gauges connect a water plant, a mine, a depot and a control building.",
  },
  "ot-governance-asset-resilience": {
    key: "sector-remote-operations",
    alt: "Illustration: two operators at a remote operations centre watching dashboards for distant sites, linked by radio and satellite.",
  },
  "ot-cybersecurity-iec-62443": {
    key: "ot-zones-and-conduits",
    alt: "Illustration: plant assets connected through a field zone, control zone, operations zone and DMZ to a cloud, with ISA/IEC 62443 zones and conduits, risk assessment, secure design, monitoring and detection, identity and access control, policies and threat management.",
  },
};
