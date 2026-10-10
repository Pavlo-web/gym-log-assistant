import { Dumbbell, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { FieldError, FormAlert } from "@/components/FormMessages";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WORKOUT_NOTES_MAX_LENGTH } from "@/lib/limits";
import type { Workout, WorkoutDraft } from "@/types/domain";
import { ExerciseCard } from "./ExerciseCard";
import { ExercisePicker } from "./ExercisePicker";
import { useWorkoutForm } from "./useWorkoutForm";
import { WorkoutSummary } from "./WorkoutSummary";

interface WorkoutFormProps {
  initial?: WorkoutDraft | null;
  workout?: Workout;
}

export function WorkoutForm({ initial, workout }: WorkoutFormProps) {
  const form = useWorkoutForm({ initial, workout });
  const { draft, picker, discardDialog } = form;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="space-y-2">
          <Label htmlFor="workout-date">Date</Label>
          <DatePicker
            id="workout-date"
            max={form.today}
            value={draft.date}
            onChange={(date) => form.update({ date })}
          />
          {form.dateError && <FieldError>{form.dateError}</FieldError>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="workout-notes">
            Notes <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="workout-notes"
            maxLength={WORKOUT_NOTES_MAX_LENGTH}
            value={draft.notes}
            onChange={(event) =>
              form.update({ notes: event.target.value.slice(0, WORKOUT_NOTES_MAX_LENGTH) })
            }
            placeholder="How did it feel?"
          />
        </div>
      </div>

      {draft.entries.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises yet"
          description="Add your first exercise to start logging sets."
        >
          <Button className="mt-5" onClick={() => picker.openFor()}>
            <Plus /> Add exercise
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="space-y-4">
            {draft.entries.map((entry) => (
              <ExerciseCard
                key={entry.id}
                entry={entry}
                exercise={form.exerciseOf(entry)}
                errors={form.setErrors}
                record={form.recordOf(entry)}
                onChange={form.changeEntry}
                onChangeExercise={() => picker.openFor(entry.id)}
                onRemove={() => form.removeEntry(entry.id)}
              />
            ))}
          </div>
          <Button variant="outline" onClick={() => picker.openFor()}>
            <Plus /> Add exercise
          </Button>
          <WorkoutSummary entries={form.entries} exerciseCount={draft.entries.length} />
        </>
      )}

      {form.formError && <FormAlert>{form.formError}</FormAlert>}
      {form.draftNotSaved && (
        <p role="status" className="text-xs text-muted-foreground">
          This browser is not saving your draft, so it will be lost if you leave the page. Saving
          the workout may fail too.
        </p>
      )}

      {/* Docked to the bottom navigation on phones; the side buttons leave the centre to the nav button. */}
      <div className="mobile-save-bar fixed inset-x-0 z-30 flex items-center justify-between gap-2 border-t border-sidebar-border bg-sidebar px-3 py-3 md:static md:justify-end md:border-border md:bg-transparent md:px-0 md:pb-0 md:pt-6">
        {form.editing ? (
          <Button variant="ghost" onClick={() => void form.cancelEdit()}>
            Cancel
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled={!form.canDiscard}
            onClick={() => discardDialog.setOpen(true)}
          >
            Discard
          </Button>
        )}
        <Button disabled={!form.canSave} onClick={() => void form.save()}>
          {form.editing ? "Save changes" : "Save workout"}
        </Button>
      </div>

      <ExercisePicker
        title={picker.title}
        open={picker.open}
        onOpenChange={picker.setOpen}
        addedIds={picker.addedIds}
        onSelect={picker.select}
      />

      {!form.editing && (
        <ConfirmDialog
          open={discardDialog.open}
          onOpenChange={discardDialog.setOpen}
          title="Discard workout?"
          description="Your unsaved exercises and sets will be lost."
          confirmLabel="Discard"
          onConfirm={discardDialog.confirm}
        />
      )}
    </div>
  );
}
