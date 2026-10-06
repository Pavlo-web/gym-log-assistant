import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { NumberInput } from "@/components/ui/number-input";
import { brzycki1RM, epley1RM, repsAtPercent, roundToHalf } from "@/lib/calc";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "1RM Calculator — Gym Log" },
      {
        name: "description",
        content:
          "Estimate your one-rep max with the Epley and Brzycki formulas and see a full percentage table.",
      },
      { property: "og:title", content: "1RM Calculator — Gym Log" },
      {
        property: "og:description",
        content:
          "Estimate your one-rep max with the Epley and Brzycki formulas and see a full percentage table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalculatorPage,
});

const PERCENTS = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

function format(value: number, digits = 1): string {
  return value.toFixed(digits).replace(/\.0$/, "");
}

function CalculatorPage() {
  const [weightInput, setWeightInput] = useState("100");
  const [repsInput, setRepsInput] = useState("5");

  const weight = Number.parseFloat(weightInput.replace(",", "."));
  const reps = Number.parseInt(repsInput, 10);

  const valid =
    Number.isFinite(weight) && weight > 0 && Number.isFinite(reps) && reps > 0;
  const unreliable = valid && reps > 20;

  const { epley, brzycki } = useMemo(
    () =>
      valid
        ? { epley: epley1RM(weight, reps), brzycki: brzycki1RM(weight, reps) }
        : { epley: 0, brzycki: 0 },
    [valid, weight, reps],
  );

  return (
    <>
      <PageHeader
        title="1RM Calculator"
        description="Estimate your one-rep max from a set you have actually done."
      />

      <section className="rounded-lg border border-border bg-card min-w-0 p-3 md:p-6">
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
        {unreliable ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Above 20 reps these estimates become unreliable.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card min-w-0 p-3 md:p-6">
        {valid ? (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Estimated 1RM (Epley)</p>
              <p className="tabular mt-1 break-words text-4xl md:text-5xl font-semibold text-primary">
                {format(epley)}
                <span className="ml-2 text-xl font-normal text-muted-foreground">kg</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Brzycki</p>
              <p className="tabular mt-1 text-xl font-medium">{format(brzycki)} kg</p>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Enter a weight and a rep count to see your estimate.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card">
        <div className="border-b border-border px-3 md:px-6 py-4">
          <h2 className="text-sm font-medium">Percentages of your 1RM</h2>
        </div>
        {valid ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-3 md:px-6 py-3 font-normal">Percent</th>
                <th className="px-3 md:px-6 py-3 text-right font-normal">Weight (kg)</th>
                <th className="px-3 md:px-6 py-3 text-right font-normal">Approx. reps</th>
              </tr>
            </thead>
            <tbody>
              {PERCENTS.map((p) => (
                <tr key={p} className="border-t border-border">
                  <td className="tabular px-3 md:px-6 py-2.5">{p}%</td>
                  <td className="tabular px-3 md:px-6 py-2.5 text-right">
                    {format(roundToHalf((epley * p) / 100))}
                  </td>
                  <td className="tabular px-3 md:px-6 py-2.5 text-right text-muted-foreground">
                    {repsAtPercent(p / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-3 md:px-6 py-10 text-center text-sm text-muted-foreground">
            No values yet.
          </p>
        )}
      </section>
    </>
  );
}
