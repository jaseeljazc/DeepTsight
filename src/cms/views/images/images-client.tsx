"use client";

import * as React from "react";
import type { ImagesPageData } from "../../images/types";

export function ImagesClient({ data }: { data: ImagesPageData }) {
  return <p>{data.cards.length} image spots.</p>;
}
