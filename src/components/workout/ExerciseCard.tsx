import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { setStatus, type DraftRecord } from "@/lib/draft";
import { newId } from "@/lib/id";
import { exerciseLabel } from "@/lib/workout";
import type { DraftEntry, DraftSet, Exercise } from "@/types/domain";
import { SetRow } from "./SetRow";
import { weightInputId } from "./set-input-id";

interface ExerciseCardProps {
  entry: DraftEntry;
  /** Live library exercise; undefined when it has been deleted. */
  exercise: Exercise | undefined;
  /** Validation messages keyed by set id. */
  errors: Record<string, string>;
  /** The set that beats the previous best of this exercise, if any. */
  record: DraftRecord | null;
  onChange: (entry: DraftEntry) => void;
  onRemove: () => void;
}

/** One exercise of the workout form with its editable list of sets. */
export function ExerciseCard({
  entry,
  exercise,
  errors,
  record,
  onChange,
  onRemove,
}: ExerciseCardProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const { name, group } = exerciseLabel(entry, exercise ? [exercise] : []);
  const lastSet = entry.sets.at(-1);

  /** Adds a set prefilled from the previous one, since sets usually repeat. */
  function addSet({ focus = false } = {}) {
    const set: DraftSet = {
      id: newId(),
      weight: lastSet?.weight ?? "",
      reps: lastSet?.reps ?? "",
    };
    onChange({ ...entry, sets: [...entry.sets, set] });
    if (focus) {
      // Wait for the new row to render before moving focus into it.
      requestAnimationFrame(() => document.getElementById(weightInputId(set.id))?.focus());
    }
  }

  function updateSet(id: string, patch: Partial<DraftSet>) {
    onChange({
      ...entry,
      sets: entry.sets.map((set) => (set.id === id ? { ...set, ...patch } : set)),
    });
  }

  function removeSet(id: string) {
    onChange({ ...entry, sets: entry.sets.filter((set) => set.id !== id) });
  }

  /** Asks first only when there is entered data to lose. */
  function requestRemove() {
    const hasData = entry.sets.some((set) => setStatus(set) !== "empty");
    if (hasData) setConfirmingRemove(true);
    else onRemove();
  }

  return (
    <section aria-label={name} className="rounded-lg border border-border bg-card p-3 md:p-5">
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:flex md:justify-between">
        <div className="min-w-0 break-words">
          <h2 className="text-base font-semibold">{name}</h2>
          <p className="text-xs text-muted-foreground">{group}</p>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Remove ${name}`}
          onClick={requestRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      <table className="w-full table-fixed md:table-auto">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="w-5 pb-2 pl-1 font-normal md:w-auto">#</th>
            <th className="pb-2 font-normal">Weight (kg)</th>
            <th className="pb-2 font-normal">Reps</th>
            <th className="w-11 pb-2 md:w-auto">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entry.sets.map((set, index) => (
            <SetRow
              key={set.id}
              index={index}
              set={set}
              error={errors[set.id] ?? null}
              record={record?.setId === set.id ? record : null}
              onChange={(patch) => updateSet(set.id, patch)}
              onRemove={() => removeSet(set.id)}
              // Enter in the last set adds the next one and moves focus to it.
              onRepsEnter={set === lastSet ? () => addSet({ focus: true }) : undefined}
            />
          ))}
        </tbody>
      </table>
      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => addSet()}>
        <Plus /> Add set
      </Button>

      <ConfirmDialog
        open={confirmingRemove}
        onOpenChange={setConfirmingRemove}
        title="Remove exercise?"
        description={`“${name}” has logged sets. Remove it from this workout?`}
        confirmLabel="Remove"
        onConfirm={onRemove}
      />
    </section>
  );
}
