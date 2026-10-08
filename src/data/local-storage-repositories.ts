import { isIsoDate } from "@/lib/date";
import { newId } from "@/lib/id";
import { BODY_WEIGHT_MAX_KG, BODY_WEIGHT_MIN_KG, EXERCISE_NAME_MAX_LENGTH } from "@/lib/limits";
import { isSameExercise } from "@/lib/workout";
import type {
  BodyWeightEntry,
  BodyWeightRepository,
  DraftRepository,
  Exercise,
  ExerciseRepository,
  NewExercise,
  NewWorkout,
  Workout,
  WorkoutDraft,
  WorkoutRepository,
} from "@/types/domain";
import {
  DEFAULT_EXERCISES,
  REMOVED_DEFAULT_EXERCISES,
  type ExerciseSeed,
} from "./default-exercises";

const EXERCISES_KEY = "gymlog.v1.exercises";
const WORKOUTS_KEY = "gymlog.v1.workouts";
const DRAFT_KEY = "gymlog.v1.workout-draft";
const BODY_WEIGHT_KEY = "gymlog.v1.body-weight";
const EXERCISES_MIGRATION_KEY = "gymlog.v1.exercises-defaults-v2";
const MIGRATION_DONE = "done";

/** False during server rendering and when the browser blocks storage (e.g. private mode). */
function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readItem(key: string): string | null {
  if (!hasStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes are best effort: a full or blocked storage must not crash the app. */
function writeItem(key: string, value: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota exceeded or storage unavailable */
  }
}

/** Reads a stored JSON array; missing, corrupted or non-array data yields an empty list. */
function readList<T>(key: string): T[] {
  const raw = readItem(key);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, value: readonly T[]): void {
  writeItem(key, JSON.stringify(value));
}

function toDefaultExercise(seed: ExerciseSeed): Exercise {
  return { id: newId(), name: seed.name, muscleGroup: seed.muscleGroup, isCustom: false };
}

function seedExercises(): Exercise[] {
  const seeded = DEFAULT_EXERCISES.map(toDefaultExercise);
  writeList(EXERCISES_KEY, seeded);
  return seeded;
}

/**
 * Brings an existing library in line with the current defaults: drops defaults
 * that were removed and adds the ones that are missing. Custom exercises are
 * never touched.
 */
function migrateDefaultExercises(exercises: readonly Exercise[]): Exercise[] {
  const migrated = exercises.filter((exercise) => !isRemovedDefault(exercise));

  for (const seed of DEFAULT_EXERCISES) {
    const exists = migrated.some((exercise) =>
      isSameExercise(exercise, seed.name, seed.muscleGroup),
    );
    if (!exists) migrated.push(toDefaultExercise(seed));
  }
  return migrated;
}

/** Stored defaults keep their original spelling, so removed ones are matched exactly. */
function isRemovedDefault(exercise: Exercise): boolean {
  if (exercise.isCustom) return false;
  return REMOVED_DEFAULT_EXERCISES.some(
    (removed) => removed.muscleGroup === exercise.muscleGroup && removed.name === exercise.name,
  );
}

function loadExercises(): Exercise[] {
  if (!hasStorage()) return [];
  const stored = readList<Exercise>(EXERCISES_KEY);
  if (stored.length === 0) return seedExercises();
  if (readItem(EXERCISES_MIGRATION_KEY) === MIGRATION_DONE) return stored;

  const migrated = migrateDefaultExercises(stored);
  writeList(EXERCISES_KEY, migrated);
  writeItem(EXERCISES_MIGRATION_KEY, MIGRATION_DONE);
  return migrated;
}

function loadWorkouts(): Workout[] {
  return readList<Workout>(WORKOUTS_KEY);
}

class LocalExerciseRepository implements ExerciseRepository {
  async list(): Promise<Exercise[]> {
    return loadExercises().sort((a, b) => a.name.localeCompare(b.name));
  }

  async create(data: NewExercise): Promise<Exercise> {
    const exercises = loadExercises();
    const name = data.name.trim();
    if (!name || name.length > EXERCISE_NAME_MAX_LENGTH) {
      throw new Error(`Name must be between 1 and ${EXERCISE_NAME_MAX_LENGTH} characters.`);
    }
    if (exercises.some((exercise) => isSameExercise(exercise, name, data.muscleGroup))) {
      throw new Error("An exercise with this name already exists in this muscle group.");
    }
    const exercise: Exercise = { ...data, name, isCustom: true, id: newId() };
    writeList(EXERCISES_KEY, [...exercises, exercise]);
    return exercise;
  }

  async delete(id: string): Promise<void> {
    const exercises = loadExercises();
    const exercise = exercises.find((item) => item.id === id);
    if (!exercise) throw new Error("Exercise not found.");
    if (!exercise.isCustom) throw new Error("Default exercises cannot be deleted.");
    writeList(
      EXERCISES_KEY,
      exercises.filter((item) => item.id !== id),
    );
  }
}

class LocalWorkoutRepository implements WorkoutRepository {
  /** Newest first; workouts on the same date are ordered by creation time. */
  async list(): Promise<Workout[]> {
    return loadWorkouts().sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
  }

  async getById(id: string): Promise<Workout | null> {
    return loadWorkouts().find((workout) => workout.id === id) ?? null;
  }

  async create(data: NewWorkout): Promise<Workout> {
    const now = new Date().toISOString();
    const workout: Workout = { ...data, id: newId(), createdAt: now, updatedAt: now };
    writeList(WORKOUTS_KEY, [...loadWorkouts(), workout]);
    return workout;
  }

  async update(id: string, data: Partial<NewWorkout>): Promise<Workout> {
    const workouts = loadWorkouts();
    const index = workouts.findIndex((workout) => workout.id === id);
    const current = workouts[index];
    if (!current) throw new Error(`Workout ${id} not found`);

    const updated: Workout = { ...current, ...data, updatedAt: new Date().toISOString() };
    workouts[index] = updated;
    writeList(WORKOUTS_KEY, workouts);
    return updated;
  }

  async delete(id: string): Promise<void> {
    writeList(
      WORKOUTS_KEY,
      loadWorkouts().filter((workout) => workout.id !== id),
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Accepts stored draft data only when it has the expected shape. */
function parseDraft(raw: string): WorkoutDraft | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const { date, notes, entries } = parsed;
    if (typeof date !== "string" || !Array.isArray(entries)) return null;
    return {
      date,
      notes: typeof notes === "string" ? notes : "",
      entries: entries as WorkoutDraft["entries"],
    };
  } catch {
    return null;
  }
}

class LocalDraftRepository implements DraftRepository {
  async get(): Promise<WorkoutDraft | null> {
    const raw = readItem(DRAFT_KEY);
    return raw ? parseDraft(raw) : null;
  }

  async set(draft: WorkoutDraft): Promise<void> {
    writeItem(DRAFT_KEY, JSON.stringify(draft));
  }

  async clear(): Promise<void> {
    if (!hasStorage()) return;
    window.localStorage.removeItem(DRAFT_KEY);
  }
}

/** Local implementations; consumers import them through `@/data`. */
export const exerciseRepository: ExerciseRepository = new LocalExerciseRepository();
export const workoutRepository: WorkoutRepository = new LocalWorkoutRepository();
export const draftRepository: DraftRepository = new LocalDraftRepository();

class LocalBodyWeightRepository implements BodyWeightRepository {
  /** Newest first. */
  async list(): Promise<BodyWeightEntry[]> {
    return readList<BodyWeightEntry>(BODY_WEIGHT_KEY).sort((a, b) => b.date.localeCompare(a.date));
  }

  async save(date: string, weight: number): Promise<BodyWeightEntry> {
    if (!isIsoDate(date)) throw new Error("Pick a valid date.");
    if (!(weight >= BODY_WEIGHT_MIN_KG && weight <= BODY_WEIGHT_MAX_KG)) {
      throw new Error(`Weight must be ${BODY_WEIGHT_MIN_KG}–${BODY_WEIGHT_MAX_KG} kg.`);
    }
    const entries = readList<BodyWeightEntry>(BODY_WEIGHT_KEY);
    const existing = entries.find((entry) => entry.date === date);
    const saved: BodyWeightEntry = { id: existing?.id ?? newId(), date, weight };
    writeList(BODY_WEIGHT_KEY, [...entries.filter((entry) => entry.date !== date), saved]);
    return saved;
  }

  async delete(id: string): Promise<void> {
    writeList(
      BODY_WEIGHT_KEY,
      readList<BodyWeightEntry>(BODY_WEIGHT_KEY).filter((entry) => entry.id !== id),
    );
  }
}

export const bodyWeightRepository: BodyWeightRepository = new LocalBodyWeightRepository();
