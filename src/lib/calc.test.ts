import { describe, expect, it } from "vitest";
import { setsVolume, workoutVolume } from "./calc";

describe("setsVolume", () => {
  it("sums weight × reps", () => {
    expect(
      setsVolume([
        { id: "a", weight: 100, reps: 5 },
        { id: "b", weight: 0, reps: 10 },
      ]),
    ).toBe(500);
    expect(setsVolume([])).toBe(0);
  });
  it("matches workoutVolume", () => {
    const sets = [{ id: "a", weight: 82.5, reps: 4 }];
    expect(
      workoutVolume({
        id: "w",
        date: "2026-10-01",
        createdAt: "",
        updatedAt: "",
        entries: [{ id: "e", exerciseId: "x", sets }],
      }),
    ).toBe(setsVolume(sets));
  });
});
