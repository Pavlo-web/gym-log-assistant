import { epley1RM } from "@/lib/calc";
import { todayLocal } from "@/lib/date";
import { SET_REPS_MAX, SET_REPS_MIN, SET_WEIGHT_MAX_KG } from "@/lib/limits";
import { parseDecimal, parseInteger } from "@/lib/number";
import type { DraftEntry, DraftSet, Workout, WorkoutDraft, WorkoutEntry } from "@/types/domain";

export type SetStatus = "empty" | "valid" | "invalid";

export const emptyDraft = (): WorkoutDraft => ({ date: todayLocal(), notes: "", entries: [] });

export const isDraftEmpty = (draft: WorkoutDraft): boolean =>
  draft.entries.length === 0 && draft.notes.trim() === "" && draft.date === todayLocal();

export const draftFromWorkout = (workout: Workout): WorkoutDraft => ({
  date: workout.date,
  notes: workout.notes ?? "",
  entries: workout.entries.map((entry) => ({
    ...entry,
    sets: entry.sets.map((set) => ({
      id: set.id,
      weight: String(set.weight),
      reps: String(set.reps),
    })),
  })),
});

export interface SetFieldErrors {
  weight: string | null;
  reps: string | null;
}

// "typed": only values that are present and wrong, for feedback while typing.
// "complete": a started set needs both fields, which is what saving requires.
export type SetCheck = "typed" | "complete";

const weightProblem = (text: string, check: SetCheck): string | null => {
  if (!text) return check === "complete" ? "Enter the weight" : null;
  const weight = parseDecimal(text);
  const valid = Number.isFinite(weight) && weight >= 0 && weight <= SET_WEIGHT_MAX_KG;
  return valid ? null : `Enter 0–${SET_WEIGHT_MAX_KG} kg`;
};

const repsProblem = (text: string, check: SetCheck): string | null => {
  if (!text) return check === "complete" ? "Enter the reps" : null;
  const reps = parseInteger(text);
  const valid = Number.isInteger(reps) && reps >= SET_REPS_MIN && reps <= SET_REPS_MAX;
  return valid ? null : `Enter ${SET_REPS_MIN}–${SET_REPS_MAX}`;
};

export const setFieldErrors = (set: DraftSet, check: SetCheck): SetFieldErrors => {
  const weightText = set.weight.trim();
  const repsText = set.reps.trim();
  if (!weightText && !repsText) return { weight: null, reps: null };
  return { weight: weightProblem(weightText, check), reps: repsProblem(repsText, check) };
};

export const hasFieldErrors = (errors: SetFieldErrors): boolean =>
  errors.weight !== null || errors.reps !== null;

export const setStatus = (set: DraftSet): SetStatus => {
  if (!set.weight.trim() && !set.reps.trim()) return "empty";
  return hasFieldErrors(setFieldErrors(set, "complete")) ? "invalid" : "valid";
};

// Entries without a valid set are dropped.
export const toEntries = (draft: WorkoutDraft): WorkoutEntry[] =>
  draft.entries
    .map((entry) => ({
      id: entry.id,
      exerciseId: entry.exerciseId,
      ...(entry.exerciseName ? { exerciseName: entry.exerciseName } : {}),
      ...(entry.muscleGroup ? { muscleGroup: entry.muscleGroup } : {}),
      sets: entry.sets
        .filter((set) => setStatus(set) === "valid")
        .map((set) => ({
          id: set.id,
          weight: parseDecimal(set.weight),
          reps: parseInteger(set.reps),
        })),
    }))
    .filter((entry) => entry.sets.length > 0);

export interface DraftRecord {
  setId: string;
  estimate: number;
  previous: number;
}

// An exercise with no history has nothing to beat, so its first session is not flagged.
export const draftRecord = (entry: DraftEntry, previousBest: number): DraftRecord | null => {
  if (previousBest <= 0) return null;
  let record: DraftRecord | null = null;
  for (const set of entry.sets) {
    if (setStatus(set) !== "valid") continue;
    const estimate = epley1RM(parseDecimal(set.weight), parseInteger(set.reps));
    if (estimate > previousBest && estimate > (record?.estimate ?? 0)) {
      record = { setId: set.id, estimate, previous: previousBest };
    }
  }
  return record;
};
