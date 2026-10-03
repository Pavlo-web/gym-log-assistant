import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SetRow } from "./SetRow";
import { newId, setStatus } from "./draft-utils";
import type { DraftEntry, DraftSet, Exercise } from "@/types/domain";

interface Props {
  entry: DraftEntry;
  exercise: Exercise | undefined;
  errors: Record<string, string>;
  onChange: (entry: DraftEntry) => void;
  onRemove: () => void;
}

export function ExerciseCard({ entry, exercise, errors, onChange, onRemove }: Props) {
  const [confirming, setConfirming] = useState(false);
  const name = exercise?.name ?? "Unknown exercise";

  function addSet(focus = false) {
    const last = entry.sets[entry.sets.length - 1];
    const set: DraftSet = { id: newId(), weight: last?.weight ?? "", reps: last?.reps ?? "" };
    onChange({ ...entry, sets: [...entry.sets, set] });
    if (focus) requestAnimationFrame(() => document.getElementById(`weight-${set.id}`)?.focus());
  }

  function updateSet(id: string, patch: Partial<DraftSet>) {
    onChange({ ...entry, sets: entry.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function requestRemove() {
    if (entry.sets.some((s) => setStatus(s) !== "empty")) setConfirming(true);
    else onRemove();
  }

  return (
    <section aria-label={name} className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{name}</h2>
          <p className="text-xs text-muted-foreground">{exercise?.muscleGroup}</p>
        </div>
        <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${name}`} onClick={requestRemove} className="text-muted-foreground hover:text-destructive">
          <Trash2 />
        </Button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="pb-2 pl-1 font-normal">#</th>
            <th className="pb-2 font-normal">Weight (kg)</th>
            <th className="pb-2 font-normal">Reps</th>
            <th className="pb-2"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {entry.sets.map((set, i) => (
            <SetRow
              key={set.id}
              index={i}
              set={set}
              error={errors[set.id] ?? null}
              onChange={(patch) => updateSet(set.id, patch)}
              onRemove={() => onChange({ ...entry, sets: entry.sets.filter((s) => s.id !== set.id) })}
              onRepsEnter={i === entry.sets.length - 1 ? () => addSet(true) : undefined}
            />
          ))}
        </tbody>
      </table>
      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => addSet()}>
        <Plus /> Add set
      </Button>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove exercise?</AlertDialogTitle>
            <AlertDialogDescription>“{name}” has logged sets. Remove it from this workout?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
