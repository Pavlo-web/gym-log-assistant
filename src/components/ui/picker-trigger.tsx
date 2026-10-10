import { forwardRef, type ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PickerTriggerProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "children"> {
  /** Shown at the right edge; tells date, time and other pickers apart. */
  icon: LucideIcon;
  /** Formatted value; when missing the placeholder is shown instead. */
  value: string | undefined;
  placeholder: string;
}

/**
 * The field-like button every picker opens from. Date and time pickers share
 * it so the two fields always look the same: value left, icon right.
 */
export const PickerTrigger = forwardRef<HTMLButtonElement, PickerTriggerProps>(
  function PickerTrigger({ icon: Icon, value, placeholder, className, ...props }, ref) {
    return (
      <Button
        ref={ref}
        type="button"
        variant="outline"
        className={cn(
          "tabular h-9 w-full justify-between border-input bg-field px-3 text-base font-normal aria-invalid:border-danger md:text-sm",
          !value && "text-muted-foreground",
          className,
        )}
        {...props}
      >
        <span className="min-w-0 truncate">{value ?? placeholder}</span>
        <Icon className="text-muted-foreground" aria-hidden="true" />
      </Button>
    );
  },
);
