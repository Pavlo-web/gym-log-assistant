import type { Exercise, MuscleGroup, Workout, WorkoutSet } from "@/types/domain";
import { bestEpley1RM, epley1RM, setsVolume } from "./calc";
import { exerciseLabel } from "./workout";

/** One training day of a single exercise. */
export interface ExercisePoint {
  date: string;
  topWeight: number;
  /** reps of the heaviest set (most reps on ties) */
  topReps: number;
  bestE1RM: number;
  volume: number;
  sets: number;
  workoutIds: string[];
}

export interface PersonalRecords {
  maxWeight: { value: number; reps: number; date: string };
  bestE1RM: { value: number; weight: number; reps: number; date: string };
  maxVolume: { value: number; date: string };
}

/** An exercise that appears in at least one saved workout. */
export interface LoggedExercise {
  id: string;
  name: string;
  group?: MuscleGroup;
}

interface DayBucket {
  sets: WorkoutSet[];
  workoutIds: string[];
}

/** Sets of one exercise grouped by date, ascending by date. */
const setsByDate = (workouts: readonly Workout[], exerciseId: string): [string, DayBucket][] => {
  const byDate = new Map<string, DayBucket>();
  for (const workout of workouts) {
    const sets = workout.entries
      .filter((entry) => entry.exerciseId === exerciseId)
      .flatMap((entry) => entry.sets);
    if (sets.length === 0) continue;
    const bucket = byDate.get(workout.date) ?? { sets: [], workoutIds: [] };
    bucket.sets.push(...sets);
    bucket.workoutIds.push(workout.id);
    byDate.set(workout.date, bucket);
  }
  return [...byDate].sort(([a], [b]) => a.localeCompare(b));
};

/** The heaviest set; more reps wins a tie on weight. */
const heaviestSet = (sets: readonly WorkoutSet[]): WorkoutSet | undefined =>
  sets.reduce<WorkoutSet | undefined>((top, set) => {
    if (!top) return set;
    const heavier = set.weight > top.weight;
    const sameWeightMoreReps = set.weight === top.weight && set.reps > top.reps;
    return heavier || sameWeightMoreReps ? set : top;
  }, undefined);

/** One point per date containing the exercise, ascending by date. */
export const exerciseHistory = (
  workouts: readonly Workout[],
  exerciseId: string,
): ExercisePoint[] =>
  setsByDate(workouts, exerciseId).map(([date, { sets, workoutIds }]) => {
    const top = heaviestSet(sets);
    return {
      date,
      topWeight: top?.weight ?? 0,
      topReps: top?.reps ?? 0,
      bestE1RM: bestEpley1RM(sets),
      volume: setsVolume(sets),
      sets: sets.length,
      workoutIds,
    };
  });

/** Personal records; earliest date wins ties. Null when the exercise was never logged. */
export const personalRecords = (
  workouts: readonly Workout[],
  exerciseId: string,
): PersonalRecords | null => {
  let maxWeight: PersonalRecords["maxWeight"] | null = null;
  let bestE1RM: PersonalRecords["bestE1RM"] | null = null;
  let maxVolume: PersonalRecords["maxVolume"] | null = null;

  for (const [date, { sets }] of setsByDate(workouts, exerciseId)) {
    for (const set of sets) {
      const heavier = !maxWeight || set.weight > maxWeight.value;
      const sameDayMoreReps =
        !!maxWeight &&
        set.weight === maxWeight.value &&
        date === maxWeight.date &&
        set.reps > maxWeight.reps;
      if (heavier || sameDayMoreReps) {
        maxWeight = { value: set.weight, reps: set.reps, date };
      }

      const estimate = epley1RM(set.weight, set.reps);
      if (!bestE1RM || estimate > bestE1RM.value) {
        bestE1RM = { value: estimate, weight: set.weight, reps: set.reps, date };
      }
    }

    const volume = setsVolume(sets);
    if (!maxVolume || volume > maxVolume.value) maxVolume = { value: volume, date };
  }

  if (!maxWeight || !bestE1RM || !maxVolume) return null;
  return { maxWeight, bestE1RM, maxVolume };
};

/** Exercises with at least one logged set, most recently trained first. */
export const loggedExercises = (
  workouts: readonly Workout[],
  exercises: readonly Exercise[],
): LoggedExercise[] => {
  const logged = new Map<string, LoggedExercise>();
  for (const workout of workouts) {
    for (const entry of workout.entries) {
      if (logged.has(entry.exerciseId) || entry.sets.length === 0) continue;
      const { name, group } = exerciseLabel(entry, exercises);
      logged.set(entry.exerciseId, { id: entry.exerciseId, name, ...(group ? { group } : {}) });
    }
  }
  return [...logged.values()];
};

/**
 * Best estimated 1RM ever logged for an exercise; 0 when it was never logged.
 * `excludeWorkoutId` leaves one workout out, so a workout being edited is not
 * compared with its own saved version.
 */
export const bestLoggedE1RM = (
  workouts: readonly Workout[],
  exerciseId: string,
  excludeWorkoutId?: string,
): number => {
  const sets = workouts
    .filter((workout) => workout.id !== excludeWorkoutId)
    .flatMap((workout) => workout.entries)
    .filter((entry) => entry.exerciseId === exerciseId)
    .flatMap((entry) => entry.sets);
  return bestEpley1RM(sets);
};
