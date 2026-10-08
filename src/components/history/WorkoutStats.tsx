import { formatNumber } from "@/lib/number";
import type { WorkoutStats as Stats } from "@/lib/workout";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <strong className="block">{value}</strong>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

/** Exercises / sets / volume of a workout as three labelled figures. */
export function WorkoutStats({ stats }: { stats: Stats }) {
  return (
    <>
      <Stat value={stats.exercises} label="Exercises" />
      <Stat value={stats.sets} label="Sets" />
      <Stat value={`${formatNumber(stats.volume)} kg`} label="Volume" />
    </>
  );
}
