import { createFileRoute } from "@tanstack/react-router";
import { HistoryEdit } from "@/components/history/HistoryEdit";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/history/$workoutId/edit")({
  head: () => ({
    meta: pageMeta("Edit workout", "Edit the date, notes, exercises and sets in a saved workout."),
  }),
  component: EditWorkoutRoute,
});

function EditWorkoutRoute() {
  const { workoutId } = Route.useParams();
  return <HistoryEdit workoutId={workoutId} />;
}
