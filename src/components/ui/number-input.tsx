import { forwardRef, type KeyboardEvent } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange" | "step"> & {
  value: string;
  onValueChange: (value: string) => void;
  step?: number;
};

export const NumberInput = forwardRef<HTMLInputElement, Props>(function NumberInput(
  { value, onValueChange, min, max, step = 1, className, onKeyDown, disabled, ...props },
  ref,
) {
  const minimum = min === undefined ? -Infinity : Number(min);
  const maximum = max === undefined ? Infinity : Number(max);
  function increment(direction: number) {
    const current = Number(value.replace(",", "."));
    const base =
      value.trim() && Number.isFinite(current) ? current : Number.isFinite(minimum) ? minimum : 0;
    const precision = Math.max(0, (String(step).split(".")[1] ?? "").length);
    onValueChange(
      String(
        Math.min(maximum, Math.max(minimum, Number((base + direction * step).toFixed(precision)))),
      ),
    );
  }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      increment(event.key === "ArrowUp" ? 1 : -1);
    }
    onKeyDown?.(event);
  }
  return (
    <div className="number-input group relative w-full min-w-0">
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode={step % 1 === 0 ? "numeric" : "decimal"}
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn("tabular pr-9", className)}
      />
      <div className="number-steppers absolute inset-y-0 right-1 flex flex-col justify-center opacity-50 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          disabled={disabled || (value !== "" && Number(value) >= maximum)}
          aria-label={`Increase ${props["aria-label"] ?? "value"}`}
          onClick={() => increment(1)}
          className="h-4 w-7 rounded-sm p-0 text-muted-foreground hover:text-foreground"
        >
          <ChevronUp className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          disabled={disabled || (value !== "" && Number(value) <= minimum)}
          aria-label={`Decrease ${props["aria-label"] ?? "value"}`}
          onClick={() => increment(-1)}
          className="h-4 w-7 rounded-sm p-0 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="size-3" />
        </Button>
      </div>
    </div>
  );
});
