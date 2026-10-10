import type { Workout, WorkoutEntry, WorkoutSet } from "@/types/domain";

// weight × (1 + reps / 30)
export const epley1RM = (weight: number, reps: number): number => {
  if (!isFinite(weight) || !isFinite(reps) || weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

// weight × 36 / (37 − reps)
export const brzycki1RM = (weight: number, reps: number): number => {
  if (!isFinite(weight) || !isFinite(reps) || weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return 0;
  return (weight * 36) / (37 - reps);
};

export const bestEpley1RM = (sets: readonly WorkoutSet[]): number =>
  Math.max(0, ...sets.map((set) => epley1RM(set.weight, set.reps)));

export const setsVolume = (sets: readonly WorkoutSet[]): number =>
  sets.reduce((sum, set) => sum + set.weight * set.reps, 0);

export const countSets = (entries: readonly { sets: readonly unknown[] }[]): number =>
  entries.reduce((count, entry) => count + entry.sets.length, 0);

export const entriesVolume = (entries: readonly Pick<WorkoutEntry, "sets">[]): number =>
  entries.reduce((total, entry) => total + setsVolume(entry.sets), 0);

export const workoutVolume = (workout: Workout): number => entriesVolume(workout.entries);

export const roundToHalf = (value: number): number => Math.round(value * 2) / 2;

// Inverse Epley: reps possible at a fraction (0–1] of a 1RM.
export const repsAtPercent = (percent: number): number => {
  if (percent <= 0 || percent > 1) return 0;
  return Math.max(1, Math.round(30 * (1 / percent - 1)));
};
