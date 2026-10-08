import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dumbbell, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StorageWriteError } from "@/data";
import { useExercises } from "@/hooks/useExercises";
import { useClearWorkoutDraft, useSaveWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useCreateWorkout, useUpdateWorkout, useWorkouts } from "@/hooks/useWorkouts";
import { todayLocal } from "@/lib/date";
import {
  draftFromWorkout,
  draftRecord,
  emptyDraft,
  isDraftEmpty,
  setError,
  toEntries,
} from "@/lib/draft";
import { newId } from "@/lib/id";
import { WORKOUT_NOTES_MAX_LENGTH } from "@/lib/limits";
import { bestLoggedE1RM } from "@/lib/progress";
import type { Exercise, Workout, WorkoutDraft, WorkoutEntry } from "@/types/domain";
import { ExerciseCard } from "./ExerciseCard";
import { ExercisePicker } from "./ExercisePicker";
import { WorkoutSummary } from "./WorkoutSummary";

/** Validation messages for every invalid set, keyed by set id. */
function collectSetErrors(draft: WorkoutDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const entry of draft.entries) {
    for (const set of entry.sets) {
      const message = setError(set);
      if (message) errors[set.id] = message;
    }
  }
  return errors;
}

function validateDate(date: string, today: string): string {
  if (!date) return "Pick a date.";
  if (date > today) return "Future dates are not allowed.";
  return "";
}

/**
 * Stores the exercise name and muscle group on each entry, preferring the live
 * library values, so the workout stays readable if the exercise is deleted.
 */
function withExerciseSnapshots(
  entries: WorkoutEntry[],
  exercisesById: ReadonlyMap<string, Exercise>,
): WorkoutEntry[] {
  return entries.map((entry) => {
    const exercise = exercisesById.get(entry.exerciseId);
    const name = exercise?.name ?? entry.exerciseName;
    const group = exercise?.muscleGroup ?? entry.muscleGroup;
    return {
      ...entry,
      ...(name ? { exerciseName: name } : {}),
      ...(group ? { muscleGroup: group } : {}),
    };
  });
}

interface WorkoutFormProps {
  /** Unsaved draft to resume when logging a new workout. */
  initial?: WorkoutDraft | null;
  /** Saved workout to edit. When set, the form updates it instead of creating one. */
  workout?: Workout;
}

/** Form for logging a new workout or editing a saved one. */
export function WorkoutForm({ initial, workout }: WorkoutFormProps) {
  const navigate = useNavigate();
  const editing = !!workout;
  const today = todayLocal();

  const [draft, setDraft] = useState<WorkoutDraft>(() =>
    workout ? draftFromWorkout(workout) : (initial ?? emptyDraft()),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [formError, setFormError] = useState("");

  const { data: exercises = [] } = useExercises();
  const { data: savedWorkouts = [] } = useWorkouts();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const saveDraft = useSaveWorkoutDraft();
  const clearDraft = useClearWorkoutDraft();

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
  const setErrors = showErrors ? collectSetErrors(draft) : {};
  const dateError = validateDate(draft.date, today);
  const saving = createWorkout.isPending || updateWorkout.isPending;

  function update(patch: Partial<WorkoutDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setFormError("");
  }

  function resetForm() {
    setDraft(emptyDraft());
    setShowErrors(false);
    setFormError("");
  }

  function addExercise(exercise: Exercise) {
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
    setPickerOpen(false);
  }

  async function saveEdited(saved: Workout) {
    await updateWorkout.mutateAsync({
      id: saved.id,
      data: { date: draft.date, entries, notes: draft.notes.trim() },
    });
    toast.success("Workout updated");
    await navigate({ to: "/history/$workoutId", params: { workoutId: saved.id } });
  }

  async function saveNew() {
    const notes = draft.notes.trim();
    await createWorkout.mutateAsync({ date: draft.date, entries, ...(notes ? { notes } : {}) });
    await clearDraft.mutateAsync();
    // The reset below is not a user edit, so it must not be autosaved as a draft.
    skipNextAutosave.current = true;
    resetForm();
    toast.success("Workout saved");
  }

  async function save() {
    if (Object.keys(collectSetErrors(draft)).length > 0) {
      setShowErrors(true);
      setFormError("Fix the highlighted sets before saving.");
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
  }

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
          {dateError && (
            <p role="alert" className="text-xs text-destructive">
              {dateError}
            </p>
          )}
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
          <Button className="mt-5" onClick={() => setPickerOpen(true)}>
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
                onRemove={() =>
                  update({ entries: draft.entries.filter((item) => item.id !== entry.id) })
                }
              />
            ))}
          </div>
          <Button variant="outline" onClick={() => setPickerOpen(true)}>
            <Plus /> Add exercise
          </Button>
          <WorkoutSummary entries={entries} exerciseCount={draft.entries.length} />
        </>
      )}

      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}
      {saveDraft.isError && (
        <p role="status" className="text-xs text-muted-foreground">
          This browser is not saving your draft, so it will be lost if you leave the page. Saving
          the workout may fail too.
        </p>
      )}

      {/* Sticks above the bottom navigation on phones; see `.mobile-save-bar` in styles.css. */}
      <div className="mobile-save-bar sticky z-30 flex items-center justify-end gap-2 border-t border-border bg-background py-3 md:static md:bg-transparent md:pb-0 md:pt-6">
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
        <Button disabled={entries.length === 0 || saving} onClick={() => void save()}>
          {editing ? "Save changes" : "Save workout"}
        </Button>
      </div>

      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        addedIds={new Set(draft.entries.map((entry) => entry.exerciseId))}
        onSelect={addExercise}
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
