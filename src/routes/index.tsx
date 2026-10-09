import { createFileRoute } from "@tanstack/react-router";
import { WorkoutPage } from "@/components/workout/WorkoutPage";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: pageMeta("Workout", "Log today's gym workout: exercises, sets, weights and reps."),
  }),
  component: WorkoutPage,
});
