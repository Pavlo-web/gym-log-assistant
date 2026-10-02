import { DEFAULT_EXERCISES } from "./default-exercises";
import type {
  Exercise,
  ExerciseRepository,
  NewExercise,
  NewWorkout,
  Workout,
  WorkoutRepository,
} from "@/types/domain";

const EXERCISES_KEY = "gymlog.v1.exercises";
const WORKOUTS_KEY = "gymlog.v1.workouts";

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function read<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — ignore */
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function seedExercises(): Exercise[] {
  const seeded: Exercise[] = DEFAULT_EXERCISES.map((e) => ({
    id: uuid(),
    name: e.name,
    muscleGroup: e.muscleGroup,
    isCustom: false,
  }));
  write(EXERCISES_KEY, seeded);
  return seeded;
}

function loadExercises(): Exercise[] {
  if (!hasStorage()) return [];
  const existing = window.localStorage.getItem(EXERCISES_KEY);
  if (!existing) return seedExercises();
  const parsed = read<Exercise[]>(EXERCISES_KEY, []);
  if (parsed.length === 0) return seedExercises();
  return parsed;
}

class LocalExerciseRepository implements ExerciseRepository {
  async list(): Promise<Exercise[]> {
    return loadExercises().sort((a, b) => a.name.localeCompare(b.name));
  }

  async create(data: NewExercise): Promise<Exercise> {
    const exercises = loadExercises();
    const name = data.name.trim();
    if (!name || name.length > 60) throw new Error("Name must be between 1 and 60 characters.");
    if (exercises.some((e) => e.muscleGroup === data.muscleGroup && e.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      throw new Error("An exercise with this name already exists in this muscle group.");
    }
    const exercise: Exercise = { ...data, name, isCustom: true, id: uuid() };
    write(EXERCISES_KEY, [...exercises, exercise]);
    return exercise;
  }

  async delete(id: string): Promise<void> {
    const exercises = loadExercises();
    const exercise = exercises.find((e) => e.id === id);
    if (!exercise) throw new Error("Exercise not found.");
    if (!exercise.isCustom) throw new Error("Default exercises cannot be deleted.");
    write(EXERCISES_KEY, exercises.filter((e) => e.id !== id));
  }
}

function loadWorkouts(): Workout[] {
  return read<Workout[]>(WORKOUTS_KEY, []);
}

class LocalWorkoutRepository implements WorkoutRepository {
  async list(): Promise<Workout[]> {
    return loadWorkouts().sort((a, b) => b.date.localeCompare(a.date));
  }

  async getById(id: string): Promise<Workout | null> {
    return loadWorkouts().find((w) => w.id === id) ?? null;
  }

  async create(data: NewWorkout): Promise<Workout> {
    const now = new Date().toISOString();
    const workout: Workout = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    write(WORKOUTS_KEY, [...loadWorkouts(), workout]);
    return workout;
  }

  async update(id: string, data: Partial<NewWorkout>): Promise<Workout> {
    const workouts = loadWorkouts();
    const index = workouts.findIndex((w) => w.id === id);
    const current = workouts[index];
    if (!current) throw new Error(`Workout ${id} not found`);
    const updated: Workout = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    workouts[index] = updated;
    write(WORKOUTS_KEY, workouts);

    return updated;
  }

  async delete(id: string): Promise<void> {
    write(
      WORKOUTS_KEY,
      loadWorkouts().filter((w) => w.id !== id),
    );
  }
}

/** Local implementations; consumers use the public data entry point. */
export const exerciseRepository: ExerciseRepository = new LocalExerciseRepository();
export const workoutRepository: WorkoutRepository = new LocalWorkoutRepository();
