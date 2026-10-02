import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/AppShell";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Gym Log" },
      { name: "description", content: "Track strength progress and training volume over time." },
      { property: "og:title", content: "Progress — Gym Log" },
      { property: "og:description", content: "Track strength progress and training volume over time." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  return (
    <AppShell>
      <ComingSoon title="Progress" />
    </AppShell>
  );
}
