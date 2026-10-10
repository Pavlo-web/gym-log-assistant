import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { StorageWriteError } from "@/data";
import { useExercises } from "@/hooks/useExercises";
import { useDeletePlannedWorkout } from "@/hooks/usePlannedWorkouts";
import { useClearWorkoutDraft, useSaveWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useCreateWorkout, useUpdateWorkout, useWorkouts } from "@/hooks/useWorkouts";
import { todayLocal } from "@/lib/date";
import {
  collectSetErrors,
  draftFromWorkout,
  draftRecord,
  emptyDraft,
  hasTypedSets,
  isDraftEmpty,
  newDraftEntry,
  toEntries,
  withExercise,
  withExerciseSnapshots,
  workoutDateError,
} from "@/lib/draft";
import { bestLoggedE1RM } from "@/lib/progress";
import type { DraftEntry, Exercise, Workout, WorkoutDraft } from "@/types/domain";

interface WorkoutFormOptions {
  initial?: WorkoutDraft | null | undefined;
  workout?: Workout | undefined;
}

export const useWorkoutForm = ({ initial, workout }: WorkoutFormOptions) => {
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
  const dateError = workoutDateError(draft.date, today);
  const saving = createWorkout.isPending || updateWorkout.isPending;

  const update = (patch: Partial<WorkoutDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setFormError("");
  };

  const discard = () => {
    setDraft(emptyDraft());
    setShowErrors(false);
    setFormError("");
  };

  const openPicker = (entryId: string | null = null) => {
    setChangingEntryId(entryId);
    setPickerOpen(true);
  };

  const selectExercise = (exercise: Exercise) => {
    const nextEntries = changingEntryId
      ? draft.entries.map((entry) =>
          entry.id === changingEntryId ? withExercise(entry, exercise) : entry,
        )
      : [...draft.entries, newDraftEntry(exercise)];
    update({ entries: nextEntries });
    setPickerOpen(false);
  };

  const changeEntry = (next: DraftEntry) =>
    update({ entries: draft.entries.map((entry) => (entry.id === next.id ? next : entry)) });

  const removeEntry = (entryId: string) =>
    update({ entries: draft.entries.filter((entry) => entry.id !== entryId) });

  const openSaved = (workoutId: string) =>
    navigate({ to: "/history/$workoutId", params: { workoutId } });

  const saveEdited = async (saved: Workout) => {
    await updateWorkout.mutateAsync({
      id: saved.id,
      data: { date: draft.date, entries, notes: draft.notes.trim() },
    });
    toast.success("Workout updated");
    await openSaved(saved.id);
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
    await openSaved(saved.id);
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

  return {
    draft,
    today,
    editing,
    entries,
    dateError,
    formError,
    // While typing, only values that are present and wrong are flagged. After a save
    // attempt the full check applies, which also reports fields left empty.
    setErrors: collectSetErrors(draft, showErrors ? "complete" : "typed"),
    // Enabled as soon as anything is typed, so pressing Save can explain what is wrong.
    canSave: hasTypedSets(draft.entries) && !saving,
    canDiscard: !isDraftEmpty(draft),
    draftNotSaved: saveDraft.isError,
    exerciseOf: (entry: DraftEntry) => exercisesById.get(entry.exerciseId),
    // When editing, the saved version of this workout must not count as the record to beat.
    recordOf: (entry: DraftEntry) =>
      draftRecord(entry, bestLoggedE1RM(savedWorkouts, entry.exerciseId, workout?.id)),
    update,
    changeEntry,
    removeEntry,
    save,
    cancelEdit: () => (workout ? openSaved(workout.id) : undefined),
    picker: {
      open: pickerOpen,
      setOpen: setPickerOpen,
      title: changingEntryId ? "Change exercise" : "Add exercise",
      addedIds: new Set(draft.entries.map((entry) => entry.exerciseId)),
      openFor: openPicker,
      select: selectExercise,
    },
    discardDialog: { open: discardOpen, setOpen: setDiscardOpen, confirm: discard },
  };
};
