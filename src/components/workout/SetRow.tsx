import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DraftSet } from "@/types/domain";

interface Props {
  index: number;
  set: DraftSet;
  error: string | null;
  onChange: (patch: Partial<DraftSet>) => void;
  onRemove: () => void;
  onRepsEnter?: (() => void) | undefined;
}

export function SetRow({ index, set, error, onChange, onRemove, onRepsEnter }: Props) {
  const invalid = !!error;
  return (
    <>
      <tr className={cn("border-t border-border", invalid && "bg-destructive/10")}>
        <td className="tabular w-10 py-2 pl-1 text-sm text-muted-foreground">{index + 1}</td>
        <td className="py-2 pr-3">
          <Input
            id={`weight-${set.id}`}
            aria-label={`Set ${index + 1} weight in kg`}
            aria-invalid={invalid}
            inputMode="decimal"
            type="number"
            min={0}
            max={1000}
            step="any"
            value={set.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            className="tabular h-9"
            placeholder="0"
          />
        </td>
        <td className="py-2 pr-3">
          <Input
            aria-label={`Set ${index + 1} reps`}
            aria-invalid={invalid}
            inputMode="numeric"
            type="number"
            min={1}
            max={100}
            step={1}
            value={set.reps}
            onChange={(e) => onChange({ reps: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onRepsEnter) {
                e.preventDefault();
                onRepsEnter();
              }
            }}
            className="tabular h-9"
            placeholder="0"
          />
        </td>
        <td className="w-10 py-2 text-right">
          <Button type="button" size="icon" variant="ghost" aria-label={`Remove set ${index + 1}`} onClick={onRemove} className="text-muted-foreground hover:text-destructive">
            <X />
          </Button>
        </td>
      </tr>
      {error && (
        <tr>
          <td />
          <td colSpan={3} role="alert" className="pb-2 text-xs text-destructive">{error}</td>
        </tr>
      )}
    </>
  );
}
