import type { HTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const PADDING = {
  /** Regular card. */
  default: "p-3 md:p-5",
  /** One-line notice or banner. */
  compact: "px-4 py-3",
  /** The content brings its own padding, e.g. a full-width table. */
  flush: "",
} as const;

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section";
  /** Style the single child instead of adding an element, e.g. a `form` or a `Link`. */
  asChild?: boolean;
  padding?: keyof typeof PADDING;
  /** For cards that are clickable as a whole. */
  interactive?: boolean;
}

/**
 * The card of the app: every bordered block on a page is a Surface, so radius,
 * border, background and padding are defined once.
 */
export function Surface({
  as = "div",
  asChild = false,
  padding = "default",
  interactive = false,
  className,
  ...props
}: SurfaceProps) {
  const Component = asChild ? Slot : as;
  return (
    <Component
      className={cn(
        "min-w-0 rounded-lg border border-border bg-card",
        PADDING[padding],
        interactive && "block transition-colors hover:border-input hover:bg-hover/40",
        className,
      )}
      {...props}
    />
  );
}
