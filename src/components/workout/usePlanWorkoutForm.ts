import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCreatePlannedWorkout } from "@/hooks/usePlannedWorkouts";
import { isIsoDate, isTimeOfDay, tomorrowLocal } from "@/lib/date";
import type { Exercise, PlannedExercise } from "@/types/domain";

const DEFAULT_TIME = "18:00";

export const usePlanWorkoutForm = (onPlanned: () => void) => {
  const create = useCreatePlannedWorkout();
  const [date, setDate] = useState(tomorrowLocal);
  const [time, setTime] = useState(DEFAULT_TIME);
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<PlannedExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [exercisesError, setExercisesError] = useState("");
  const [saveError, setSaveError] = useState("");

  const clearErrors = () => {
    setTimeError("");
    setExercisesError("");
    setSaveError("");
  };

  const reset = () => {
    setDate(tomorrowLocal());
    setTime(DEFAULT_TIME);
    setTitle("");
    setExercises([]);
    clearErrors();
  };

  const changeTime = (next: string) => {
    setTime(next);
    setTimeError("");
  };

  const addExercise = (exercise: Exercise) => {
    setExercises((current) => [
      ...current,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
      },
    ]);
    setExercisesError("");
    setPickerOpen(false);
  };

  const removeExercise = (exerciseId: string) =>
    setExercises((current) => current.filter((item) => item.exerciseId !== exerciseId));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearErrors();
    const validTime = isTimeOfDay(time);
    if (!validTime) setTimeError("Pick a time");
    if (exercises.length === 0) setExercisesError("Add at least one exercise");
    if (!validTime || exercises.length === 0 || !isIsoDate(date)) return;

    const name = title.trim();
    try {
      await create.mutateAsync({ date, time, exercises, ...(name ? { title: name } : {}) });
      toast.success("Workout planned");
      onPlanned();
      reset();
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not plan workout. Try again.");
    }
  };

  return {
    date,
    setDate,
    time,
    changeTime,
    title,
    setTitle,
    exercises,
    addExercise,
    removeExercise,
    addedIds: new Set(exercises.map((exercise) => exercise.exerciseId)),
    pickerOpen,
    setPickerOpen,
    timeError,
    exercisesError,
    saveError,
    saving: create.isPending,
    submit,
  };
};
