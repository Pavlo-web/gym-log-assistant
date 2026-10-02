import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/AppShell";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Gym Log" },
      { name: "description", content: "Browse your past workouts and training volume." },
      { property: "og:title", content: "History — Gym Log" },
      { property: "og:description", content: "Browse your past workouts and training volume." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return <ComingSoon title="History" />;
}
