import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { SET_REPS_MAX, SET_REPS_MIN, SET_WEIGHT_MAX_KG } from "@/lib/limits";
import { cn } from "@/lib/utils";
import type { DraftSet } from "@/types/domain";
import { weightInputId } from "./set-input-id";

/** Smallest plate jump, used by the weight stepper. */
const WEIGHT_STEP_KG = 2.5;

interface SetRowProps {
  index: number;
  set: DraftSet;
  error: string | null;
  onChange: (patch: Partial<DraftSet>) => void;
  onRemove: () => void;
  /** Called when Enter is pressed in the reps field. */
  onRepsEnter?: (() => void) | undefined;
}

/** One editable set: weight, reps and a remove button, with its error underneath. */
export function SetRow({ index, set, error, onChange, onRemove, onRepsEnter }: SetRowProps) {
  const invalid = !!error;
  const number = index + 1;
  return (
    <>
      <tr className={cn("border-t border-border", invalid && "bg-destructive/10")}>
        <td className="tabular w-5 py-2 pl-1 text-sm text-muted-foreground md:w-10">{number}</td>
        <td className="py-2 pr-1 md:pr-3">
          <NumberInput
            id={weightInputId(set.id)}
            aria-label={`Set ${number} weight in kg`}
            aria-invalid={invalid}
            min={0}
            max={SET_WEIGHT_MAX_KG}
            step={WEIGHT_STEP_KG}
            value={set.weight}
            onValueChange={(weight) => onChange({ weight })}
            className="tabular md:h-9"
            placeholder="0"
          />
        </td>
        <td className="py-2 pr-1 md:pr-3">
          <NumberInput
            aria-label={`Set ${number} reps`}
            aria-invalid={invalid}
            min={SET_REPS_MIN}
            max={SET_REPS_MAX}
            step={1}
            value={set.reps}
            onValueChange={(reps) => onChange({ reps })}
            onKeyDown={(event) => {
              if (event.key === "Enter" && onRepsEnter) {
                event.preventDefault();
                onRepsEnter();
              }
            }}
            className="tabular md:h-9"
            placeholder="0"
          />
        </td>
        <td className="w-11 py-2 text-right md:w-10">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Remove set ${number}`}
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X />
          </Button>
        </td>
      </tr>
      {error && (
        <tr>
          <td />
          <td colSpan={3} role="alert" className="pb-2 text-xs text-destructive">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}
