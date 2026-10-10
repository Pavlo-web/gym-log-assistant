export const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
  userId?: string;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
}

export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  muscleGroup?: MuscleGroup;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
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

// Numeric fields stay raw input strings until the workout is saved.
export interface DraftSet {
  id: string;
  weight: string;
  reps: string;
}

export interface DraftEntry {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  muscleGroup?: MuscleGroup;
  sets: DraftSet[];
}

export interface WorkoutDraft {
  date: string;
  notes: string;
  entries: DraftEntry[];
  // Plan this draft was started from; removed once the workout is saved.
  planId?: string;
}

export interface DraftRepository {
  get(): Promise<WorkoutDraft | null>;
  set(draft: WorkoutDraft): Promise<void>;
  clear(): Promise<void>;
}

// At most one per day.
export interface BodyWeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface BodyWeightRepository {
  list(): Promise<BodyWeightEntry[]>;
  // Replaces an existing entry for that day.
  save(date: string, weight: number): Promise<BodyWeightEntry>;
  delete(id: string): Promise<void>;
}

export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
}

// Holds no sets and never counts in the statistics.
export interface PlannedWorkout {
  id: string;
  date: string;
  // 24-hour HH:mm, local time.
  time: string;
  title?: string;
  exercises: PlannedExercise[];
  createdAt: string;
}

export type NewPlannedWorkout = Omit<PlannedWorkout, "id" | "createdAt">;

export interface PlannedWorkoutRepository {
  list(): Promise<PlannedWorkout[]>;
  create(data: NewPlannedWorkout): Promise<PlannedWorkout>;
  delete(id: string): Promise<void>;
}

export interface DemoDataRepository {
  has(): Promise<boolean>;
  // Replaces earlier sample records; the user's own are kept.
  load(): Promise<void>;
  remove(): Promise<void>;
}
