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
    <dl aria-label="Workout summary" className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="text-xs text-muted-foreground">{i.label}</dt>
          <dd className="tabular mt-1 text-lg font-semibold">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
