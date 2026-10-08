import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { useSaveBodyWeight } from "@/hooks/useBodyWeight";
import { bodyWeightError } from "@/lib/body-weight";
import { todayLocal } from "@/lib/date";
import { BODY_WEIGHT_MAX_KG, BODY_WEIGHT_MIN_KG } from "@/lib/limits";
import { parseDecimal } from "@/lib/number";
import type { BodyWeightEntry } from "@/types/domain";

/** Scales usually show one decimal. */
const WEIGHT_STEP_KG = 0.1;

interface BodyWeightFormProps {
  /** Existing log, used to prefill the field and warn before replacing a day. */
  entries: BodyWeightEntry[];
}

/** Adds the weight for a day; a day that already has an entry is updated instead. */
export function BodyWeightForm({ entries }: BodyWeightFormProps) {
  const save = useSaveBodyWeight();
  const today = todayLocal();
  const [date, setDate] = useState(today);
  // Start from the latest weight: the next measurement is usually close to it.
  const [weight, setWeight] = useState(() => (entries[0] ? String(entries[0].weight) : ""));
  const [error, setError] = useState("");

  const existing = entries.find((entry) => entry.date === date);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = date > today ? "Future dates are not allowed." : bodyWeightError(weight);
    if (message) {
      setError(message);
      return;
    }
    try {
      await save.mutateAsync({ date, weight: parseDecimal(weight) });
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save. Try again.");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-md border border-border bg-card min-w-0 p-3 md:p-5"
    >
      <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="body-weight-date">Date</Label>
          <DatePicker
            id="body-weight-date"
            max={today}
            value={date}
            onChange={(next) => {
              setDate(next);
              setError("");
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body-weight-value">Weight (kg)</Label>
          <NumberInput
            id="body-weight-value"
            aria-label="Weight (kg)"
            aria-invalid={!!error}
            min={BODY_WEIGHT_MIN_KG}
            max={BODY_WEIGHT_MAX_KG}
            step={WEIGHT_STEP_KG}
            value={weight}
            onValueChange={(next) => {
              setWeight(next);
              setError("");
            }}
            placeholder="0"
          />
        </div>
        <Button type="submit" disabled={save.isPending}>
          {existing ? "Update entry" : "Add entry"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : (
        existing && (
          <p className="mt-3 text-xs text-muted-foreground">
            This day already has an entry of {existing.weight} kg. Saving replaces it.
          </p>
        )
      )}
    </form>
  );
}
