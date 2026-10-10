import { TimePicker } from "@/components/ui/time-picker";
import { useState, type FormEvent } from "react";
import { addDays } from "date-fns";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
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
import { useCreatePlannedWorkout } from "@/hooks/usePlannedWorkouts";
import { isIsoDate, isTimeOfDay, todayLocal, toIsoDate } from "@/lib/date";
import { PLAN_TITLE_MAX_LENGTH } from "@/lib/limits";
import type { Exercise, PlannedExercise } from "@/types/domain";
import { ExercisePicker } from "./ExercisePicker";

const DEFAULT_TIME = "18:00";

const tomorrow = (): string => toIsoDate(addDays(new Date(), 1));

interface PlanWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanWorkoutDialog({ open, onOpenChange }: PlanWorkoutDialogProps) {
  const create = useCreatePlannedWorkout();
  const today = todayLocal();
  const [date, setDate] = useState(tomorrow);
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
    setDate(tomorrow());
    setTime(DEFAULT_TIME);
    setTitle("");
    setExercises([]);
    clearErrors();
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
      onOpenChange(false);
      reset();
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not plan workout. Try again.");
    }
  };

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
          <form onSubmit={submit} noValidate className="space-y-5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="plan-date">Date</Label>
                <DatePicker id="plan-date" min={today} value={date} onChange={setDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-time">Time</Label>
                <TimePicker
                  id="plan-time"
                  aria-invalid={!!timeError}
                  value={time}
                  onChange={(next) => {
                    setTime(next);
                    setTimeError("");
                  }}
                />
                {timeError && <FieldError>{timeError}</FieldError>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-title">
                Title <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="plan-title"
                maxLength={PLAN_TITLE_MAX_LENGTH}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Leg day"
              />
            </div>

            <div className="space-y-2">
              <Label asChild>
                <p>Exercises</p>
              </Label>
              {exercises.length > 0 && (
                <ul className="divide-y divide-border rounded-md border border-border">
                  {exercises.map((exercise) => (
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
                        onClick={() =>
                          setExercises((current) =>
                            current.filter((item) => item.exerciseId !== exercise.exerciseId),
                          )
                        }
                        className="shrink-0 text-muted-foreground hover:text-danger"
                      >
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                <Plus /> Add exercise
              </Button>
              {exercisesError && <FieldError>{exercisesError}</FieldError>}
            </div>

            {saveError && <FormAlert>{saveError}</FormAlert>}
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                Plan workout
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ExercisePicker
        title="Add exercise"
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        addedIds={new Set(exercises.map((exercise) => exercise.exerciseId))}
        onSelect={addExercise}
      />
    </>
  );
}
