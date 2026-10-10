import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/SectionTitle";
import { Surface } from "@/components/Surface";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { NumberInput } from "@/components/ui/number-input";
import { brzycki1RM, epley1RM } from "@/lib/calc";
import { REPS_INPUT_MAX_LENGTH, WEIGHT_INPUT_MAX_LENGTH } from "@/lib/limits";
import { formatFixed, parseDecimal, parseInteger } from "@/lib/number";
import { PercentageTable } from "./PercentageTable";

/** Above this many reps the 1RM formulas stop being trustworthy. */
const RELIABLE_REPS_MAX = 20;

export function CalculatorPage() {
  const [weightInput, setWeightInput] = useState("100");
  const [repsInput, setRepsInput] = useState("5");

  const weight = parseDecimal(weightInput);
  const reps = parseInteger(repsInput);
  const valid = weight > 0 && reps > 0;
  const epley = valid ? epley1RM(weight, reps) : 0;
  const brzycki = valid ? brzycki1RM(weight, reps) : 0;

  return (
    <>
      <PageHeader
        title="1RM Calculator"
        description="Estimate your one-rep max from a set you have actually done."
      />

      <Surface as="section">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="calculator-weight">Weight (kg)</Label>
            <NumberInput
              id="calculator-weight"
              aria-label="Weight (kg)"
              step={2.5}
              stepperLayout="sides"
              maxLength={WEIGHT_INPUT_MAX_LENGTH}
              min={0}
              value={weightInput}
              onValueChange={setWeightInput}
              fieldSize="lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calculator-reps">Reps</Label>
            <NumberInput
              id="calculator-reps"
              aria-label="Reps"
              inputMode="numeric"
              step={1}
              stepperLayout="sides"
              maxLength={REPS_INPUT_MAX_LENGTH}
              min={1}
              value={repsInput}
              onValueChange={setRepsInput}
              fieldSize="lg"
            />
          </div>
        </div>
        {valid && reps > RELIABLE_REPS_MAX && (
          <p className="mt-4 text-xs text-muted-foreground">
            Above {RELIABLE_REPS_MAX} reps these estimates become unreliable.
          </p>
        )}
      </Surface>

      <Surface as="section" className="mt-6">
        {valid ? (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Estimated 1RM (Epley)</p>
              <p className="tabular mt-1 break-words text-4xl md:text-5xl font-semibold text-primary">
                {formatFixed(epley)}
                <span className="ml-2 text-xl font-normal text-muted-foreground">kg</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Brzycki</p>
              <p className="tabular mt-1 text-xl font-medium">{formatFixed(brzycki)} kg</p>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Enter a weight and a rep count to see your estimate.
          </p>
        )}
      </Surface>

      <Surface as="section" padding="flush" className="mt-6">
        <SectionTitle
          title="Percentages of your 1RM"
          className="border-b border-border px-3 py-4 md:px-5"
        />
        {valid ? (
          <PercentageTable oneRepMax={epley} />
        ) : (
          <p className="px-3 py-10 md:px-5 text-center text-sm text-muted-foreground">
            No values yet.
          </p>
        )}
      </Surface>
    </>
  );
}
