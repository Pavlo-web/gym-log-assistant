import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useExercises } from "@/hooks/useExercises";
import { useWorkouts } from "@/hooks/useWorkouts";
import { formatMonth } from "@/lib/date";
import type { Workout } from "@/types/domain";
import { WorkoutListItem } from "./WorkoutListItem";

/** Groups workouts under "October 2026"-style headings, keeping their order. */
function groupByMonth(workouts: readonly Workout[]): [string, Workout[]][] {
  const months = new Map<string, Workout[]>();
  for (const workout of workouts) {
    const month = formatMonth(workout.date);
    months.set(month, [...(months.get(month) ?? []), workout]);
  }
  return [...months];
}

export function HistoryList() {
  const workouts = useWorkouts();
  const exercises = useExercises();

  if (workouts.isPending || exercises.isPending) {
    return (
      <>
        <PageHeader title="History" />
        <p role="status" className="py-12 text-center text-muted-foreground">
          Loading workouts…
        </p>
      </>
    );
  }

  if (workouts.isError || exercises.isError) {
    return (
      <>
        <PageHeader title="History" />
        <p role="alert" className="py-12 text-center text-destructive">
          Could not load history. Please try again.
        </p>
      </>
    );
  }

  if (workouts.data.length === 0) {
    return (
      <>
        <PageHeader title="History" />
        <div className="py-16 text-center">
          <p className="mb-5 text-muted-foreground">No workouts yet.</p>
          <Button asChild>
            <Link to="/">Log a workout</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="History" />
      {groupByMonth(workouts.data).map(([month, items]) => (
        <section key={month} className="mb-10">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">{month}</h2>
          <div className="space-y-3">
            {items.map((workout) => (
              <WorkoutListItem key={workout.id} workout={workout} exercises={exercises.data} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
