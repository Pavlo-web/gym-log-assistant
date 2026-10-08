import { Link } from "@tanstack/react-router";
import { History } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, LoadingState } from "@/components/PageStatus";
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
        <LoadingState label="Loading workouts…" />
      </>
    );
  }

  if (workouts.isError || exercises.isError) {
    return (
      <>
        <PageHeader title="History" />
        <ErrorState
          message="Could not load history."
          onRetry={() => {
            void workouts.refetch();
            void exercises.refetch();
          }}
        />
      </>
    );
  }

  if (workouts.data.length === 0) {
    return (
      <>
        <PageHeader title="History" />
        <EmptyState
          icon={History}
          title="No workouts yet"
          description="Workouts you save will be listed here."
        >
          <Button asChild className="mt-5">
            <Link to="/">Log a workout</Link>
          </Button>
        </EmptyState>
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
