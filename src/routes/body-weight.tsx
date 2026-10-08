import { createFileRoute } from "@tanstack/react-router";
import { BodyWeightPage } from "@/components/body-weight/BodyWeightPage";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/body-weight")({
  head: () => ({
    meta: pageMeta("Body weight", "Log your body weight and follow the trend over time."),
  }),
  component: BodyWeightPage,
});
