import type { Exercise, Workout, WorkoutEntry } from "@/types/domain";

export function exerciseLabel(entry: WorkoutEntry, exercises: Exercise[]) {
  const live = exercises.find((e) => e.id === entry.exerciseId);
  return { name: live?.name ?? entry.exerciseName ?? "Deleted exercise", group: live?.muscleGroup ?? entry.muscleGroup };
}

export function workoutStats(workout: Workout) {
  return { exercises: workout.entries.length, sets: workout.entries.reduce((count, entry) => count + entry.sets.length, 0) };
}

export function localWorkoutDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 2000, (month ?? 1) - 1, day ?? 1);
}