import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  LABEL_COLUMNS,
  type CalendarDay,
  type HeatLevel,
  type TrainingCalendar as Calendar,
} from "@/lib/calendar";
import { formatDay } from "@/lib/date";
import { formatNumber } from "@/lib/number";
import { cn } from "@/lib/utils";

const LEVEL_CLASS: Record<HeatLevel, string> = {
  0: "bg-muted",
  1: "bg-primary/25",
  2: "bg-primary/50",
  3: "bg-primary/75",
  4: "bg-primary",
};
const LEVELS: HeatLevel[] = [0, 1, 2, 3, 4];

/** Only every other weekday is labelled, as the rows are too short for all seven. */
const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

/** Grid rows and columns are 1-based, and the first of each holds the labels. */
const LABEL_OFFSET = 2;

const CELL = "aspect-square rounded-[2px]";

const dayLabel = (day: CalendarDay): string => {
  const date = formatDay(day.date);
  if (day.workouts === 0) return `${date}: rest day`;
  const sets = `${day.sets} ${day.sets === 1 ? "set" : "sets"}`;
  return `${date}: ${sets}, ${formatNumber(day.volume)} kg`;
};

function DayCell({ day, column, row }: { day: CalendarDay; column: number; row: number }) {
  const style = { gridColumn: column, gridRow: row };
  if (day.future) return <div style={style} />;

  const label = dayLabel(day);
  const className = cn(CELL, LEVEL_CLASS[day.level]);
  if (!day.workoutId) return <div style={style} className={className} title={label} />;
  return (
    <Link
      to="/history/$workoutId"
      params={{ workoutId: day.workoutId }}
      style={style}
      className={cn(className, "hover:ring-1 hover:ring-ring")}
      title={label}
      aria-label={label}
    />
  );
}

export function TrainingCalendar({ calendar }: { calendar: Calendar }) {
  const { weeks, months, activeDays } = calendar;
  const scroller = useRef<HTMLDivElement>(null);

  // On phones the grid is wider than the screen: keep it scrolled to the right, on the
  // current week, when the page opens and whenever the available width changes.
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const scrollToCurrentWeek = () => {
      element.scrollLeft = element.scrollWidth;
    };
    scrollToCurrentWeek();
    const observer = new ResizeObserver(scrollToCurrentWeek);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={scroller} className="overflow-x-auto pb-1">
        <div
          className="grid min-w-[640px] gap-[2px] text-[10px] leading-none text-muted-foreground"
          style={{ gridTemplateColumns: `auto repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {months.map((month) => (
            <span
              key={`${month.label}-${month.column}`}
              className="pb-1"
              style={{
                gridColumn: `${month.column + LABEL_OFFSET} / span ${LABEL_COLUMNS}`,
                gridRow: 1,
              }}
            >
              {month.label}
            </span>
          ))}
          {WEEKDAY_LABELS.map((label, weekday) => (
            <span
              key={weekday}
              className="flex items-center pr-1"
              style={{ gridColumn: 1, gridRow: weekday + LABEL_OFFSET }}
            >
              {label}
            </span>
          ))}
          {weeks.map((week, column) =>
            week.map((day, weekday) => (
              <DayCell
                key={day.date}
                day={day}
                column={column + LABEL_OFFSET}
                row={weekday + LABEL_OFFSET}
              />
            )),
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular">
          {activeDays} training {activeDays === 1 ? "day" : "days"} in the last year
        </span>
        <span className="flex items-center gap-1" aria-hidden="true">
          Less
          {LEVELS.map((level) => (
            <span key={level} className={cn("size-2.5 rounded-[2px]", LEVEL_CLASS[level])} />
          ))}
          More
        </span>
      </div>
    </>
  );
}
