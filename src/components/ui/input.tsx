import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  /** "lg" is for a page's headline field, such as the calculator inputs. */
  fieldSize?: "default" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, fieldSize = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "mobile-control flex w-full min-w-0 rounded-md border border-input bg-field px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger",
          fieldSize === "lg" ? "h-11 text-lg" : "h-9 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
