import { Surface } from "@/components/Surface";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/useNow";
import { usePlannedWorkouts } from "@/hooks/usePlannedWorkouts";
import { countdown, UNTITLED_PLAN } from "@/lib/planned";

export function NextWorkoutNotice() {
  const { data: plans = [] } = usePlannedWorkouts();
  const now = useNow();
  const next = plans[0];
  if (!next) return null;

  return (
    <Surface
      padding="compact"
      className="mb-6 grid grid-cols-1 items-center gap-2 text-sm md:flex md:justify-between md:gap-4"
    >
      <span className="min-w-0 break-words">
        <span className="text-muted-foreground">Next workout: </span>
        {next.title ?? UNTITLED_PLAN}
        <span className="tabular text-muted-foreground">
          {" "}
          · {countdown(next, now).label.toLowerCase()}
        </span>
      </span>
      <Button asChild variant="link" className="h-auto justify-start p-0 md:justify-end">
        <Link to="/">Open</Link>
      </Button>
    </Surface>
  );
}
