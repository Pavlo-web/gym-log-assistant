import { createFileRoute } from "@tanstack/react-router";
import { ProgressPage } from "@/components/progress/ProgressPage";

export const Route = createFileRoute("/progress")({
  validateSearch: (search: Record<string, unknown>): { exercise?: string } =>
    typeof search["exercise"] === "string" && search["exercise"]
      ? { exercise: search["exercise"] }
      : {},
  head: () => ({
    meta: [
      { title: "Progress — Gym Log" },
      { name: "description", content: "Track strength progress and training volume over time." },
      { property: "og:title", content: "Progress — Gym Log" },
      {
        property: "og:description",
        content: "Track strength progress and training volume over time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
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
