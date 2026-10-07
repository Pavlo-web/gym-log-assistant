import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExercises, useCreateExercise, useDeleteExercise } from "@/hooks/useExercises";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from "@/types/domain";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "Exercises — Gym Log" },
      { name: "description", content: "Browse and manage your exercise library by muscle group." },
      { property: "og:title", content: "Exercises — Gym Log" },
      {
        property: "og:description",
        content: "Browse and manage your exercise library by muscle group.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExercisesPage,
});

function ExercisesPage() {
  const { data: exercises = [], isPending, isError, refetch } = useExercises();
  const create = useCreateExercise();
  const remove = useDeleteExercise();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MuscleGroup | "All">("All");
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>("Chest");
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<Exercise | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const groups = MUSCLE_GROUPS.map((muscleGroup) => ({
    muscleGroup,
    items: exercises
      .filter(
        (e) =>
          e.muscleGroup === muscleGroup &&
          (filter === "All" || filter === muscleGroup) &&
          e.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((section) => section.items.length > 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 60) {
      setFormError("Enter a name between 1 and 60 characters.");
      return;
    }
    if (
      exercises.some(
        (e) =>
          e.muscleGroup === group && e.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
      )
    ) {
      setFormError("An exercise with this name already exists in this muscle group.");
      return;
    }
    setFormError("");
    try {
      await create.mutateAsync({ name: trimmed, muscleGroup: group, isCustom: true });
      setAddOpen(false);
      setName("");
      setGroup("Chest");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not add exercise. Try again.");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      setDeleteError("");
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete exercise. Try again.",
      );
    }
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-1 items-start gap-0 md:mb-0 md:flex md:flex-wrap md:justify-between md:gap-4">
        <PageHeader title="Exercises" description="Your exercise library" />
        <Button
          onClick={() => {
            setFormError("");
            setAddOpen(true);
          }}
        >
          <Plus /> Add exercise
        </Button>
      </div>
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search exercises"
            placeholder="Search exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10"
          />
        </div>
        <div
          className="flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0"
          aria-label="Filter by muscle group"
        >
          {(["All", ...MUSCLE_GROUPS] as const).map((item) => (
            <Button
              key={item}
              size="sm"
              className="shrink-0"
              variant={filter === item ? "default" : "outline"}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {isPending ? (
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">
          Loading exercises…
        </p>
      ) : isError ? (
        <div role="alert" className="py-12 text-center text-sm text-muted-foreground">
          Could not load exercises.{" "}
          <Button variant="link" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : groups.length === 0 ? (
        <p className="border-t border-border py-12 text-center text-sm text-muted-foreground">
          No exercises found.
        </p>
      ) : (
        <div className="space-y-9">
          {groups.map(({ muscleGroup, items }) => (
            <section key={muscleGroup} aria-label={muscleGroup}>
              <div className="mb-3 flex items-baseline justify-between border-b border-border pb-3">
                <h2 className="text-lg font-semibold">{muscleGroup}</h2>
                <span className="tabular text-xs text-muted-foreground">
                  {items.length} {items.length === 1 ? "exercise" : "exercises"}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {items.map((exercise) => (
                  <li
                    key={exercise.id}
                    className="flex min-h-12 items-center justify-between gap-3 py-2 pl-1"
                  >
                    <span className="min-w-0 text-sm">{exercise.name}</span>
                    {exercise.isCustom && (
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                          Custom
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Delete ${exercise.name}`}
                          title={`Delete ${exercise.name}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleting(exercise);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) setFormError("");
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add exercise</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">Name</Label>
              <Input
                id="exercise-name"
                autoFocus
                required
                maxLength={60}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                }}
                placeholder="Exercise name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exercise-group">Muscle group</Label>
              <Select
                value={group}
                onValueChange={(value) => {
                  setGroup(value as MuscleGroup);
                  setFormError("");
                }}
              >
                <SelectTrigger id="exercise-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                Add exercise
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exercise?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove “{deleting?.name}” from your library? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={remove.isPending}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
