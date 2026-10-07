import { createFileRoute } from "@tanstack/react-router";
import { HistoryEdit } from "@/components/history/HistoryEdit";

export const Route = createFileRoute("/history/$workoutId/edit")({
  head: () => ({
    meta: [
      { title: "Edit workout — Gym Log" },
      {
        name: "description",
        content: "Edit the date, notes, exercises and sets in a saved workout.",
      },
      { property: "og:title", content: "Edit workout — Gym Log" },
      {
        property: "og:description",
        content: "Edit the date, notes, exercises and sets in a saved workout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <HistoryEdit workoutId={Route.useParams().workoutId} />,
});
