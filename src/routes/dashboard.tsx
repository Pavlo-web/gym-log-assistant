import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Gym Log" },
      { name: "description", content: "An at-a-glance overview of your workouts, weekly volume, muscle split and recent records." },
      { property: "og:title", content: "Dashboard — Gym Log" },
      { property: "og:description", content: "An at-a-glance overview of your workouts, weekly volume, muscle split and recent records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});
