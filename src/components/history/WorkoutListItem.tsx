import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { formatWeekdayDay } from "@/lib/date";
import { exerciseLabel, workoutStats } from "@/lib/workout";
import type { Exercise, Workout } from "@/types/domain";
import { WorkoutStats } from "./WorkoutStats";

/** Exercise names shown on a card before the rest collapse into "+N more". */
const PREVIEW_EXERCISES = 3;

interface WorkoutListItemProps {
  workout: Workout;
  exercises: Exercise[];
}

/** Card for one workout in the history list; links to its details page. */
export function WorkoutListItem({ workout, exercises }: WorkoutListItemProps) {
  const names = workout.entries
    .slice(0, PREVIEW_EXERCISES)
    .map((entry) => exerciseLabel(entry, exercises).name);
  const hidden = workout.entries.length - names.length;

  return (
    <Link
      to="/history/$workoutId"
      params={{ workoutId: workout.id }}
      className="block rounded-md border border-border bg-card p-3 md:p-5 transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="grid grid-cols-1 items-center gap-3 md:flex md:flex-wrap md:justify-between md:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-semibold">{formatWeekdayDay(workout.date)}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {names.join(", ")}
            {hidden > 0 ? ` +${hidden} more` : ""}
          </p>
        </div>
        <div className="grid grid-cols-[1fr_1fr_minmax(0,1.7fr)_auto] items-center gap-2 text-right text-sm tabular md:flex md:gap-5">
          <WorkoutStats stats={workoutStats(workout)} />
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}
