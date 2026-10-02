import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workout — Gym Log" },
      { name: "description", content: "Log today's gym workout: exercises, sets, weights and reps." },
      { property: "og:title", content: "Workout — Gym Log" },
      { property: "og:description", content: "Log today's gym workout: exercises, sets, weights and reps." },
    ],
  }),
  component: WorkoutPage,
});

function WorkoutPage() {
  return (
    <AppShell>
      <ComingSoon title="Workout" />
    </AppShell>
  );
}
