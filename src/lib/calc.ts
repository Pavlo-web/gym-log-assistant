import type { Workout, WorkoutSet } from "@/types/domain";

/** Epley: weight * (1 + reps / 30). Returns weight itself for 1 rep. */
export function epley1RM(weight: number, reps: number): number {
  if (!isFinite(weight) || !isFinite(reps) || weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Brzycki: weight * 36 / (37 - reps). Returns weight itself for 1 rep. */
export function brzycki1RM(weight: number, reps: number): number {
  if (!isFinite(weight) || !isFinite(reps) || weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return 0;
  return (weight * 36) / (37 - reps);
}

/** Sum of weight × reps across sets. */
export function setsVolume(sets: readonly WorkoutSet[]): number {
  return sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
}

/** Total volume (sum of weight * reps across all sets) of a workout. */
export function workoutVolume(workout: Workout): number {
  return workout.entries.reduce((total, entry) => total + setsVolume(entry.sets), 0);
}

/** Rounds to the nearest 0.5 kg. */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/** Inverse Epley: approximate reps possible at a given load for a 1RM. */
export function repsAtPercent(percent: number): number {
  if (percent <= 0 || percent > 1) return 0;
  return Math.max(1, Math.round(30 * (1 / percent - 1)));
}
