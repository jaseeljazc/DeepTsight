import * as React from "react";
import NextLink from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

/*
 * Standalone text links carry the 44px target themselves (A11Y-09). `inline` is for links
 * inside running text, which take the line height of the paragraph instead.
 * The button variants are resolved through buttonVariants so they share its sizes.
 */
const linkVariants = cva("", {
  variants: {
    variant: {
      default: "link-rule inline-flex min-h-target items-center font-medium text-ink-900",
      inline: "link-rule font-medium text-ink-900",
      subtle: "link-rule inline-flex min-h-target items-center text-steel-600 hover:text-ink-900",
      onDark: "link-rule text-on-dark decoration-on-dark-muted",
      /* Primary navigation. The underline is drawn for aria-current="page" and on hover. */
      nav: "relative inline-flex min-h-target items-center px-3 text-small text-ink-700 transition-colors hover:text-ink-900 after:absolute after:inset-x-3 after:bottom-2 after:h-rule-active after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100 current-page:font-medium current-page:text-ink-900 current-page:after:scale-x-100",
      footer:
        "link-rule inline-flex min-h-target items-center text-small text-on-dark-muted decoration-transparent hover:text-on-dark",
      buttonPrimary: "",
      buttonPrimaryOnDark: "",
      buttonSecondary: "",
      buttonSecondaryDark: "",
    },
    /** Only affects the button variants. */
    size: {
      default: "",
      compact: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const buttonVariantFor = {
  buttonPrimary: "primary",
  buttonPrimaryOnDark: "primaryOnDark",
  buttonSecondary: "secondary",
  buttonSecondaryDark: "secondaryDark",
} as const;

type LinkVariantProps = VariantProps<typeof linkVariants>;

function linkClass({ variant, size }: LinkVariantProps): string {
  if (variant && variant in buttonVariantFor) {
    return buttonVariants({
      variant: buttonVariantFor[variant as keyof typeof buttonVariantFor],
      size,
    });
  }
  return linkVariants({ variant });
}

export type LinkProps = React.ComponentPropsWithoutRef<typeof NextLink> &
  LinkVariantProps & {
    isExternal?: boolean;
    /** Appends a line arrow that nudges on hover. Used on primary actions only. */
    withArrow?: boolean;
  };

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, href, isExternal, withArrow = false, children, ...props }, ref) => {
    const isActuallyExternal =
      isExternal ||
      (typeof href === "string" && (href.startsWith("http://") || href.startsWith("https://")));

    const classes = cn(linkClass({ variant, size }), className);

    const content = (
      <>
        {children}
        {withArrow && (
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/button:translate-x-1"
            aria-hidden="true"
          />
        )}
      </>
    );

    if (isActuallyExternal) {
      return (
        <a
          ref={ref}
          href={typeof href === "string" ? href : (href.href ?? "")}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...props}
        >
          {content}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }

    return (
      <NextLink ref={ref} href={href} className={classes} {...props}>
        {content}
      </NextLink>
    );
  },
);

Link.displayName = "Link";
