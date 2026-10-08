import type { Exercise, MuscleGroup, Workout, WorkoutEntry } from "@/types/domain";
import { countSets, workoutVolume } from "./calc";

/** Shown for entries whose exercise was deleted and that carry no stored name. */
export const DELETED_EXERCISE_NAME = "Deleted exercise";

export interface ExerciseLabel {
  name: string;
  group: MuscleGroup | undefined;
}

/**
 * Display label for a workout entry: the live library exercise wins, then the
 * name stored on the entry when it was saved, so old workouts stay readable
 * after an exercise is deleted.
 */
export function exerciseLabel(
  entry: Pick<WorkoutEntry, "exerciseId" | "exerciseName" | "muscleGroup">,
  exercises: readonly Exercise[],
): ExerciseLabel {
  const live = exercises.find((exercise) => exercise.id === entry.exerciseId);
  return {
    name: live?.name ?? entry.exerciseName ?? DELETED_EXERCISE_NAME,
    group: live?.muscleGroup ?? entry.muscleGroup,
  };
}

/** True when `exercise` has this name (case-insensitive) in this muscle group. */
export function isSameExercise(
  exercise: Pick<Exercise, "name" | "muscleGroup">,
  name: string,
  muscleGroup: MuscleGroup,
): boolean {
  return (
    exercise.muscleGroup === muscleGroup &&
    exercise.name.toLocaleLowerCase() === name.toLocaleLowerCase()
  );
}

export interface WorkoutStats {
  exercises: number;
  sets: number;
  volume: number;
}

/** Headline numbers of a workout: exercise count, set count and total volume in kg. */
export function workoutStats(workout: Workout): WorkoutStats {
  return {
    exercises: workout.entries.length,
    sets: countSets(workout.entries),
    volume: workoutVolume(workout),
  };
}
