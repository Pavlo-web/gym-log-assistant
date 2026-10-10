import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ChipGroupProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  className?: string;
}

/**
 * Pick one of a few options, e.g. a filter or a chart metric. The selected chip
 * is tinted, not filled, so it never competes with the page's primary button.
 */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  "aria-label": label,
  className,
}: ChipGroupProps<T>) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={value}
      onValueChange={(next) => {
        // Radix sends an empty string when the selected chip is clicked again.
        const option = options.find((item) => item.value === next);
        if (option) onChange(option.value);
      }}
      aria-label={label}
      className={cn("justify-start gap-2", className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="mobile-control shrink-0 px-3"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
