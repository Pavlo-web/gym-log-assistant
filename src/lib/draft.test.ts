import { describe, expect, it } from "vitest";
import type { DraftSet, Workout, WorkoutDraft } from "@/types/domain";
import { draftFromWorkout, setError, setStatus, toEntries } from "./draft";

function set(weight: string, reps: string): DraftSet {
  return { id: "s", weight, reps };
}

describe("setError / setStatus", () => {
  it("treats an untouched set as empty, not invalid", () => {
    expect(setError(set("", ""))).toBeNull();
    expect(setStatus(set(" ", ""))).toBe("empty");
  });

  it("accepts dot and comma decimals for weight", () => {
    expect(setStatus(set("82.5", "5"))).toBe("valid");
    expect(setStatus(set("82,5", "5"))).toBe("valid");
    expect(setStatus(set("0", "1"))).toBe("valid");
  });

  it("rejects missing, out-of-range or non-numeric weight", () => {
    for (const weight of ["", "abc", "-1", "1000.5"]) {
      expect(setError(set(weight, "5"))).toBe("Weight must be 0–1000 kg.");
    }
  });

  it("rejects missing, fractional or out-of-range reps", () => {
    for (const reps of ["", "0", "2.5", "101", "x"]) {
      expect(setError(set("100", reps))).toBe("Reps must be a whole number 1–100.");
    }
  });
});

describe("toEntries", () => {
  it("keeps valid sets, parses them and drops entries left without sets", () => {
    const draft: WorkoutDraft = {
      date: "2026-10-05",
      notes: "",
      entries: [
        {
          id: "e1",
          exerciseId: "bench",
          exerciseName: "Bench Press",
          muscleGroup: "Chest",
          sets: [
            { id: "s1", weight: "82,5", reps: "5" },
            { id: "s2", weight: "", reps: "" },
            { id: "s3", weight: "abc", reps: "5" },
          ],
        },
        { id: "e2", exerciseId: "squat", sets: [{ id: "s4", weight: "", reps: "" }] },
      ],
    };
    expect(toEntries(draft)).toEqual([
      {
        id: "e1",
        exerciseId: "bench",
        exerciseName: "Bench Press",
        muscleGroup: "Chest",
        sets: [{ id: "s1", weight: 82.5, reps: 5 }],
      },
    ]);
  });
});

describe("draftFromWorkout", () => {
  it("turns a saved workout into editable text fields and back", () => {
    const workout: Workout = {
      id: "w1",
      date: "2026-10-05",
      createdAt: "",
      updatedAt: "",
      entries: [{ id: "e1", exerciseId: "bench", sets: [{ id: "s1", weight: 82.5, reps: 5 }] }],
    };
    const draft = draftFromWorkout(workout);
    expect(draft).toMatchObject({ date: "2026-10-05", notes: "" });
    expect(draft.entries[0]?.sets[0]).toEqual({ id: "s1", weight: "82.5", reps: "5" });
    expect(toEntries(draft)).toEqual(workout.entries);
  });
});
