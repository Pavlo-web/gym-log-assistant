import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StorageWriteError } from "@/data";
import { useDeleteWorkout } from "@/hooks/useWorkouts";

interface DeleteWorkoutDialogProps {
  workoutId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkoutDialog({ workoutId, open, onOpenChange }: DeleteWorkoutDialogProps) {
  const navigate = useNavigate();
  const remove = useDeleteWorkout();

  const deleteWorkout = async () => {
    try {
      await remove.mutateAsync(workoutId);
    } catch (cause) {
      toast.error(cause instanceof StorageWriteError ? cause.message : "Could not delete workout");
      return;
    }
    toast.success("Workout deleted");
    await navigate({ to: "/history" });
  };

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
