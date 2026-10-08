import { todayLocal } from "@/lib/date";
import { SET_REPS_MAX, SET_REPS_MIN, SET_WEIGHT_MAX_KG } from "@/lib/limits";
import { parseDecimal, parseInteger } from "@/lib/number";
import type { DraftSet, Workout, WorkoutDraft, WorkoutEntry } from "@/types/domain";

export type SetStatus = "empty" | "valid" | "invalid";

export function emptyDraft(): WorkoutDraft {
  return { date: todayLocal(), notes: "", entries: [] };
}

/** A draft the user has not touched: no exercises, no notes and today's date. */
export function isDraftEmpty(draft: WorkoutDraft): boolean {
  return draft.entries.length === 0 && draft.notes.trim() === "" && draft.date === todayLocal();
}

/** Turns a saved workout back into editable form state. */
export function draftFromWorkout(workout: Workout): WorkoutDraft {
  return {
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
  };
}

/** Validation message for a set, or null when it is valid or still untouched. */
export function setError(set: DraftSet): string | null {
  const weightText = set.weight.trim();
  const repsText = set.reps.trim();
  if (!weightText && !repsText) return null;

  const weight = parseDecimal(weightText);
  if (!Number.isFinite(weight) || weight < 0 || weight > SET_WEIGHT_MAX_KG) {
    return `Weight must be 0–${SET_WEIGHT_MAX_KG} kg.`;
  }
  const reps = parseInteger(repsText);
  if (!Number.isInteger(reps) || reps < SET_REPS_MIN || reps > SET_REPS_MAX) {
    return `Reps must be a whole number ${SET_REPS_MIN}–${SET_REPS_MAX}.`;
  }
  return null;
}

export function setStatus(set: DraftSet): SetStatus {
  if (!set.weight.trim() && !set.reps.trim()) return "empty";
  return setError(set) ? "invalid" : "valid";
}

/** Converts valid sets into domain entries; entries without valid sets are dropped. */
export function toEntries(draft: WorkoutDraft): WorkoutEntry[] {
  return draft.entries
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
}
