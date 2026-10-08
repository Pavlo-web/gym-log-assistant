import { createFileRoute } from "@tanstack/react-router";
import { HistoryList } from "@/components/history/HistoryList";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: pageMeta("History", "Browse your past workouts and training volume."),
  }),
  component: HistoryList,
});
