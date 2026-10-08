import { PageHeader } from "@/components/PageHeader";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { useWorkout } from "@/hooks/useWorkouts";
import { WorkoutNotFound } from "./WorkoutNotFound";

export function HistoryEdit({ workoutId }: { workoutId: string }) {
  const { data: workout, isPending, isError } = useWorkout(workoutId);

  if (isPending) {
    return (
      <p role="status" className="py-12 text-muted-foreground">
        Loading workout…
      </p>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="py-12 text-destructive">
        Could not load workout. Please try again.
      </p>
    );
  }

  if (!workout) return <WorkoutNotFound />;

  return (
    <>
      <PageHeader title="Edit workout" />
      {/* The key resets the form state when navigating between workouts. */}
      <WorkoutForm key={workout.id} workout={workout} />
    </>
  );
}
