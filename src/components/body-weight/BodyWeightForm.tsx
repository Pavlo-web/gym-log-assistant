import { Surface } from "@/components/Surface";
import { useState, type FormEvent } from "react";
import { FieldError, FormAlert } from "@/components/FormMessages";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { useSaveBodyWeight } from "@/hooks/useBodyWeight";
import { bodyWeightError } from "@/lib/body-weight";
import { todayLocal } from "@/lib/date";
import { BODY_WEIGHT_MAX_KG, BODY_WEIGHT_MIN_KG, WEIGHT_INPUT_MAX_LENGTH } from "@/lib/limits";
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
  /** Problem with the typed weight, shown under the field. */
  const [weightError, setWeightError] = useState("");
  /** Problem with saving, shown for the form as a whole. */
  const [saveError, setSaveError] = useState("");

  const existing = entries.find((entry) => entry.date === date);

  function clearErrors() {
    setWeightError("");
    setSaveError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearErrors();
    const problem = bodyWeightError(weight);
    if (problem) {
      setWeightError(problem);
      return;
    }
    try {
      await save.mutateAsync({ date, weight: parseDecimal(weight) });
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not save. Try again.");
    }
  }

  return (
    <Surface asChild className="mb-6">
      <form onSubmit={submit} noValidate>
        {/* Aligned to the top so a message under one field does not push the others down. */}
        <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-start">
          <div className="space-y-2">
            <Label htmlFor="body-weight-date">Date</Label>
            <DatePicker
              id="body-weight-date"
              max={today}
              value={date}
              onChange={(next) => {
                setDate(next);
                clearErrors();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body-weight-value">Weight (kg)</Label>
            <NumberInput
              id="body-weight-value"
              aria-label="Weight (kg)"
              aria-invalid={!!weightError}
              min={BODY_WEIGHT_MIN_KG}
              max={BODY_WEIGHT_MAX_KG}
              step={WEIGHT_STEP_KG}
              stepperLayout="sides"
              maxLength={WEIGHT_INPUT_MAX_LENGTH}
              value={weight}
              onValueChange={(next) => {
                setWeight(next);
                clearErrors();
              }}
              placeholder="0"
            />
            {weightError && <FieldError>{weightError}</FieldError>}
          </div>
          {/* The top padding equals a label plus its gap, so the button lines up with the fields. */}
          <div className="md:pt-6">
            <Button type="submit" disabled={save.isPending} className="w-full md:w-auto">
              {existing ? "Update entry" : "Add entry"}
            </Button>
          </div>
        </div>
        {saveError && <FormAlert className="mt-3">{saveError}</FormAlert>}
        {existing && !weightError && !saveError && (
          <p className="mt-3 text-xs text-muted-foreground">
            This day already has an entry of {existing.weight} kg. Saving replaces it.
          </p>
        )}
      </form>
    </Surface>
  );
}
