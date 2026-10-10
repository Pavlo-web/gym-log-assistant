import type { Exercise, MuscleGroup, Workout, WorkoutEntry } from "@/types/domain";
import { countSets, workoutVolume } from "./calc";

export const DELETED_EXERCISE_NAME = "Deleted exercise";

export interface ExerciseLabel {
  name: string;
  group: MuscleGroup | undefined;
}

// The live library name wins, then the name stored on the entry.
export const exerciseLabel = (
  entry: Pick<WorkoutEntry, "exerciseId" | "exerciseName" | "muscleGroup">,
  exercises: readonly Exercise[],
): ExerciseLabel => {
  const live = exercises.find((exercise) => exercise.id === entry.exerciseId);
  return {
    name: live?.name ?? entry.exerciseName ?? DELETED_EXERCISE_NAME,
    group: live?.muscleGroup ?? entry.muscleGroup,
  };
};

export const exerciseVideoUrl = (name: string): string => {
  const query = encodeURIComponent(`${name} proper form`);
  return `https://www.youtube.com/results?search_query=${query}`;
};

export const isSameExercise = (
  exercise: Pick<Exercise, "name" | "muscleGroup">,
  name: string,
  muscleGroup: MuscleGroup,
): boolean =>
  exercise.muscleGroup === muscleGroup &&
  exercise.name.toLocaleLowerCase() === name.toLocaleLowerCase();

export interface WorkoutStats {
  exercises: number;
  sets: number;
  volume: number;
}

export const workoutStats = (workout: Workout): WorkoutStats => ({
  exercises: workout.entries.length,
  sets: countSets(workout.entries),
  volume: workoutVolume(workout),
});
