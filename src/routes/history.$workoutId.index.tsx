import { createFileRoute } from "@tanstack/react-router";
import { HistoryDetail } from "@/components/history/HistoryDetail";

export const Route = createFileRoute("/history/$workoutId/")({
  head: () => ({ meta: [
    { title: "Workout details — Gym Log" },
    { name: "description", content: "Review the exercises and sets in a saved workout." },
    { property: "og:title", content: "Workout details — Gym Log" },
    { property: "og:description", content: "Review the exercises and sets in a saved workout." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <HistoryDetail workoutId={Route.useParams().workoutId} />,
});