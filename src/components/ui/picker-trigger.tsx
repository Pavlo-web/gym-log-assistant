import { forwardRef, type ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PickerTriggerProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "children"> {
  icon: LucideIcon;
  value: string | undefined;
  placeholder: string;
}

// Shared by the date and time pickers so the two fields always look the same.
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
