import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: pageMeta("Workout", "Log today's gym workout: exercises, sets, weights and reps."),
  }),
  component: WorkoutPage,
});

function WorkoutPage() {
  const draft = useWorkoutDraft();
  return (
    <>
      <PageHeader title="Workout" description="Log a training session" />
      {draft.isPending ? (
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : (
        // Rendered only once the stored draft is known, because the form reads it on mount.
        <WorkoutForm initial={draft.data ?? null} />
      )}
    </>
  );
}
