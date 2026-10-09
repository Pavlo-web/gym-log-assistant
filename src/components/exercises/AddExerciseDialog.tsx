import { useState, type FormEvent } from "react";
import { FieldError, FormAlert } from "@/components/FormMessages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateExercise } from "@/hooks/useExercises";
import { EXERCISE_NAME_MAX_LENGTH } from "@/lib/limits";
import { isSameExercise } from "@/lib/workout";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from "@/types/domain";

const DEFAULT_GROUP: MuscleGroup = "Chest";

function isMuscleGroup(value: string): value is MuscleGroup {
  return (MUSCLE_GROUPS as readonly string[]).includes(value);
}

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current library, used to reject duplicates before saving. */
  exercises: Exercise[];
}

/** Dialog for adding a custom exercise to the library. */
export function AddExerciseDialog({ open, onOpenChange, exercises }: AddExerciseDialogProps) {
  const create = useCreateExercise();
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>(DEFAULT_GROUP);
  /** Problem with the typed name, shown under the field. */
  const [nameError, setNameError] = useState("");
  /** Problem with saving, shown for the form as a whole. */
  const [saveError, setSaveError] = useState("");

  function clearErrors() {
    setNameError("");
    setSaveError("");
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    // The typed name is kept so reopening after an accidental close does not lose it.
    clearErrors();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    clearErrors();
    if (!trimmed) {
      setNameError("Enter a name");
      return;
    }
    if (trimmed.length > EXERCISE_NAME_MAX_LENGTH) {
      setNameError(`Use at most ${EXERCISE_NAME_MAX_LENGTH} characters`);
      return;
    }
    if (exercises.some((exercise) => isSameExercise(exercise, trimmed, group))) {
      setNameError(`${group} already has an exercise with this name`);
      return;
    }
    try {
      await create.mutateAsync({ name: trimmed, muscleGroup: group, isCustom: true });
      onOpenChange(false);
      setName("");
      setGroup(DEFAULT_GROUP);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not add exercise. Try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
        </DialogHeader>
        {/* noValidate: the form shows its own messages instead of the browser bubbles. */}
        <form onSubmit={submit} noValidate className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Name</Label>
            <Input
              id="exercise-name"
              autoFocus
              aria-invalid={!!nameError}
              maxLength={EXERCISE_NAME_MAX_LENGTH}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearErrors();
              }}
              placeholder="Exercise name"
            />
            {nameError && <FieldError>{nameError}</FieldError>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="exercise-group">Muscle group</Label>
            <Select
              value={group}
              onValueChange={(value) => {
                if (isMuscleGroup(value)) setGroup(value);
                clearErrors();
              }}
            >
              <SelectTrigger id="exercise-group">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MUSCLE_GROUPS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {saveError && <FormAlert>{saveError}</FormAlert>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              Add exercise
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
