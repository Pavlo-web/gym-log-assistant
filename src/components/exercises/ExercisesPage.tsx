import { useState } from "react";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, LoadingState } from "@/components/PageStatus";
import { Button } from "@/components/ui/button";
import { useDeleteExercise, useExercises } from "@/hooks/useExercises";
import { groupExercises, type GroupFilter } from "@/lib/workout";
import type { Exercise } from "@/types/domain";
import { AddExerciseDialog } from "./AddExerciseDialog";
import { ExerciseFilters } from "./ExerciseFilters";
import { ExerciseGroupList } from "./ExerciseGroupList";

export function ExercisesPage() {
  const { data: exercises = [], isPending, isError, refetch } = useExercises();
  const remove = useDeleteExercise();
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<GroupFilter>("All");
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<Exercise | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const groups = groupExercises(exercises, search, group);

  const requestDelete = (exercise: Exercise) => {
    setDeleteError("");
    setDeleting(exercise);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      setDeleteError("");
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (cause) {
      setDeleteError(
        cause instanceof Error ? cause.message : "Could not delete exercise. Try again.",
      );
    }
  };

  return (
    <>
      <div className="mb-4 grid grid-cols-1 items-start gap-0 md:mb-0 md:flex md:flex-wrap md:justify-between md:gap-4">
        <PageHeader title="Exercises" description="Your exercise library" />
        <Button onClick={() => setAddOpen(true)}>
          <Plus /> Add exercise
        </Button>
      </div>

      <ExerciseFilters
        search={search}
        onSearchChange={setSearch}
        group={group}
        onGroupChange={setGroup}
      />

      {isPending ? (
        <LoadingState label="Loading exercises…" />
      ) : isError ? (
        <ErrorState message="Could not load exercises." onRetry={() => void refetch()} />
      ) : groups.length === 0 ? (
        <p className="border-t border-border py-12 text-center text-sm text-muted-foreground">
          No exercises found.
        </p>
      ) : (
        <ExerciseGroupList groups={groups} onDelete={requestDelete} />
      )}

      <AddExerciseDialog open={addOpen} onOpenChange={setAddOpen} exercises={exercises} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete exercise?"
        description={`Remove “${deleting?.name ?? ""}” from your library? This cannot be undone.`}
        confirmLabel="Delete"
        keepOpenOnConfirm
        pending={remove.isPending}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
