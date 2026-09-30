import * as React from "react";
import { cn } from "@/lib/utils";

export type ProseProps = React.HTMLAttributes<HTMLDivElement>;

/** Long-form reading styles for legal pages and, later, insights articles. */
export function Prose({ className, children, ...props }: ProseProps) {
  return (
    <div
      className={cn(
        "text-ink-700 measure text-body",
        "[&_h2]:font-display [&_h2]:text-ink-900 [&_h2]:text-h2 [&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:font-medium",
        "[&_h3]:text-ink-900 [&_h3]:text-h3 [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:font-medium",
        "[&_p]:mb-6",
        "[&_ul]:list-square [&_ul]:mb-6 [&_ul]:space-y-2 [&_ul]:pl-6",
        "[&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
        "[&_blockquote]:font-display [&_blockquote]:text-ink-900 [&_blockquote]:border-ink-900 [&_blockquote]:text-h3 [&_blockquote]:my-10 [&_blockquote]:border-l [&_blockquote]:pl-6",
        "[&_hr]:border-rule [&_hr]:my-12",
        "[&_strong]:text-ink-900 [&_strong]:font-medium",
        "[&_a]:link-rule [&_a]:text-ink-900",
        "[&_code]:bg-panel [&_code]:rounded-control [&_code]:border-rule [&_code]:text-inline-mono [&_code]:border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
