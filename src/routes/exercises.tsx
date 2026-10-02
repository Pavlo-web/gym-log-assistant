import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/AppShell";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "Exercises — Gym Log" },
      { name: "description", content: "Your exercise library, by muscle group, with custom exercises." },
      { property: "og:title", content: "Exercises — Gym Log" },
      { property: "og:description", content: "Your exercise library, by muscle group, with custom exercises." },
    ],
  }),
  component: ExercisesPage,
});

function ExercisesPage() {
  return (
    <AppShell>
      <ComingSoon title="Exercises" />
    </AppShell>
  );
}
