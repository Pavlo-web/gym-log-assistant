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
  /** kilograms */
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

/** In-progress workout form state; numeric fields kept as raw input strings. */
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
  /** Planned workout this draft was started from; it is removed once the workout is saved. */
  planId?: string;
}

export interface DraftRepository {
  get(): Promise<WorkoutDraft | null>;
  set(draft: WorkoutDraft): Promise<void>;
  clear(): Promise<void>;
}

/** One body weight measurement; there is at most one per day. */
export interface BodyWeightEntry {
  id: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** kilograms */
  weight: number;
}

export interface BodyWeightRepository {
  list(): Promise<BodyWeightEntry[]>;
  /** Saves the weight for a day, replacing an existing entry for that day. */
  save(date: string, weight: number): Promise<BodyWeightEntry>;
  delete(id: string): Promise<void>;
}

/** Exercise of a planned workout, with the label stored like on a workout entry. */
export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
}

/**
 * A workout scheduled for later. It holds no sets and never counts in the
 * statistics; starting it fills the workout form, and saving that form logs
 * the real workout.
 */
export interface PlannedWorkout {
  id: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** Local time of day, HH:mm (24-hour). */
  time: string;
  title?: string;
  exercises: PlannedExercise[];
  createdAt: string;
}

export type NewPlannedWorkout = Omit<PlannedWorkout, "id" | "createdAt">;

export interface PlannedWorkoutRepository {
  /** Soonest first. */
  list(): Promise<PlannedWorkout[]>;
  create(data: NewPlannedWorkout): Promise<PlannedWorkout>;
  delete(id: string): Promise<void>;
}

/** Sample records for showing the app with data; kept apart from the user's own. */
export interface DemoDataRepository {
  /** True while any sample record is stored. */
  has(): Promise<boolean>;
  /** Adds the sample records, replacing earlier ones. The user's records are kept. */
  load(): Promise<void>;
  /** Removes only the sample records. */
  remove(): Promise<void>;
}
