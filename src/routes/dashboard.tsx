import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: pageMeta(
      "Dashboard",
      "An at-a-glance overview of your workouts, weekly volume, muscle split and recent records.",
    ),
  }),
  component: DashboardPage,
});
