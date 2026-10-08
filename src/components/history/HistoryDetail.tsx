import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkoutSummary } from "@/components/workout/WorkoutSummary";
import { useExercises } from "@/hooks/useExercises";
import { useWorkout } from "@/hooks/useWorkouts";
import { formatLongDay } from "@/lib/date";
import { exerciseLabel } from "@/lib/workout";
import { DeleteWorkoutDialog } from "./DeleteWorkoutDialog";
import { ExerciseSetsTable } from "./ExerciseSetsTable";
import { WorkoutNotFound } from "./WorkoutNotFound";

export function HistoryDetail({ workoutId }: { workoutId: string }) {
  const workout = useWorkout(workoutId);
  const exercises = useExercises();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (workout.isPending || exercises.isPending) {
    return (
      <p role="status" className="py-12 text-muted-foreground">
        Loading workout…
      </p>
    );
  }

  if (workout.isError || exercises.isError) {
    return (
      <p role="alert" className="py-12 text-destructive">
        Could not load workout. Please try again.
      </p>
    );
  }

  if (!workout.data) return <WorkoutNotFound />;
  const { date, notes, entries } = workout.data;

  return (
    <>
      <Button asChild variant="ghost" className="mb-5 -ml-3">
        <Link to="/history">
          <ArrowLeft /> Back to history
        </Link>
      </Button>

      <div className="mb-6 grid min-w-0 grid-cols-1 items-start gap-4 md:flex md:flex-wrap md:justify-between">
        <div className="min-w-0 break-words">
          <h1 className="text-xl font-semibold md:text-2xl">{formatLongDay(date)}</h1>
          {notes && <p className="mt-2 text-sm text-muted-foreground">{notes}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <Button asChild variant="outline">
            <Link to="/history/$workoutId/edit" params={{ workoutId }}>
              <Pencil /> Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 /> Delete
          </Button>
        </div>
      </div>

      <WorkoutSummary entries={entries} exerciseCount={entries.length} />

      <div className="mt-6 space-y-4">
        {entries.map((entry) => {
          const label = exerciseLabel(entry, exercises.data);
          return (
            <section key={entry.id} className="rounded-md border border-border bg-card p-3 md:p-5">
              <h2 className="font-semibold">{label.name}</h2>
              <p className="mb-4 text-xs text-muted-foreground">{label.group}</p>
              <ExerciseSetsTable sets={entry.sets} />
            </section>
          );
        })}
      </div>

      <DeleteWorkoutDialog
        workoutId={workoutId}
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
      />
    </>
  );
}
