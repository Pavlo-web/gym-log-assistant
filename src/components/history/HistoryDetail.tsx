import { SectionTitle } from "@/components/SectionTitle";
import { Surface } from "@/components/Surface";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/PageStatus";
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
    return <LoadingState label="Loading workout…" />;
  }

  if (workout.isError || exercises.isError) {
    return (
      <ErrorState
        message="Could not load workout."
        onRetry={() => {
          void workout.refetch();
          void exercises.refetch();
        }}
      />
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
            className="text-danger"
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
            <Surface as="section" key={entry.id}>
              <SectionTitle title={label.name} subtitle={label.group} className="mb-4" />
              <ExerciseSetsTable sets={entry.sets} />
            </Surface>
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
