import { createFileRoute } from "@tanstack/react-router";
import { ExercisesPage } from "@/components/exercises/ExercisesPage";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: pageMeta("Exercises", "Browse and manage your exercise library by muscle group."),
  }),
  component: ExercisesPage,
});
