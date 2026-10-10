import { FieldError, FormAlert } from "@/components/FormMessages";
import { Surface } from "@/components/Surface";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { BODY_WEIGHT_MAX_KG, BODY_WEIGHT_MIN_KG, WEIGHT_INPUT_MAX_LENGTH } from "@/lib/limits";
import type { BodyWeightEntry } from "@/types/domain";
import { useBodyWeightForm } from "./useBodyWeightForm";

const WEIGHT_STEP_KG = 0.1;

export function BodyWeightForm({ entries }: { entries: BodyWeightEntry[] }) {
  const form = useBodyWeightForm(entries);

  return (
    <Surface asChild className="mb-6">
      <form onSubmit={form.submit} noValidate>
        <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-start">
          <div className="space-y-2">
            <Label htmlFor="body-weight-date">Date</Label>
            <DatePicker
              id="body-weight-date"
              max={form.today}
              value={form.date}
              onChange={form.changeDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body-weight-value">Weight (kg)</Label>
            <NumberInput
              id="body-weight-value"
              aria-label="Weight (kg)"
              aria-invalid={!!form.weightError}
              min={BODY_WEIGHT_MIN_KG}
              max={BODY_WEIGHT_MAX_KG}
              step={WEIGHT_STEP_KG}
              stepperLayout="sides"
              maxLength={WEIGHT_INPUT_MAX_LENGTH}
              value={form.weight}
              onValueChange={form.changeWeight}
              placeholder="0"
            />
            {form.weightError && <FieldError>{form.weightError}</FieldError>}
          </div>
          <div className="md:pt-6">
            <Button type="submit" disabled={form.saving} className="w-full md:w-auto">
              {form.existing ? "Update entry" : "Add entry"}
            </Button>
          </div>
        </div>
        {form.saveError && <FormAlert className="mt-3">{form.saveError}</FormAlert>}
        {form.existing && !form.weightError && !form.saveError && (
          <p className="mt-3 text-xs text-muted-foreground">
            This day already has an entry of {form.existing.weight} kg. Saving replaces it.
          </p>
        )}
      </form>
    </Surface>
  );
}
