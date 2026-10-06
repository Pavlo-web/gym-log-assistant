import { workoutVolume } from "@/lib/calc";
import type { Workout } from "@/types/domain";

export function WorkoutSummary({ workout, exerciseCount }: { workout: Workout; exerciseCount: number }) {
  const sets = workout.entries.reduce((n, e) => n + e.sets.length, 0);
  const volume = workoutVolume(workout);
  const items = [
    { label: "Exercises", value: String(exerciseCount) },
    { label: "Sets", value: String(sets) },
    { label: "Volume", value: `${volume.toLocaleString("en-US", { maximumFractionDigits: 1 })} kg` },
  ];
  return (
    <dl aria-label="Workout summary" className="grid grid-cols-[1fr_1fr_minmax(0,1.7fr)] gap-2 rounded-lg border border-border p-3 md:grid-cols-3 md:gap-4 md:p-4">
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{i.label}</dt>
          <dd className="tabular mt-1 break-words text-base font-semibold md:text-lg">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
