import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { fontSizeTokens } from "@/styles/tokens.generated";

// The type scale lives in globals.css (@theme --text-*) and is generated into fontSizeTokens.
// Without registering it, tailwind-merge reads "text-h2" as a colour and drops it when a colour
// class such as "text-ink-900" follows.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...fontSizeTokens] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Lower-cases the first letter for use mid-sentence, unless it starts an acronym ("OT", "IT/OT"). */
export function lowerFirst(text: string): string {
  return /^[A-Z]{2}/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

/** True when `href` is the current page or one of its ancestors. The home link matches only "/". */
export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
