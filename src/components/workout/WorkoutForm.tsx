import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dumbbell, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { FieldError, FormAlert } from "@/components/FormMessages";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StorageWriteError } from "@/data";
import { useExercises } from "@/hooks/useExercises";
import { useDeletePlannedWorkout } from "@/hooks/usePlannedWorkouts";
import { useClearWorkoutDraft, useSaveWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useCreateWorkout, useUpdateWorkout, useWorkouts } from "@/hooks/useWorkouts";
import { todayLocal } from "@/lib/date";
import {
  draftFromWorkout,
  draftRecord,
  emptyDraft,
  isDraftEmpty,
  hasFieldErrors,
  setFieldErrors,
  setStatus,
  toEntries,
  type SetCheck,
  type SetFieldErrors,
} from "@/lib/draft";
import { newId } from "@/lib/id";
import { WORKOUT_NOTES_MAX_LENGTH } from "@/lib/limits";
import { bestLoggedE1RM } from "@/lib/progress";
import type { Exercise, Workout, WorkoutDraft, WorkoutEntry } from "@/types/domain";
import { ExerciseCard } from "./ExerciseCard";
import { ExercisePicker } from "./ExercisePicker";
import { WorkoutSummary } from "./WorkoutSummary";

const collectSetErrors = (draft: WorkoutDraft, check: SetCheck): Record<string, SetFieldErrors> => {
  const errors: Record<string, SetFieldErrors> = {};
  for (const entry of draft.entries) {
    for (const set of entry.sets) {
      const problems = setFieldErrors(set, check);
      if (hasFieldErrors(problems)) errors[set.id] = problems;
    }
  }
  return errors;
};

const validateDate = (date: string, today: string): string => {
  if (!date) return "Pick a date.";
  if (date > today) return "Future dates are not allowed.";
  return "";
};

// Snapshots the exercise name and group so the workout stays readable if the exercise is deleted.
const withExerciseSnapshots = (
  entries: WorkoutEntry[],
  exercisesById: ReadonlyMap<string, Exercise>,
): WorkoutEntry[] =>
  entries.map((entry) => {
    const exercise = exercisesById.get(entry.exerciseId);
    const name = exercise?.name ?? entry.exerciseName;
    const group = exercise?.muscleGroup ?? entry.muscleGroup;
    return {
      ...entry,
      ...(name ? { exerciseName: name } : {}),
      ...(group ? { muscleGroup: group } : {}),
    };
  });

interface WorkoutFormProps {
  initial?: WorkoutDraft | null;
  workout?: Workout;
}

export function WorkoutForm({ initial, workout }: WorkoutFormProps) {
  const navigate = useNavigate();
  const editing = !!workout;
  const today = todayLocal();

  const [draft, setDraft] = useState<WorkoutDraft>(() =>
    workout ? draftFromWorkout(workout) : (initial ?? emptyDraft()),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  // Entry whose exercise the picker will replace; null when the picker adds a new one.
  const [changingEntryId, setChangingEntryId] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [formError, setFormError] = useState("");

  const { data: exercises = [] } = useExercises();
  const { data: savedWorkouts = [] } = useWorkouts();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const saveDraft = useSaveWorkoutDraft();
  const clearDraft = useClearWorkoutDraft();
  const deletePlan = useDeletePlannedWorkout();

  // Autosave a new workout as the user types, so a reload does not lose it.
  // The first run is skipped: the draft was just loaded and has not changed.
  const skipNextAutosave = useRef(true);
  useEffect(() => {
    if (editing) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    if (isDraftEmpty(draft)) clearDraft.mutate();
    else saveDraft.mutate(draft);
    // The mutation objects change identity on every render; only the draft matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, editing]);

  const exercisesById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );
  const entries = withExerciseSnapshots(toEntries(draft), exercisesById);
  // While typing, only values that are present and wrong are flagged. After a save
  // attempt the full check applies, which also reports fields left empty.
  const setErrors = collectSetErrors(draft, showErrors ? "complete" : "typed");
  const hasTypedSets = draft.entries.some((entry) =>
    entry.sets.some((set) => setStatus(set) !== "empty"),
  );
  const dateError = validateDate(draft.date, today);
  const saving = createWorkout.isPending || updateWorkout.isPending;

  const update = (patch: Partial<WorkoutDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setFormError("");
  };

  const resetForm = () => {
    setDraft(emptyDraft());
    setShowErrors(false);
    setFormError("");
  };

  const openPicker = (entryId: string | null = null) => {
    setChangingEntryId(entryId);
    setPickerOpen(true);
  };

  const addExercise = (exercise: Exercise) => {
    update({
      entries: [
        ...draft.entries,
        {
          id: newId(),
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          muscleGroup: exercise.muscleGroup,
          sets: [{ id: newId(), weight: "", reps: "" }],
        },
      ],
    });
  };

  const changeExercise = (entryId: string, exercise: Exercise) => {
    update({
      entries: draft.entries.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              muscleGroup: exercise.muscleGroup,
            }
          : entry,
      ),
    });
  };

  const selectExercise = (exercise: Exercise) => {
    if (changingEntryId) changeExercise(changingEntryId, exercise);
    else addExercise(exercise);
    setPickerOpen(false);
  };

  const saveEdited = async (saved: Workout) => {
    await updateWorkout.mutateAsync({
      id: saved.id,
      data: { date: draft.date, entries, notes: draft.notes.trim() },
    });
    toast.success("Workout updated");
    await navigate({ to: "/history/$workoutId", params: { workoutId: saved.id } });
  };

  const saveNew = async () => {
    const notes = draft.notes.trim();
    const saved = await createWorkout.mutateAsync({
      date: draft.date,
      entries,
      ...(notes ? { notes } : {}),
    });
    await clearDraft.mutateAsync();
    // The plan is done once its workout is logged. A plan that could not be removed
    // only stays listed, so that failure must not fail the save.
    if (draft.planId) await deletePlan.mutateAsync(draft.planId).catch(() => undefined);
    toast.success("Workout saved");
    // Show what was just saved; staying on an emptied form looked like nothing happened.
    await navigate({ to: "/history/$workoutId", params: { workoutId: saved.id } });
  };

  const save = async () => {
    if (Object.keys(collectSetErrors(draft, "complete")).length > 0) {
      setShowErrors(true);
      setFormError("Some sets need fixing before this workout can be saved.");
      return;
    }
    if (dateError) {
      setFormError(dateError);
      return;
    }
    if (entries.length === 0) return;
    try {
      if (workout) await saveEdited(workout);
      else await saveNew();
    } catch (cause) {
      setFormError(
        cause instanceof StorageWriteError ? cause.message : "Could not save workout. Try again.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="space-y-2">
          <Label htmlFor="workout-date">Date</Label>
          <DatePicker
            id="workout-date"
            max={today}
            value={draft.date}
            onChange={(date) => update({ date })}
          />
          {dateError && <FieldError>{dateError}</FieldError>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="workout-notes">
            Notes <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="workout-notes"
            maxLength={WORKOUT_NOTES_MAX_LENGTH}
            value={draft.notes}
            onChange={(event) =>
              update({ notes: event.target.value.slice(0, WORKOUT_NOTES_MAX_LENGTH) })
            }
            placeholder="How did it feel?"
          />
        </div>
      </div>

      {draft.entries.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises yet"
          description="Add your first exercise to start logging sets."
        >
          <Button className="mt-5" onClick={() => openPicker()}>
            <Plus /> Add exercise
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="space-y-4">
            {draft.entries.map((entry) => (
              <ExerciseCard
                key={entry.id}
                entry={entry}
                exercise={exercisesById.get(entry.exerciseId)}
                errors={setErrors}
                record={draftRecord(
                  entry,
                  // When editing, the saved version of this workout must not count as the record to beat.
                  bestLoggedE1RM(savedWorkouts, entry.exerciseId, workout?.id),
                )}
                onChange={(next) =>
                  update({
                    entries: draft.entries.map((item) => (item.id === next.id ? next : item)),
                  })
                }
                onChangeExercise={() => openPicker(entry.id)}
                onRemove={() =>
                  update({ entries: draft.entries.filter((item) => item.id !== entry.id) })
                }
              />
            ))}
          </div>
          <Button variant="outline" onClick={() => openPicker()}>
            <Plus /> Add exercise
          </Button>
          <WorkoutSummary entries={entries} exerciseCount={draft.entries.length} />
        </>
      )}

      {formError && <FormAlert>{formError}</FormAlert>}
      {saveDraft.isError && (
        <p role="status" className="text-xs text-muted-foreground">
          This browser is not saving your draft, so it will be lost if you leave the page. Saving
          the workout may fail too.
        </p>
      )}

      {/* Docked to the bottom navigation on phones; the side buttons leave the centre to the nav button. */}
      <div className="mobile-save-bar fixed inset-x-0 z-30 flex items-center justify-between gap-2 border-t border-sidebar-border bg-sidebar px-3 py-3 md:static md:justify-end md:border-border md:bg-transparent md:px-0 md:pb-0 md:pt-6">
        {workout ? (
          <Button
            variant="ghost"
            onClick={() =>
              void navigate({ to: "/history/$workoutId", params: { workoutId: workout.id } })
            }
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled={isDraftEmpty(draft)}
            onClick={() => setDiscardOpen(true)}
          >
            Discard
          </Button>
        )}
        {/* Enabled as soon as anything is typed, so pressing it can explain what is wrong. */}
        <Button disabled={!hasTypedSets || saving} onClick={() => void save()}>
          {editing ? "Save changes" : "Save workout"}
        </Button>
      </div>

      <ExercisePicker
        title={changingEntryId ? "Change exercise" : "Add exercise"}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        addedIds={new Set(draft.entries.map((entry) => entry.exerciseId))}
        onSelect={selectExercise}
      />

      {!editing && (
        <ConfirmDialog
          open={discardOpen}
          onOpenChange={setDiscardOpen}
          title="Discard workout?"
          description="Your unsaved exercises and sets will be lost."
          confirmLabel="Discard"
          onConfirm={resetForm}
        />
      )}
    </div>
  );
}
