import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useDeleteWorkout } from "@/hooks/useWorkouts";

interface DeleteWorkoutDialogProps {
  workoutId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Confirms deleting a workout, then returns to the history list. */
export function DeleteWorkoutDialog({ workoutId, open, onOpenChange }: DeleteWorkoutDialogProps) {
  const navigate = useNavigate();
  const remove = useDeleteWorkout();

  async function deleteWorkout() {
    try {
      await remove.mutateAsync(workoutId);
    } catch {
      toast.error("Could not delete workout");
      return;
    }
    toast.success("Workout deleted");
    await navigate({ to: "/history" });
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      size="default"
      title="Delete workout?"
      description="This workout and its sets will be permanently removed."
      confirmLabel="Delete"
      keepOpenOnConfirm
      pending={remove.isPending}
      onConfirm={() => void deleteWorkout()}
    />
  );
}
