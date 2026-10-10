import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import type { Workout } from "@/types/domain";
import { countSets, workoutVolume } from "./calc";
import { toIsoDate } from "./date";

/** A year of weeks; one extra so the same week of last year is still visible. */
export const CALENDAR_WEEKS = 53;

// 0 is a rest day, 4 the busiest kind of day.
export type HeatLevel = 0 | 1 | 2 | 3 | 4;
const MAX_LEVEL = 4;

// A month label closer than this to an edge or to another label would collide or be cut off.
export const LABEL_COLUMNS = 3;

export interface CalendarDay {
  date: string;
  workouts: number;
  sets: number;
  volume: number;
  level: HeatLevel;
  /** After today: shown as an empty slot to keep the last week aligned. */
  future: boolean;
  workoutId?: string;
}

export interface CalendarMonth {
  column: number;
  label: string;
}

export interface TrainingCalendar {
  /** Oldest week first; each week runs Monday to Sunday. */
  weeks: CalendarDay[][];
  months: CalendarMonth[];
  activeDays: number;
}

interface DayTotals {
  workouts: number;
  sets: number;
  volume: number;
  workoutId: string;
}

const totalsByDate = (workouts: readonly Workout[]): Map<string, DayTotals> => {
  const totals = new Map<string, DayTotals>();
  for (const workout of workouts) {
    const day = totals.get(workout.date) ?? {
      workouts: 0,
      sets: 0,
      volume: 0,
      workoutId: workout.id,
    };
    day.workouts += 1;
    day.sets += countSets(workout.entries);
    day.volume += workoutVolume(workout);
    totals.set(workout.date, day);
  }
  return totals;
};

const heatLevel = (sets: number, workouts: number, busiestSets: number): HeatLevel => {
  if (workouts === 0) return 0;
  if (busiestSets === 0) return 1;
  const level = Math.ceil((sets / busiestSets) * MAX_LEVEL);
  return Math.min(MAX_LEVEL, Math.max(1, level)) as HeatLevel;
};

const monthLabels = (mondays: readonly Date[]): CalendarMonth[] => {
  const labels: CalendarMonth[] = [];
  mondays.forEach((monday, column) => {
    const previous = mondays[column - 1];
    const startsMonth = !previous || previous.getMonth() !== monday.getMonth();
    const fitsBeforeRightEdge = column <= mondays.length - LABEL_COLUMNS;
    if (startsMonth && fitsBeforeRightEdge) {
      labels.push({ column, label: format(monday, "MMM") });
    }
  });
  const [first, second] = labels;
  const firstIsCrowded = first && second && second.column - first.column < LABEL_COLUMNS;
  return firstIsCrowded ? labels.slice(1) : labels;
};

export const trainingCalendar = (
  workouts: readonly Workout[],
  today: Date,
  weekCount = CALENDAR_WEEKS,
): TrainingCalendar => {
  const totals = totalsByDate(workouts);
  const todayIso = toIsoDate(today);
  const currentMonday = startOfWeek(today, { weekStartsOn: 1 });
  const mondays = Array.from({ length: weekCount }, (_, index) =>
    addWeeks(currentMonday, index - weekCount + 1),
  );

  const firstDay = mondays[0] ? toIsoDate(mondays[0]) : todayIso;
  const inPeriod = [...totals].filter(([date]) => date >= firstDay && date <= todayIso);
  const busiestSets = Math.max(0, ...inPeriod.map(([, day]) => day.sets));

  const weeks = mondays.map((monday) =>
    Array.from({ length: 7 }, (_, weekday): CalendarDay => {
      const date = toIsoDate(addDays(monday, weekday));
      const day = totals.get(date);
      const future = date > todayIso;
      if (!day || future) {
        return { date, workouts: 0, sets: 0, volume: 0, level: 0, future };
      }
      return {
        date,
        workouts: day.workouts,
        sets: day.sets,
        volume: day.volume,
        level: heatLevel(day.sets, day.workouts, busiestSets),
        future,
        workoutId: day.workoutId,
      };
    }),
  );

  return { weeks, months: monthLabels(mondays), activeDays: inPeriod.length };
};
