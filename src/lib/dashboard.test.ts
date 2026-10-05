import { describe, expect, it } from "vitest";
import type { Exercise, Workout } from "@/types/domain";
import {
  muscleGroupSplit,
  recentPRs,
  weekStart,
  weeklyBuckets,
  weeklyStreak,
  workoutsThisMonth,
} from "./dashboard";

const bench: Exercise = { id: "b", name: "Bench Press", muscleGroup: "Chest", isCustom: false };
let n = 0;
function w(
  date: string,
  exerciseId = "b",
  sets: [number, number][] = [[100, 5]],
  extra: Partial<Workout["entries"][number]> = {},
): Workout {
  n += 1;
  return {
    id: `w${n}`,
    date,
    createdAt: "",
    updatedAt: "",
    entries: [
      {
        id: `e${n}`,
        exerciseId,
        ...extra,
        sets: sets.map(([weight, reps], i) => ({ id: `s${n}-${i}`, weight, reps })),
      },
    ],
  };
}
const today = new Date(2026, 9, 7); // Wed 7 Oct 2026

describe("weekStart", () => {
  it("uses Monday as the week boundary", () => {
    expect(weekStart("2026-10-04")).toBe("2026-09-28"); // Sunday belongs to previous week
    expect(weekStart("2026-10-05")).toBe("2026-10-05"); // Monday starts a new week
  });
});

describe("weeklyBuckets", () => {
  it("returns zero-filled weeks for no data", () => {
    const b = weeklyBuckets([], today);
    expect(b).toHaveLength(8);
    expect(b.every((x) => x.volume === 0 && x.workouts === 0)).toBe(true);
    expect(b.at(-1)?.week).toBe("2026-10-05");
    expect(b[0]?.week).toBe("2026-08-17");
  });
  it("sums volume into the right Monday-based week", () => {
    const b = weeklyBuckets([w("2026-10-04"), w("2026-10-05"), w("2026-10-06")], today);
    expect(b.at(-1)).toMatchObject({ volume: 1000, workouts: 2 });
    expect(b.at(-2)).toMatchObject({ volume: 500, workouts: 1 });
  });
});

describe("weeklyStreak", () => {
  it("is zero with no workouts", () => expect(weeklyStreak([], today)).toBe(0));
  it("counts consecutive weeks and tolerates an empty current week", () => {
    expect(weeklyStreak([w("2026-10-06"), w("2026-09-30"), w("2026-09-14")], today)).toBe(2);
    expect(weeklyStreak([w("2026-10-04"), w("2026-09-21")], today)).toBe(2);
  });
});

it("counts workouts this month", () => {
  expect(workoutsThisMonth([w("2026-10-01"), w("2026-09-30")], today)).toBe(1);
  expect(workoutsThisMonth([], today)).toBe(0);
});

describe("muscleGroupSplit", () => {
  it("includes all groups with zeros and uses snapshots for deleted exercises", () => {
    const split = muscleGroupSplit(
      [
        w("2026-10-01", "b", [
          [1, 1],
          [1, 1],
        ]),
        w("2026-10-02", "gone", [[1, 1]], { muscleGroup: "Legs" }),
        w("2026-08-01"),
      ],
      [bench],
      today,
    );
    expect(split).toHaveLength(6);
    expect(split.find((s) => s.group === "Chest")?.sets).toBe(2);
    expect(split.find((s) => s.group === "Legs")?.sets).toBe(1);
    expect(split.find((s) => s.group === "Core")?.sets).toBe(0);
  });
});

describe("recentPRs", () => {
  it("is empty without workouts", () => expect(recentPRs([], [bench])).toEqual([]));
  it("lists sessions that beat the previous best, newest first, with snapshot names", () => {
    const prs = recentPRs(
      [
        w("2026-09-01", "b", [[80, 5]]),
        w("2026-09-08", "b", [[75, 5]]),
        w("2026-09-15", "b", [[90, 5]]),
        w("2026-09-10", "gone", [[50, 1]], { exerciseName: "Old Lift" }),
      ],
      [bench],
    );
    expect(prs.map((p) => [p.name, p.date, p.weight])).toEqual([
      ["Bench Press", "2026-09-15", 90],
      ["Old Lift", "2026-09-10", 50],
      ["Bench Press", "2026-09-01", 80],
    ]);
  });
});
