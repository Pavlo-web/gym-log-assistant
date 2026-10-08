import { createFileRoute } from "@tanstack/react-router";
import { ProgressPage } from "@/components/progress/ProgressPage";
import { pageMeta } from "@/lib/page-meta";

interface ProgressSearch {
  /** Id of the exercise to show; kept in the URL so the view can be linked and reloaded. */
  exercise?: string;
}

export const Route = createFileRoute("/progress")({
  validateSearch: (search: Record<string, unknown>): ProgressSearch => {
    const exercise = search["exercise"];
    return typeof exercise === "string" && exercise ? { exercise } : {};
  },
  head: () => ({
    meta: pageMeta("Progress", "Track strength progress and training volume over time."),
  }),
  component: ProgressRoute,
});

function ProgressRoute() {
  const { exercise } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <ProgressPage
      selectedId={exercise}
      onSelect={(id) => void navigate({ search: { exercise: id }, replace: true })}
    />
  );
}
