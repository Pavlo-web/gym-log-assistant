import { addWeeks, format, startOfMonth, startOfWeek, subDays } from "date-fns";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup, type Workout } from "@/types/domain";
import { workoutVolume } from "./calc";
import { personalRecords } from "./progress";

const WEEK = { weekStartsOn: 1 } as const;

/** Parses yyyy-mm-dd as a local date. */
function localDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1);
}

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

/** Monday (yyyy-mm-dd) of the week containing the given date. */
export function weekStart(date: string | Date): string {
  return ymd(startOfWeek(typeof date === "string" ? localDate(date) : date, WEEK));
}

export interface WeekBucket {
  week: string;
  volume: number;
  workouts: number;
}

/** Last `count` weeks ending with the current week, oldest first; empty weeks are zero. */
export function weeklyBuckets(workouts: Workout[], today: Date, count = 8): WeekBucket[] {
  const current = startOfWeek(today, WEEK);
  const buckets = Array.from({ length: count }, (_, i) => ({
    week: ymd(addWeeks(current, i - count + 1)),
    volume: 0,
    workouts: 0,
  }));
  const byWeek = new Map(buckets.map((b) => [b.week, b]));
  for (const w of workouts) {
    const b = byWeek.get(weekStart(w.date));
    if (!b) continue;
    b.volume += workoutVolume(w);
    b.workouts += 1;
  }
  return buckets;
}

/** Consecutive weeks with a workout, counting back from this week (or last week if this week is still empty). */
export function weeklyStreak(workouts: Workout[], today: Date): number {
  const weeks = new Set(workouts.map((w) => weekStart(w.date)));
  let cursor = startOfWeek(today, WEEK);
  if (!weeks.has(ymd(cursor))) cursor = addWeeks(cursor, -1);
  let streak = 0;
  while (weeks.has(ymd(cursor))) {
    streak += 1;
    cursor = addWeeks(cursor, -1);
  }
  return streak;
}

export function workoutsThisMonth(workouts: Workout[], today: Date): number {
  const from = ymd(startOfMonth(today));
  const to = ymd(today);
  return workouts.filter((w) => w.date >= from && w.date <= to).length;
}

/** Sets per muscle group over the last `days` days (including today); all six groups, zeros included. */
export function muscleGroupSplit(
  workouts: Workout[],
  exercises: Exercise[],
  today: Date,
  days = 30,
): { group: MuscleGroup; sets: number }[] {
  const from = ymd(subDays(today, days - 1));
  const to = ymd(today);
  const live = new Map(exercises.map((e) => [e.id, e.muscleGroup]));
  const counts = new Map<MuscleGroup, number>(MUSCLE_GROUPS.map((g) => [g, 0]));
  for (const w of workouts) {
    if (w.date < from || w.date > to) continue;
    for (const e of w.entries) {
      const group = live.get(e.exerciseId) ?? e.muscleGroup;
      if (group) counts.set(group, (counts.get(group) ?? 0) + e.sets.length);
    }
  }
  return MUSCLE_GROUPS.map((group) => ({ group, sets: counts.get(group) ?? 0 }));
}

export interface RecentPR {
  exerciseId: string;
  name: string;
  value: number;
  weight: number;
  reps: number;
  date: string;
}

/** Sessions that set a new best estimated 1RM for their exercise, newest first. */
export function recentPRs(workouts: Workout[], exercises: Exercise[], limit = 5): RecentPR[] {
  const names = new Map<string, string>();
  for (const w of workouts) for (const e of w.entries) if (e.exerciseName && !names.has(e.exerciseId)) names.set(e.exerciseId, e.exerciseName);
  for (const e of exercises) names.set(e.id, e.name);
  const dates = [...new Set(workouts.map((w) => w.date))].sort();
  const result: RecentPR[] = [];
  for (const exerciseId of names.keys()) {
    for (const date of dates) {
      const upTo = workouts.filter((w) => w.date <= date);
      const best = personalRecords(upTo, exerciseId)?.bestE1RM;
      if (best && best.date === date && best.value > 0) {
        result.push({ exerciseId, name: names.get(exerciseId) ?? "Deleted exercise", value: best.value, weight: best.weight, reps: best.reps, date });
      }
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date) || b.value - a.value).slice(0, limit);
}

