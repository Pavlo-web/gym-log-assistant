import { differenceInCalendarDays } from "date-fns";
import { parseLocalDate, parseLocalDateTime, toIsoDate } from "@/lib/date";
import { newId } from "@/lib/id";
import type { PlannedWorkout, WorkoutDraft } from "@/types/domain";

export const UNTITLED_PLAN = "Workout";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

const plural = (count: number, unit: string): string => `${count} ${unit}${count === 1 ? "" : "s"}`;

export interface Countdown {
  due: boolean;
  /** "in 2 days", "Tomorrow", "in 3 hours", "in 20 minutes", "Ready to start" or "Overdue". */
  label: string;
}

export const countdown = (plan: Pick<PlannedWorkout, "date" | "time">, now: Date): Countdown => {
  const left = parseLocalDateTime(plan.date, plan.time).getTime() - now.getTime();
  const days = differenceInCalendarDays(parseLocalDate(plan.date), now);

  if (left <= 0) return { due: true, label: days < 0 ? "Overdue" : "Ready to start" };
  if (days === 1) return { due: false, label: "Tomorrow" };
  if (days > 1) return { due: false, label: `in ${plural(days, "day")}` };
  if (left >= HOUR_MS)
    return { due: false, label: `in ${plural(Math.floor(left / HOUR_MS), "hour")}` };
  return { due: false, label: `in ${plural(Math.max(1, Math.ceil(left / MINUTE_MS)), "minute")}` };
};

// Dated the day it is actually done: the log has no future dates.
export const draftFromPlan = (plan: PlannedWorkout, now: Date): WorkoutDraft => ({
  date: toIsoDate(now),
  notes: plan.title ?? "",
  planId: plan.id,
  entries: plan.exercises.map((exercise) => ({
    id: newId(),
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    muscleGroup: exercise.muscleGroup,
    sets: [{ id: newId(), weight: "", reps: "" }],
  })),
});
