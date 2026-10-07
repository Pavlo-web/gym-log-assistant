import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workout — Gym Log" },
      {
        name: "description",
        content: "Log today's gym workout: exercises, sets, weights and reps.",
      },
      { property: "og:title", content: "Workout — Gym Log" },
      {
        property: "og:description",
        content: "Log today's gym workout: exercises, sets, weights and reps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkoutPage,
});

function WorkoutPage() {
  const { data, isPending } = useWorkoutDraft();
  return (
    <>
      <PageHeader title="Workout" description="Log a training session" />
      {isPending ? (
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : (
        <WorkoutForm initial={data ?? null} />
      )}
    </>
  );
}
