import * as React from "react";
import { cn } from "@/lib/utils";

export type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  columns?: 1 | 2 | 3 | 4 | 12;
};

export function Grid({ columns = 12, className, children, ...props }: GridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    12: "grid-cols-4 md:grid-cols-12",
  };

  return (
    <div className={cn("grid gap-x-8 gap-y-10", colClasses[columns], className)} {...props}>
      {children}
    </div>
  );
}
