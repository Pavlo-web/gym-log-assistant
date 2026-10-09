import { epley1RM } from "@/lib/calc";
import { todayLocal } from "@/lib/date";
import { SET_REPS_MAX, SET_REPS_MIN, SET_WEIGHT_MAX_KG } from "@/lib/limits";
import { parseDecimal, parseInteger } from "@/lib/number";
import type { DraftEntry, DraftSet, Workout, WorkoutDraft, WorkoutEntry } from "@/types/domain";

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

function weightProblem(text: string): string | null {
  const weight = parseDecimal(text);
  const valid = Number.isFinite(weight) && weight >= 0 && weight <= SET_WEIGHT_MAX_KG;
  return valid ? null : `Weight must be 0–${SET_WEIGHT_MAX_KG} kg.`;
}

function repsProblem(text: string): string | null {
  const reps = parseInteger(text);
  const valid = Number.isInteger(reps) && reps >= SET_REPS_MIN && reps <= SET_REPS_MAX;
  return valid ? null : `Reps must be a whole number ${SET_REPS_MIN}–${SET_REPS_MAX}.`;
}

/** Validation message for a set, or null when it is valid or still untouched. */
export function setError(set: DraftSet): string | null {
  const weightText = set.weight.trim();
  const repsText = set.reps.trim();
  if (!weightText && !repsText) return null;
  return weightProblem(weightText) ?? repsProblem(repsText);
}

/**
 * Message for a value that is typed in but not acceptable, shown while typing.
 * A field that is still empty is not reported here: the user may simply not
 * have reached it yet, so that is left to `setError` when saving.
 */
export function setInputError(set: DraftSet): string | null {
  const weightText = set.weight.trim();
  const repsText = set.reps.trim();
  return (
    (weightText ? weightProblem(weightText) : null) ?? (repsText ? repsProblem(repsText) : null)
  );
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

/** A set in the form that beats the previous best estimated 1RM of its exercise. */
export interface DraftRecord {
  setId: string;
  /** Estimated 1RM of the record set, in kg. */
  estimate: number;
  /** The best estimate it beats, in kg. */
  previous: number;
}

/**
 * The record set of a draft entry, if any: its best valid set, when that beats
 * `previousBest`. An exercise with no history has nothing to beat, so its
 * first session is not flagged.
 */
export function draftRecord(entry: DraftEntry, previousBest: number): DraftRecord | null {
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
}
