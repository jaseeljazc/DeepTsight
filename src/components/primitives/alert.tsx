import * as React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "success" | "warning" | "danger" | "info";

export type AlertProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  variant?: AlertVariant;
  /** `strong` draws a 2px error border, for the error summary above a form. */
  tone?: "default" | "strong";
  title?: React.ReactNode;
  /** Element for the title. Use a heading when the alert heads a region, such as an error summary. */
  titleAs?: "p" | "h2" | "h3";
  /** id for the title, so the alert can point aria-labelledby at it. */
  titleId?: string;
  children?: React.ReactNode;
};

const variantConfig = {
  success: { icon: CheckCircle2, iconClass: "text-status" },
  warning: { icon: AlertTriangle, iconClass: "text-ink-900" },
  danger: { icon: AlertCircle, iconClass: "text-error" },
  info: { icon: Info, iconClass: "text-ink-700" },
};

/** State is carried by the icon and the title text, never by colour alone (A11Y-14). */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = "info",
      tone = "default",
      title,
      titleAs: Title = "p",
      titleId,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const config = variantConfig[variant];
    const IconComponent = config.icon;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "rounded-panel text-ink-900 text-body flex gap-3 bg-white p-4",
          tone === "strong" ? "border-error border-2" : "border-ink-900 border",
          className,
        )}
        {...props}
      >
        <IconComponent
          className={cn("mt-1 h-4 w-4 shrink-0", config.iconClass)}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          {title && (
            <Title id={titleId} className="text-ink-900 text-body font-medium">
              {title}
            </Title>
          )}
          {children && <div className="text-ink-700 text-small">{children}</div>}
        </div>
      </div>
    );
  },
);

Alert.displayName = "Alert";
