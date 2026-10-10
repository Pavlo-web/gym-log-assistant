import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/PageStatus";
import { StorageWriteError } from "@/data";
import { useSaveWorkoutDraft, useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { isDraftEmpty } from "@/lib/draft";
import { draftFromPlan, UNTITLED_PLAN } from "@/lib/planned";
import type { PlannedWorkout } from "@/types/domain";
import { UpcomingWorkouts } from "./UpcomingWorkouts";
import { WorkoutForm } from "./WorkoutForm";

const FORM_ID = "workout-form";

export function WorkoutPage() {
  const draft = useWorkoutDraft();
  const saveDraft = useSaveWorkoutDraft();
  // The form reads its draft on mount, so starting a plan remounts it under a new key.
  const [formVersion, setFormVersion] = useState(0);
  const [replacingWith, setReplacingWith] = useState<PlannedWorkout | null>(null);

  const start = async (plan: PlannedWorkout) => {
    try {
      await saveDraft.mutateAsync(draftFromPlan(plan, new Date()));
    } catch (cause) {
      toast.error(cause instanceof StorageWriteError ? cause.message : "Could not start workout");
      return;
    }
    setFormVersion((version) => version + 1);
    // Wait for the refilled form to render before bringing it into view.
    requestAnimationFrame(() =>
      document.getElementById(FORM_ID)?.scrollIntoView({ block: "start" }),
    );
  };

  const requestStart = (plan: PlannedWorkout) => {
    if (draft.data && !isDraftEmpty(draft.data)) setReplacingWith(plan);
    else void start(plan);
  };

  return (
    <>
      <PageHeader title="Workout" description="Log a training session" />
      {draft.isPending ? (
        <LoadingState label="Loading…" />
      ) : (
        <>
          <UpcomingWorkouts activePlanId={draft.data?.planId} onStart={requestStart} />
          <div id={FORM_ID} className="scroll-mt-4">
            {/* Rendered only once the stored draft is known, because the form reads it on mount. */}
            <WorkoutForm key={formVersion} initial={draft.data ?? null} />
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!replacingWith}
        onOpenChange={(open) => {
          if (!open) setReplacingWith(null);
        }}
        title="Replace current workout?"
        description={`Starting “${replacingWith?.title ?? UNTITLED_PLAN}” discards the exercises and sets you have not saved.`}
        confirmLabel="Replace"
        onConfirm={() => {
          if (replacingWith) void start(replacingWith);
        }}
      />
    </>
  );
}
