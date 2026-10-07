import type { Workout, WorkoutSet } from "@/types/domain";
import { epley1RM, workoutVolume } from "./calc";

export interface ExercisePoint {
  date: string;
  topWeight: number;
  /** reps of the heaviest set (most reps on ties) */
  topReps: number;
  bestE1RM: number;
  volume: number;
  sets: number;
  workoutIds: string[];
}

export interface PersonalRecords {
  maxWeight: { value: number; reps: number; date: string };
  bestE1RM: { value: number; weight: number; reps: number; date: string };
  maxVolume: { value: number; date: string };
}

function setsByDate(workouts: Workout[], exerciseId: string) {
  const map = new Map<string, { sets: WorkoutSet[]; workoutIds: string[] }>();
  for (const w of workouts) {
    const sets = w.entries.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets);
    if (sets.length === 0) continue;
    const bucket = map.get(w.date) ?? { sets: [], workoutIds: [] };
    bucket.sets.push(...sets);
    bucket.workoutIds.push(w.id);
    map.set(w.date, bucket);
  }
  return map;
}

/** One point per date containing the exercise, ascending by date. */
export function exerciseHistory(workouts: Workout[], exerciseId: string): ExercisePoint[] {
  return [...setsByDate(workouts, exerciseId)]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sets, workoutIds }]) => {
      let top = sets[0]!;
      for (const s of sets)
        if (s.weight > top.weight || (s.weight === top.weight && s.reps > top.reps)) top = s;
      const volume = workoutVolume({
        id: "",
        date,
        entries: [{ id: "", exerciseId, sets }],
        createdAt: "",
        updatedAt: "",
      });
      return {
        date,
        topWeight: top.weight,
        topReps: top.reps,
        bestE1RM: Math.max(...sets.map((s) => epley1RM(s.weight, s.reps))),
        volume,
        sets: sets.length,
        workoutIds,
      };
    });
}

/** Personal records; earliest date wins ties. */
export function personalRecords(workouts: Workout[], exerciseId: string): PersonalRecords | null {
  const points = [...setsByDate(workouts, exerciseId)].sort(([a], [b]) => a.localeCompare(b));
  if (points.length === 0) return null;
  let maxWeight: PersonalRecords["maxWeight"] | null = null;
  let best: PersonalRecords["bestE1RM"] | null = null;
  let maxVolume: PersonalRecords["maxVolume"] | null = null;
  for (const [date, { sets }] of points) {
    for (const s of sets) {
      if (
        !maxWeight ||
        s.weight > maxWeight.value ||
        (s.weight === maxWeight.value && date === maxWeight.date && s.reps > maxWeight.reps)
      )
        maxWeight = { value: s.weight, reps: s.reps, date };
      const e = epley1RM(s.weight, s.reps);
      if (!best || e > best.value) best = { value: e, weight: s.weight, reps: s.reps, date };
    }
    const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    if (!maxVolume || volume > maxVolume.value) maxVolume = { value: volume, date };
  }
  return { maxWeight: maxWeight!, bestE1RM: best!, maxVolume: maxVolume! };
}
