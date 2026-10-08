import { describe, expect, it } from "vitest";
import type { Exercise, Workout } from "@/types/domain";
import { countSets, entriesVolume } from "./calc";
import { DELETED_EXERCISE_NAME, exerciseLabel, isSameExercise, workoutStats } from "./workout";

const bench: Exercise = { id: "bench", name: "Bench Press", muscleGroup: "Chest", isCustom: false };

const workout: Workout = {
  id: "w1",
  date: "2026-10-05",
  createdAt: "",
  updatedAt: "",
  entries: [
    {
      id: "e1",
      exerciseId: "bench",
      sets: [
        { id: "s1", weight: 100, reps: 5 },
        { id: "s2", weight: 90, reps: 8 },
      ],
    },
    { id: "e2", exerciseId: "squat", sets: [{ id: "s3", weight: 120, reps: 5 }] },
  ],
};

describe("countSets", () => {
  it("counts sets across entries", () => {
    expect(countSets(workout.entries)).toBe(3);
    expect(countSets([])).toBe(0);
    expect(countSets([{ sets: [] }])).toBe(0);
  });
});

describe("entriesVolume", () => {
  it("sums weight × reps across every entry", () => {
    expect(entriesVolume(workout.entries)).toBe(100 * 5 + 90 * 8 + 120 * 5);
    expect(entriesVolume([])).toBe(0);
  });
});

describe("workoutStats", () => {
  it("returns exercise count, set count and volume", () => {
    expect(workoutStats(workout)).toEqual({ exercises: 2, sets: 3, volume: 1820 });
  });
});

describe("exerciseLabel", () => {
  it("prefers the live library exercise", () => {
    const entry = { exerciseId: "bench", exerciseName: "Old name", muscleGroup: "Arms" as const };
    expect(exerciseLabel(entry, [bench])).toEqual({ name: "Bench Press", group: "Chest" });
  });

  it("falls back to the name stored on the entry", () => {
    const entry = { exerciseId: "gone", exerciseName: "Old Lift", muscleGroup: "Legs" as const };
    expect(exerciseLabel(entry, [bench])).toEqual({ name: "Old Lift", group: "Legs" });
  });

  it("uses a placeholder when nothing is known", () => {
    expect(exerciseLabel({ exerciseId: "gone" }, [])).toEqual({
      name: DELETED_EXERCISE_NAME,
      group: undefined,
    });
  });
});

describe("isSameExercise", () => {
  it("ignores case but not the muscle group", () => {
    expect(isSameExercise(bench, "bench press", "Chest")).toBe(true);
    expect(isSameExercise(bench, "Bench Press", "Arms")).toBe(false);
    expect(isSameExercise(bench, "Bench", "Chest")).toBe(false);
  });
});
