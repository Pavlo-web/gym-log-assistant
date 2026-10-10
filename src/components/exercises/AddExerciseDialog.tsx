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
import { EXERCISE_NAME_MAX_LENGTH } from "@/lib/limits";
import { MUSCLE_GROUPS, type Exercise } from "@/types/domain";
import { useAddExerciseForm } from "./useAddExerciseForm";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
}

export function AddExerciseDialog({ open, onOpenChange, exercises }: AddExerciseDialogProps) {
  const form = useAddExerciseForm(exercises, () => onOpenChange(false));

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    form.clearErrors();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.submit} noValidate className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Name</Label>
            <Input
              id="exercise-name"
              autoFocus
              aria-invalid={!!form.nameError}
              maxLength={EXERCISE_NAME_MAX_LENGTH}
              value={form.name}
              onChange={(event) => form.changeName(event.target.value)}
              placeholder="Exercise name"
            />
            {form.nameError && <FieldError>{form.nameError}</FieldError>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="exercise-group">Muscle group</Label>
            <Select value={form.group} onValueChange={form.changeGroup}>
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
          {form.saveError && <FormAlert>{form.saveError}</FormAlert>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.saving}>
              Add exercise
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
