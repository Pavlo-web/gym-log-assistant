import { createFileRoute } from "@tanstack/react-router";
import { HistoryDetail } from "@/components/history/HistoryDetail";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/history/$workoutId/")({
  head: () => ({
    meta: pageMeta("Workout details", "Review the exercises and sets in a saved workout."),
  }),
  component: WorkoutDetailsRoute,
});

function WorkoutDetailsRoute() {
  const { workoutId } = Route.useParams();
  return <HistoryDetail workoutId={workoutId} />;
}
