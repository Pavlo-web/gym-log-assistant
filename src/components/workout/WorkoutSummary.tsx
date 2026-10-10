import { countSets, entriesVolume } from "@/lib/calc";
import { formatNumber } from "@/lib/number";
import type { WorkoutEntry } from "@/types/domain";

interface WorkoutSummaryProps {
  entries: WorkoutEntry[];
  /**
   * Passed separately because the form counts every exercise on screen, while
   * `entries` only holds the ones with at least one valid set.
   */
  exerciseCount: number;
}

export function WorkoutSummary({ entries, exerciseCount }: WorkoutSummaryProps) {
  const items = [
    { label: "Exercises", value: String(exerciseCount) },
    { label: "Sets", value: String(countSets(entries)) },
    { label: "Volume", value: `${formatNumber(entriesVolume(entries))} kg` },
  ];
  return (
    <dl
      aria-label="Workout summary"
      className="grid grid-cols-[1fr_1fr_minmax(0,1.7fr)] gap-2 rounded-lg border border-border p-3 md:grid-cols-3 md:gap-4 md:p-4"
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="tabular mt-1 break-words text-base font-semibold md:text-lg">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
