import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { useWorkout } from "@/hooks/useWorkouts";

export function HistoryEdit({ workoutId }: { workoutId: string }) {
  const { data: workout, isPending, isError } = useWorkout(workoutId);
  if (isPending) return <p role="status" className="py-12 text-muted-foreground">Loading workout…</p>;
  if (isError) return <p role="alert" className="py-12 text-destructive">Could not load workout. Please try again.</p>;
  if (!workout) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Workout not found</h1><Button asChild variant="outline"><Link to="/history">Back to history</Link></Button></div>;
  return <><PageHeader title="Edit workout" /><WorkoutForm key={workout.id} workout={workout} /></>;
}