import { PageHeader } from "@/components/PageHeader";
import { ErrorState, LoadingState } from "@/components/PageStatus";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { useWorkout } from "@/hooks/useWorkouts";
import { WorkoutNotFound } from "./WorkoutNotFound";

export function HistoryEdit({ workoutId }: { workoutId: string }) {
  const { data: workout, isPending, isError, refetch } = useWorkout(workoutId);

  if (isPending) return <LoadingState label="Loading workout…" />;
  if (isError) {
    return <ErrorState message="Could not load workout." onRetry={() => void refetch()} />;
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
