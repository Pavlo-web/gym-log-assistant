import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { formatWeekdayDay } from "@/lib/date";
import { formatNumber } from "@/lib/number";
import { workoutStats } from "@/lib/workout";
import type { Workout } from "@/types/domain";

export function RecentWorkouts({ workouts }: { workouts: Workout[] }) {
  return (
    <ul className="divide-y divide-border text-sm">
      {workouts.map((workout) => {
        const stats = workoutStats(workout);
        return (
          <li key={workout.id}>
            <Link
              to="/history/$workoutId"
              params={{ workoutId: workout.id }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2.5 md:flex md:justify-between md:gap-4 hover:text-primary"
            >
              <span className="font-medium">{formatWeekdayDay(workout.date)}</span>
              <span className="flex min-w-0 flex-wrap items-center gap-3 text-muted-foreground tabular md:gap-4">
                <span>{stats.exercises} ex</span>
                <span>
                  {stats.sets} {stats.sets === 1 ? "set" : "sets"}
                </span>
                <span className="text-foreground">{formatNumber(stats.volume)} kg</span>
                <ChevronRight className="size-4" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
