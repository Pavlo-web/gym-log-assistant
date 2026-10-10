import type { MouseEvent, ReactNode } from "react";
import { FormAlert } from "@/components/FormMessages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  /**
   * Keep the dialog open after confirming. Use it for async actions that close
   * the dialog themselves once they succeed, so a failure can be shown inside.
   */
  keepOpenOnConfirm?: boolean;
  /** Disables the confirm button while the action is running. */
  pending?: boolean;
  /** Error from a failed action, shown above the buttons. */
  error?: string;
  size?: "sm" | "default";
}

/** Confirmation for destructive actions: a cancel button and a red confirm button. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  keepOpenOnConfirm = false,
  pending = false,
  error,
  size = "sm",
}: ConfirmDialogProps) {
  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    if (keepOpenOnConfirm) event.preventDefault();
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent {...(size === "sm" ? { className: "max-w-sm" } : {})}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <FormAlert>{error}</FormAlert>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={pending}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
