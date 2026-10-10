import { Plus, X } from "lucide-react";
import { FieldError, FormAlert } from "@/components/FormMessages";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { todayLocal } from "@/lib/date";
import { PLAN_TITLE_MAX_LENGTH } from "@/lib/limits";
import { ExercisePicker } from "./ExercisePicker";
import { usePlanWorkoutForm } from "./usePlanWorkoutForm";

interface PlanWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanWorkoutDialog({ open, onOpenChange }: PlanWorkoutDialogProps) {
  const form = usePlanWorkoutForm(() => onOpenChange(false));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Plan a workout</DialogTitle>
            <DialogDescription>
              It counts in your statistics only after you log its sets.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.submit} noValidate className="space-y-5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="plan-date">Date</Label>
                <DatePicker
                  id="plan-date"
                  min={todayLocal()}
                  value={form.date}
                  onChange={form.setDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-time">Time</Label>
                <TimePicker
                  id="plan-time"
                  aria-invalid={!!form.timeError}
                  value={form.time}
                  onChange={form.changeTime}
                />
                {form.timeError && <FieldError>{form.timeError}</FieldError>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-title">
                Title <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="plan-title"
                maxLength={PLAN_TITLE_MAX_LENGTH}
                value={form.title}
                onChange={(event) => form.setTitle(event.target.value)}
                placeholder="Leg day"
              />
            </div>

            <div className="space-y-2">
              <Label asChild>
                <p>Exercises</p>
              </Label>
              {form.exercises.length > 0 && (
                <ul className="divide-y divide-border rounded-md border border-border">
                  {form.exercises.map((exercise) => (
                    <li
                      key={exercise.exerciseId}
                      className="flex items-center justify-between gap-2 py-1 pl-3 pr-1 text-sm"
                    >
                      <span className="min-w-0 break-words">{exercise.exerciseName}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove ${exercise.exerciseName}`}
                        onClick={() => form.removeExercise(exercise.exerciseId)}
                        className="shrink-0 text-muted-foreground hover:text-danger"
                      >
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setPickerOpen(true)}
              >
                <Plus /> Add exercise
              </Button>
              {form.exercisesError && <FieldError>{form.exercisesError}</FieldError>}
            </div>

            {form.saveError && <FormAlert>{form.saveError}</FormAlert>}
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.saving}>
                Plan workout
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ExercisePicker
        title="Add exercise"
        open={form.pickerOpen}
        onOpenChange={form.setPickerOpen}
        addedIds={form.addedIds}
        onSelect={form.addExercise}
      />
    </>
  );
}
