import * as React from "react";
import { cn } from "@/lib/utils";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Leaves room on the left for the rail (Home). Pair with a RailTag above it. */
  rail?: boolean;
};

/** 1280px content width on a 12-column grid, 20px side margins on phones. */
export function Container({ className, rail = false, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "max-w-page mx-auto w-full pr-5 sm:pr-8",
        rail ? "pl-rail" : "pl-5 sm:pl-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
