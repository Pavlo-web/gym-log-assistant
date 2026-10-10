import { useState, type FormEvent } from "react";
import { useSaveBodyWeight } from "@/hooks/useBodyWeight";
import { bodyWeightError } from "@/lib/body-weight";
import { todayLocal } from "@/lib/date";
import { parseDecimal } from "@/lib/number";
import type { BodyWeightEntry } from "@/types/domain";

export const useBodyWeightForm = (entries: readonly BodyWeightEntry[]) => {
  const save = useSaveBodyWeight();
  const today = todayLocal();
  const [date, setDate] = useState(today);
  // Start from the latest weight: the next measurement is usually close to it.
  const [weight, setWeight] = useState(() => (entries[0] ? String(entries[0].weight) : ""));
  const [weightError, setWeightError] = useState("");
  const [saveError, setSaveError] = useState("");

  const clearErrors = () => {
    setWeightError("");
    setSaveError("");
  };

  const changeDate = (next: string) => {
    setDate(next);
    clearErrors();
  };

  const changeWeight = (next: string) => {
    setWeight(next);
    clearErrors();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearErrors();
    const problem = bodyWeightError(weight);
    if (problem) {
      setWeightError(problem);
      return;
    }
    try {
      await save.mutateAsync({ date, weight: parseDecimal(weight) });
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not save. Try again.");
    }
  };

  return {
    today,
    date,
    changeDate,
    weight,
    changeWeight,
    weightError,
    saveError,
    existing: entries.find((entry) => entry.date === date),
    saving: save.isPending,
    submit,
  };
};
