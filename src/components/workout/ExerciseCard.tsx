import { useState } from "react";
import { ArrowLeftRight, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExerciseVideoLink } from "@/components/ExerciseVideoLink";
import { Hint } from "@/components/Hint";
import { SectionTitle } from "@/components/SectionTitle";
import { Surface } from "@/components/Surface";
import { Button } from "@/components/ui/button";
import {
  hasTypedSets,
  newDraftSet,
  withSetAdded,
  withSetChanged,
  withSetRemoved,
  type DraftRecord,
  type SetFieldErrors,
} from "@/lib/draft";
import { exerciseLabel } from "@/lib/workout";
import type { DraftEntry, Exercise } from "@/types/domain";
import { SetRow } from "./SetRow";
import { weightInputId } from "./set-input-id";

interface ExerciseCardProps {
  entry: DraftEntry;
  // Undefined when the exercise has been deleted from the library.
  exercise: Exercise | undefined;
  errors: Record<string, SetFieldErrors>;
  record: DraftRecord | null;
  onChange: (entry: DraftEntry) => void;
  onChangeExercise: () => void;
  onRemove: () => void;
}

export function ExerciseCard({
  entry,
  exercise,
  errors,
  record,
  onChange,
  onChangeExercise,
  onRemove,
}: ExerciseCardProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const { name, group } = exerciseLabel(entry, exercise ? [exercise] : []);
  const lastSet = entry.sets.at(-1);

  // Prefilled from the previous set, since sets usually repeat.
  const addSet = ({ focus = false } = {}) => {
    const set = newDraftSet(lastSet?.weight, lastSet?.reps);
    onChange(withSetAdded(entry, set));
    if (focus) {
      // Wait for the new row to render before moving focus into it.
      requestAnimationFrame(() => document.getElementById(weightInputId(set.id))?.focus());
    }
  };

  const requestRemove = () => {
    if (hasTypedSets([entry])) setConfirmingRemove(true);
    else onRemove();
  };

  return (
    <Surface as="section" aria-label={name}>
      <SectionTitle
        title={name}
        subtitle={group}
        className="mb-3"
        action={
          <>
            <ExerciseVideoLink name={name} />
            <Hint label="Change exercise">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Change ${name} to another exercise`}
                onClick={onChangeExercise}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftRight />
              </Button>
            </Hint>
            <Hint label="Remove exercise">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Remove ${name}`}
                onClick={requestRemove}
                className="text-muted-foreground hover:text-danger"
              >
                <Trash2 />
              </Button>
            </Hint>
          </>
        }
      />

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
              errors={errors[set.id] ?? null}
              record={record?.setId === set.id ? record : null}
              onChange={(patch) => onChange(withSetChanged(entry, set.id, patch))}
              onRemove={() => onChange(withSetRemoved(entry, set.id))}
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
    </Surface>
  );
}
