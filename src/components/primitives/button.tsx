import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Shared by Button and the button-styled Link variants.
 * Primary is the brand blue. An ink bar draws along its base on hover and focus,
 * like an indicator strip on a control panel push-button.
 *
 * `size` is declared before `variant` so a variant that sets its own height or padding
 * (tertiary) wins when the classes are merged.
 */
export const buttonVariants = cva(
  "group/button relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-control font-sans font-medium transition-colors duration-150 ease-standard disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        default: "min-h-control px-6 text-field",
        /** Header and menu controls: 44px target, tighter padding. */
        compact: "min-h-target gap-2 px-3 text-small",
      },
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-primary-deep after:absolute after:inset-x-0 after:bottom-0 after:h-rule-bar after:origin-left after:scale-x-0 after:bg-ink-900 after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100 disabled:bg-control disabled:after:hidden",
        primaryOnDark: "bg-primary-on-dark text-ink-900 hover:bg-on-dark disabled:bg-on-dark-muted",
        secondary:
          "border border-ink-900 bg-transparent text-ink-900 hover:border-primary hover:bg-primary hover:text-on-primary disabled:border-control disabled:text-steel-600",
        secondaryDark:
          "border border-on-dark-muted bg-transparent text-on-dark hover:border-primary-on-dark hover:bg-ink-800 disabled:text-on-dark-muted",
        tertiary: "link-rule min-h-target px-0 text-ink-900",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "primary",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    loadingText?: string;
    onDark?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      disabled,
      children,
      onDark = false,
      ...props
    },
    ref,
  ) => {
    const computedVariant = variant === "secondary" && onDark ? "secondaryDark" : variant;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(buttonVariants({ variant: computedVariant, size, fullWidth }), className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" aria-hidden="true" />}
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  },
);

Button.displayName = "Button";
