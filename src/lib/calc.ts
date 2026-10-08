import type { Workout, WorkoutEntry, WorkoutSet } from "@/types/domain";

/** Epley: weight × (1 + reps / 30). Returns the weight itself for 1 rep. */
export function epley1RM(weight: number, reps: number): number {
  if (!isFinite(weight) || !isFinite(reps) || weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Brzycki: weight × 36 / (37 − reps). Returns the weight itself for 1 rep. */
export function brzycki1RM(weight: number, reps: number): number {
  if (!isFinite(weight) || !isFinite(reps) || weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return 0;
  return (weight * 36) / (37 - reps);
}

/** Best Epley estimate among the sets; 0 when there are none. */
export function bestEpley1RM(sets: readonly WorkoutSet[]): number {
  return Math.max(0, ...sets.map((set) => epley1RM(set.weight, set.reps)));
}

/** Sum of weight × reps across sets. */
export function setsVolume(sets: readonly WorkoutSet[]): number {
  return sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
}

/** Number of sets across a list of workout entries. */
export function countSets(entries: readonly { sets: readonly unknown[] }[]): number {
  return entries.reduce((count, entry) => count + entry.sets.length, 0);
}

/** Total volume (sum of weight × reps across all sets) of a list of entries. */
export function entriesVolume(entries: readonly Pick<WorkoutEntry, "sets">[]): number {
  return entries.reduce((total, entry) => total + setsVolume(entry.sets), 0);
}

/** Total volume of a workout. */
export function workoutVolume(workout: Workout): number {
  return entriesVolume(workout.entries);
}

/** Rounds to the nearest 0.5 kg. */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/** Inverse Epley: approximate reps possible at a given fraction (0–1] of a 1RM. */
export function repsAtPercent(percent: number): number {
  if (percent <= 0 || percent > 1) return 0;
  return Math.max(1, Math.round(30 * (1 / percent - 1)));
}
