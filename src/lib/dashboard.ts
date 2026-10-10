import { addWeeks, startOfMonth, startOfWeek, subDays } from "date-fns";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup, type Workout } from "@/types/domain";
import { workoutVolume } from "./calc";
import { parseLocalDate, toIsoDate } from "./date";
import { personalRecords } from "./progress";
import { DELETED_EXERCISE_NAME } from "./workout";

/** Weeks start on Monday throughout the app. */
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

export const DASHBOARD_WEEKS = 8;
export const MUSCLE_SPLIT_DAYS = 30;
export const RECENT_ITEMS = 5;

export interface WeekBucket {
  week: string;
  volume: number;
  workouts: number;
}

export interface MuscleGroupSets {
  group: MuscleGroup;
  sets: number;
}

export interface RecentPR {
  exerciseId: string;
  name: string;
  value: number;
  weight: number;
  reps: number;
  date: string;
}

export const weekStart = (date: string | Date): string => {
  const day = typeof date === "string" ? parseLocalDate(date) : date;
  return toIsoDate(startOfWeek(day, WEEK_OPTIONS));
};

export const weeklyBuckets = (
  workouts: readonly Workout[],
  today: Date,
  count = DASHBOARD_WEEKS,
): WeekBucket[] => {
  const currentWeek = startOfWeek(today, WEEK_OPTIONS);
  const buckets: WeekBucket[] = Array.from({ length: count }, (_, index) => ({
    week: toIsoDate(addWeeks(currentWeek, index - count + 1)),
    volume: 0,
    workouts: 0,
  }));
  const byWeek = new Map(buckets.map((bucket) => [bucket.week, bucket]));

  for (const workout of workouts) {
    const bucket = byWeek.get(weekStart(workout.date));
    if (!bucket) continue;
    bucket.volume += workoutVolume(workout);
    bucket.workouts += 1;
  }
  return buckets;
};

// A week not trained yet does not break the streak: counting then starts from last week.
export const weeklyStreak = (workouts: readonly Workout[], today: Date): number => {
  const trainedWeeks = new Set(workouts.map((workout) => weekStart(workout.date)));
  let cursor = startOfWeek(today, WEEK_OPTIONS);
  if (!trainedWeeks.has(toIsoDate(cursor))) cursor = addWeeks(cursor, -1);

  let streak = 0;
  while (trainedWeeks.has(toIsoDate(cursor))) {
    streak += 1;
    cursor = addWeeks(cursor, -1);
  }
  return streak;
};

export const workoutsThisMonth = (workouts: readonly Workout[], today: Date): number => {
  const from = toIsoDate(startOfMonth(today));
  const to = toIsoDate(today);
  return workouts.filter((workout) => workout.date >= from && workout.date <= to).length;
};

export const muscleGroupSplit = (
  workouts: readonly Workout[],
  exercises: readonly Exercise[],
  today: Date,
  days = MUSCLE_SPLIT_DAYS,
): MuscleGroupSets[] => {
  const from = toIsoDate(subDays(today, days - 1));
  const to = toIsoDate(today);
  const liveGroups = new Map(exercises.map((exercise) => [exercise.id, exercise.muscleGroup]));
  const counts = new Map<MuscleGroup, number>(MUSCLE_GROUPS.map((group) => [group, 0]));

  for (const workout of workouts) {
    if (workout.date < from || workout.date > to) continue;
    for (const entry of workout.entries) {
      const group = liveGroups.get(entry.exerciseId) ?? entry.muscleGroup;
      if (group) counts.set(group, (counts.get(group) ?? 0) + entry.sets.length);
    }
  }
  return MUSCLE_GROUPS.map((group) => ({ group, sets: counts.get(group) ?? 0 }));
};

const exerciseNames = (
  workouts: readonly Workout[],
  exercises: readonly Exercise[],
): Map<string, string> => {
  const names = new Map<string, string>();
  for (const workout of workouts) {
    for (const entry of workout.entries) {
      if (entry.exerciseName && !names.has(entry.exerciseId)) {
        names.set(entry.exerciseId, entry.exerciseName);
      }
    }
  }
  for (const exercise of exercises) names.set(exercise.id, exercise.name);
  return names;
};

// The first session of an exercise counts as a record.
export const recentPRs = (
  workouts: readonly Workout[],
  exercises: readonly Exercise[],
  limit = RECENT_ITEMS,
): RecentPR[] => {
  const names = exerciseNames(workouts, exercises);
  const dates = [...new Set(workouts.map((workout) => workout.date))].sort();
  const records: RecentPR[] = [];

  for (const [exerciseId, name] of names) {
    for (const date of dates) {
      const upToDate = workouts.filter((workout) => workout.date <= date);
      const best = personalRecords(upToDate, exerciseId)?.bestE1RM;
      if (!best || best.date !== date || best.value <= 0) continue;
      records.push({
        exerciseId,
        name: name || DELETED_EXERCISE_NAME,
        value: best.value,
        weight: best.weight,
        reps: best.reps,
        date,
      });
    }
  }
  return records.sort((a, b) => b.date.localeCompare(a.date) || b.value - a.value).slice(0, limit);
};
