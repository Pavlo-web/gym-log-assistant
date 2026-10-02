import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workout — Gym Log" },
      { name: "description", content: "Log today's gym workout: exercises, sets, weights and reps." },
      { property: "og:title", content: "Workout — Gym Log" },
      { property: "og:description", content: "Log today's gym workout: exercises, sets, weights and reps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkoutPage,
});

function WorkoutPage() {
  return <ComingSoon title="Workout" />;
}
