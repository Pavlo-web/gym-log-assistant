import { useEffect, useMemo, useRef, useState } from "react";
import { Dumbbell, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { useNavigate } from "@tanstack/react-router";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useExercises } from "@/hooks/useExercises";
import { useCreateWorkout, useUpdateWorkout } from "@/hooks/useWorkouts";
import { useClearWorkoutDraft, useSaveWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { ExerciseCard } from "./ExerciseCard";
import { ExercisePicker } from "./ExercisePicker";
import { WorkoutSummary } from "./WorkoutSummary";
import { emptyDraft, isDraftEmpty, newId, setError, toEntries, todayLocal } from "./draft-utils";
import type { Exercise, Workout, WorkoutDraft } from "@/types/domain";

export function WorkoutForm({ initial, workout }: { initial?: WorkoutDraft | null; workout?: Workout }) {
  const navigate = useNavigate();
  const editing = !!workout;
  const [draft, setDraft] = useState<WorkoutDraft>(() => workout ? { date: workout.date, notes: workout.notes ?? "", entries: workout.entries.map((e) => ({ ...e, sets: e.sets.map((s) => ({ id: s.id, weight: String(s.weight), reps: String(s.reps) })) })) } : initial ?? emptyDraft());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [formError, setFormError] = useState("");
  const { data: exercises = [] } = useExercises();
  const create = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const saveDraft = useSaveWorkoutDraft();
  const clearDraft = useClearWorkoutDraft();
  const today = todayLocal();

  const first = useRef(true);
  useEffect(() => {
    if (editing) return;
    if (first.current) { first.current = false; return; }
    if (isDraftEmpty(draft)) clearDraft.mutate();
    else saveDraft.mutate(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, editing]);

  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const entries = toEntries(draft).map((entry) => {
    const exercise = byId.get(entry.exerciseId);
    const name = exercise?.name ?? entry.exerciseName;
    const group = exercise?.muscleGroup ?? entry.muscleGroup;
    return { ...entry, ...(name ? { exerciseName: name } : {}), ...(group ? { muscleGroup: group } : {}) };
  });
  const preview: Workout = { id: "preview", date: draft.date, entries, createdAt: "", updatedAt: "" };
  const errors: Record<string, string> = {};
  if (showErrors) for (const e of draft.entries) for (const s of e.sets) { const m = setError(s); if (m) errors[s.id] = m; }
  const dateError = !draft.date ? "Pick a date." : draft.date > today ? "Future dates are not allowed." : "";

  function update(patch: Partial<WorkoutDraft>) { setDraft((d) => ({ ...d, ...patch })); setFormError(""); }

  function addExercise(ex: Exercise) {
    update({ entries: [...draft.entries, { id: newId(), exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup, sets: [{ id: newId(), weight: "", reps: "" }] }] });
    setPickerOpen(false);
  }

  async function save() {
    const invalid = draft.entries.some((e) => e.sets.some((s) => setError(s)));
    if (invalid) { setShowErrors(true); setFormError("Fix the highlighted sets before saving."); return; }
    if (dateError) { setFormError(dateError); return; }
    if (entries.length === 0) return;
    try {
      const notes = draft.notes.trim();
       if (workout) {
         await updateWorkout.mutateAsync({ id: workout.id, data: { date: draft.date, entries, notes } });
         toast.success("Workout updated");
         await navigate({ to: "/history/$workoutId", params: { workoutId: workout.id } });
         return;
       }
       await create.mutateAsync({ date: draft.date, entries, ...(notes ? { notes } : {}) });
      await clearDraft.mutateAsync();
      first.current = true;
      setDraft(emptyDraft());
      setShowErrors(false);
      toast.success("Workout saved");
    } catch {
      setFormError("Could not save workout. Try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <div className="space-y-2">
          <Label htmlFor="workout-date">Date</Label>
          <DatePicker id="workout-date" max={today} value={draft.date} onChange={(date) => update({ date })} />
          {dateError && <p role="alert" className="text-xs text-destructive">{dateError}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="workout-notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="workout-notes" maxLength={200} value={draft.notes} onChange={(e) => update({ notes: e.target.value.slice(0, 200) })} placeholder="How did it feel?" />
        </div>
      </div>

      {draft.entries.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
          <Dumbbell aria-hidden="true" className="mb-3 size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No exercises yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first exercise to start logging sets.</p>
          <Button className="mt-5" onClick={() => setPickerOpen(true)}><Plus /> Add exercise</Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {draft.entries.map((entry) => (
              <ExerciseCard
                key={entry.id}
                entry={entry}
                exercise={byId.get(entry.exerciseId)}
                errors={errors}
                onChange={(next) => update({ entries: draft.entries.map((e) => (e.id === next.id ? next : e)) })}
                onRemove={() => update({ entries: draft.entries.filter((e) => e.id !== entry.id) })}
              />
            ))}
          </div>
          <Button variant="outline" onClick={() => setPickerOpen(true)}><Plus /> Add exercise</Button>
          <WorkoutSummary workout={preview} exerciseCount={draft.entries.length} />
        </>
      )}

      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
         {workout ? <Button variant="ghost" onClick={() => void navigate({ to: "/history/$workoutId", params: { workoutId: workout.id } })}>Cancel</Button> : <Button variant="ghost" disabled={isDraftEmpty(draft)} onClick={() => setDiscardOpen(true)}>Discard</Button>}
         <Button disabled={entries.length === 0 || create.isPending || updateWorkout.isPending} onClick={() => void save()}>{editing ? "Save changes" : "Save workout"}</Button>
      </div>

      <ExercisePicker open={pickerOpen} onOpenChange={setPickerOpen} addedIds={new Set(draft.entries.map((e) => e.exerciseId))} onSelect={addExercise} />

       {!editing && <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard workout?</AlertDialogTitle>
            <AlertDialogDescription>Your unsaved exercises and sets will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { setDraft(emptyDraft()); setShowErrors(false); setFormError(""); }}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>}
    </div>
  );
}
