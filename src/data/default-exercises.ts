import type { MuscleGroup } from "@/types/domain";

export interface ExerciseSeed {
  name: string;
  muscleGroup: MuscleGroup;
}

// The migration removes these from existing libraries unless the user created the entry.
export const REMOVED_DEFAULT_EXERCISES: readonly ExerciseSeed[] = [
  { name: "Russian Twist", muscleGroup: "Core" },
];

export const DEFAULT_EXERCISES: readonly ExerciseSeed[] = [
  { name: "Bench Press", muscleGroup: "Chest" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest" },
  { name: "Dumbbell Fly", muscleGroup: "Chest" },
  { name: "Cable Crossover", muscleGroup: "Chest" },
  { name: "Push-Up", muscleGroup: "Chest" },
  { name: "Dip", muscleGroup: "Chest" },
  { name: "Deadlift", muscleGroup: "Back" },
  { name: "Barbell Row", muscleGroup: "Back" },
  { name: "Pull-Up", muscleGroup: "Back" },
  { name: "Lat Pulldown", muscleGroup: "Back" },
  { name: "Seated Cable Row", muscleGroup: "Back" },
  { name: "T-Bar Row", muscleGroup: "Back" },
  { name: "Squat", muscleGroup: "Legs" },
  { name: "Front Squat", muscleGroup: "Legs" },
  { name: "Romanian Deadlift", muscleGroup: "Legs" },
  { name: "Leg Press", muscleGroup: "Legs" },
  { name: "Walking Lunge", muscleGroup: "Legs" },
  { name: "Leg Extension", muscleGroup: "Legs" },
  { name: "Leg Curl", muscleGroup: "Legs" },
  { name: "Standing Calf Raise", muscleGroup: "Legs" },
  { name: "Overhead Press", muscleGroup: "Shoulders" },
  { name: "Seated Dumbbell Press", muscleGroup: "Shoulders" },
  { name: "Lateral Raise", muscleGroup: "Shoulders" },
  { name: "Rear Delt Fly", muscleGroup: "Shoulders" },
  { name: "Face Pull", muscleGroup: "Shoulders" },
  { name: "Barbell Curl", muscleGroup: "Arms" },
  { name: "Dumbbell Hammer Curl", muscleGroup: "Arms" },
  { name: "Preacher Curl", muscleGroup: "Arms" },
  { name: "Triceps Pushdown", muscleGroup: "Arms" },
  { name: "Skull Crusher", muscleGroup: "Arms" },
  { name: "Close-Grip Bench Press", muscleGroup: "Arms" },
  { name: "Plank", muscleGroup: "Core" },
  { name: "Hanging Leg Raise", muscleGroup: "Core" },
  { name: "Cable Crunch", muscleGroup: "Core" },
  { name: "Side Plank", muscleGroup: "Core" },
  { name: "Ab Wheel Rollout", muscleGroup: "Core" },
];
