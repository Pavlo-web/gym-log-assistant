import { useState, type FormEvent } from "react";
import { useCreateExercise } from "@/hooks/useExercises";
import { EXERCISE_NAME_MAX_LENGTH } from "@/lib/limits";
import { isSameExercise } from "@/lib/workout";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from "@/types/domain";

const DEFAULT_GROUP: MuscleGroup = "Chest";

const isMuscleGroup = (value: string): value is MuscleGroup =>
  (MUSCLE_GROUPS as readonly string[]).includes(value);

const nameProblem = (name: string, group: MuscleGroup, exercises: readonly Exercise[]): string => {
  if (!name) return "Enter a name";
  if (name.length > EXERCISE_NAME_MAX_LENGTH) {
    return `Use at most ${EXERCISE_NAME_MAX_LENGTH} characters`;
  }
  if (exercises.some((exercise) => isSameExercise(exercise, name, group))) {
    return `${group} already has an exercise with this name`;
  }
  return "";
};

export const useAddExerciseForm = (exercises: readonly Exercise[], onAdded: () => void) => {
  const create = useCreateExercise();
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>(DEFAULT_GROUP);
  const [nameError, setNameError] = useState("");
  const [saveError, setSaveError] = useState("");

  const clearErrors = () => {
    setNameError("");
    setSaveError("");
  };

  const changeName = (next: string) => {
    setName(next);
    clearErrors();
  };

  const changeGroup = (next: string) => {
    if (isMuscleGroup(next)) setGroup(next);
    clearErrors();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    clearErrors();
    const problem = nameProblem(trimmed, group, exercises);
    if (problem) {
      setNameError(problem);
      return;
    }
    try {
      await create.mutateAsync({ name: trimmed, muscleGroup: group, isCustom: true });
      onAdded();
      setName("");
      setGroup(DEFAULT_GROUP);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not add exercise. Try again.");
    }
  };

  return {
    name,
    changeName,
    group,
    changeGroup,
    nameError,
    saveError,
    clearErrors,
    saving: create.isPending,
    submit,
  };
};
