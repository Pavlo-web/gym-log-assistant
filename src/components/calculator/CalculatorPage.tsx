import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { NumberInput } from "@/components/ui/number-input";
import { brzycki1RM, epley1RM } from "@/lib/calc";
import { formatFixed, parseDecimal, parseInteger } from "@/lib/number";
import { PercentageTable } from "./PercentageTable";

/** Above this many reps the 1RM formulas stop being trustworthy. */
const RELIABLE_REPS_MAX = 20;

const CARD = "rounded-lg border border-border bg-card";

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

      <section className={`${CARD} min-w-0 p-3 md:p-6`}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-muted-foreground">Weight (kg)</span>
            <NumberInput
              aria-label="Weight (kg)"
              step={2.5}
              min={0}
              value={weightInput}
              onValueChange={setWeightInput}
              className="h-11 bg-surface text-lg"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-muted-foreground">Reps</span>
            <NumberInput
              aria-label="Reps"
              inputMode="numeric"
              step={1}
              min={1}
              value={repsInput}
              onValueChange={setRepsInput}
              className="h-11 bg-surface text-lg"
            />
          </label>
        </div>
        {valid && reps > RELIABLE_REPS_MAX && (
          <p className="mt-4 text-xs text-muted-foreground">
            Above {RELIABLE_REPS_MAX} reps these estimates become unreliable.
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD} min-w-0 p-3 md:p-6`}>
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
      </section>

      <section className={`mt-6 ${CARD}`}>
        <div className="border-b border-border px-3 md:px-6 py-4">
          <h2 className="text-sm font-medium">Percentages of your 1RM</h2>
        </div>
        {valid ? (
          <PercentageTable oneRepMax={epley} />
        ) : (
          <p className="px-3 md:px-6 py-10 text-center text-sm text-muted-foreground">
            No values yet.
          </p>
        )}
      </section>
    </>
  );
}
