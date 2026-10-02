export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
  userId?: string;
}

export interface WorkoutSet {
  id: string;
  /** kilograms */
  weight: number;
  reps: number;
}

export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  notes?: string;
  entries: WorkoutEntry[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export type NewExercise = Omit<Exercise, "id">;
export type NewWorkout = Omit<Workout, "id" | "createdAt" | "updatedAt">;

export interface ExerciseRepository {
  list(): Promise<Exercise[]>;
  create(data: NewExercise): Promise<Exercise>;
  delete(id: string): Promise<void>;
}

export interface WorkoutRepository {
  list(): Promise<Workout[]>;
  getById(id: string): Promise<Workout | null>;
  create(data: NewWorkout): Promise<Workout>;
  update(id: string, data: Partial<NewWorkout>): Promise<Workout>;
  delete(id: string): Promise<void>;
}
