import { useState, type FormEvent } from "react";
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
  const [error, setError] = useState("");

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    // The typed name is kept so reopening after an accidental close does not lose it.
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > EXERCISE_NAME_MAX_LENGTH) {
      setError(`Enter a name between 1 and ${EXERCISE_NAME_MAX_LENGTH} characters.`);
      return;
    }
    if (exercises.some((exercise) => isSameExercise(exercise, trimmed, group))) {
      setError("An exercise with this name already exists in this muscle group.");
      return;
    }
    setError("");
    try {
      await create.mutateAsync({ name: trimmed, muscleGroup: group, isCustom: true });
      onOpenChange(false);
      setName("");
      setGroup(DEFAULT_GROUP);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add exercise. Try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Name</Label>
            <Input
              id="exercise-name"
              autoFocus
              required
              maxLength={EXERCISE_NAME_MAX_LENGTH}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Exercise name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exercise-group">Muscle group</Label>
            <Select
              value={group}
              onValueChange={(value) => {
                if (isMuscleGroup(value)) setGroup(value);
                setError("");
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
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
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
