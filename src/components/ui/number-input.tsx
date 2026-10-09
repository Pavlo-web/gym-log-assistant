import { forwardRef, type ComponentProps, type KeyboardEvent } from "react";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseDecimal, sanitizeNumberInput } from "@/lib/number";
import { cn } from "@/lib/utils";

type NumberInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "step"
> & {
  /** Raw text of the field; parsing is left to the caller so partial input survives. */
  value: string;
  onValueChange: (value: string) => void;
  step?: number;
  /**
   * Where the steppers sit on phones: "stacked" inside the field, which fits
   * narrow table cells, or "sides" as full-size − and + buttons around it.
   * Desktop always shows them stacked inside the field.
   */
  stepperLayout?: "stacked" | "sides";
};

const STEPPER_BUTTON = "h-4 w-7 rounded-sm p-0 text-muted-foreground hover:text-foreground";

/** Decimal places of the step, so stepping by 2.5 never yields 7.500000001. */
function stepPrecision(step: number): number {
  return (String(step).split(".")[1] ?? "").length;
}

/**
 * Text field for numbers with up/down steppers (buttons and arrow keys).
 * It is a text input rather than `type="number"` so a comma can be typed as
 * the decimal separator and no browser spinner or scroll-to-change appears.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value,
    onValueChange,
    min,
    max,
    step = 1,
    stepperLayout = "stacked",
    className,
    onKeyDown,
    disabled,
    ...props
  },
  ref,
) {
  const minimum = min === undefined ? -Infinity : Number(min);
  const maximum = max === undefined ? Infinity : Number(max);
  const current = parseDecimal(value);
  const label = props["aria-label"] ?? "value";
  const allowDecimal = !Number.isInteger(step);

  function stepBy(direction: 1 | -1) {
    // An empty or unreadable field starts from the minimum (or zero when unbounded).
    const fallback = Number.isFinite(minimum) ? minimum : 0;
    const base = Number.isFinite(current) ? current : fallback;
    const next = Number((base + direction * step).toFixed(stepPrecision(step)));
    onValueChange(String(Math.min(maximum, Math.max(minimum, next))));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(event.key === "ArrowUp" ? 1 : -1);
    }
    onKeyDown?.(event);
  }

  return (
    <div
      className={cn(
        "number-input group relative w-full min-w-0",
        stepperLayout === "sides" && "number-input-sides",
      )}
    >
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={value}
        disabled={disabled}
        // Letters, signs and extra separators never make it into the field.
        onChange={(event) => onValueChange(sanitizeNumberInput(event.target.value, allowDecimal))}
        onKeyDown={handleKeyDown}
        className={cn("tabular pr-9", className)}
      />
      <div className="number-steppers absolute inset-y-0 right-1 flex flex-col justify-center opacity-50 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          disabled={disabled || current >= maximum}
          aria-label={`Increase ${label}`}
          onClick={() => stepBy(1)}
          className={STEPPER_BUTTON}
        >
          <ChevronUp className="stepper-chevron size-3" />
          <Plus className="stepper-sign hidden" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          disabled={disabled || current <= minimum}
          aria-label={`Decrease ${label}`}
          onClick={() => stepBy(-1)}
          className={STEPPER_BUTTON}
        >
          <ChevronDown className="stepper-chevron size-3" />
          <Minus className="stepper-sign hidden" />
        </Button>
      </div>
    </div>
  );
});
