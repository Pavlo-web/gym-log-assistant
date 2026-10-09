import { useState } from "react";
import { CalendarPlus, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorageWriteError } from "@/data";
import { useNow } from "@/hooks/useNow";
import { useDeletePlannedWorkout, usePlannedWorkouts } from "@/hooks/usePlannedWorkouts";
import { formatWeekdayDay } from "@/lib/date";
import { countdown, UNTITLED_PLAN } from "@/lib/planned";
import { cn } from "@/lib/utils";
import type { PlannedWorkout } from "@/types/domain";
import { PlanWorkoutDialog } from "./PlanWorkoutDialog";

interface PlanRowProps {
  plan: PlannedWorkout;
  now: Date;
  /** True while the workout form is filled from this plan. */
  inProgress: boolean;
  onStart: () => void;
  onDelete: () => void;
}

function PlanRow({ plan, now, inProgress, onStart, onDelete }: PlanRowProps) {
  const { due, label } = countdown(plan, now);
  const title = plan.title ?? UNTITLED_PLAN;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
          <span className="min-w-0 break-words">{title}</span>
          <Badge
            variant="outline"
            className={cn("tabular", due ? "border-primary/50 text-primary" : "font-normal")}
          >
            {inProgress ? "In progress" : label}
          </Badge>
        </div>
        <p className="tabular mt-1 text-xs text-muted-foreground">
          {formatWeekdayDay(plan.date)} · {plan.time}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {plan.exercises.map((exercise) => exercise.exerciseName).join(", ")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!inProgress && (
          <Button size="sm" variant={due ? "default" : "outline"} onClick={onStart}>
            <Play /> Start
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Delete planned workout ${title}`}
          title="Delete plan"
          onClick={onDelete}
          className="text-muted-foreground hover:text-danger"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}

interface UpcomingWorkoutsProps {
  /** Plan the workout form is currently filled from, if any. */
  activePlanId: string | undefined;
  onStart: (plan: PlannedWorkout) => void;
}

/** Planned workouts with a countdown to each, and the way to plan another. */
export function UpcomingWorkouts({ activePlanId, onStart }: UpcomingWorkoutsProps) {
  const { data: plans = [] } = usePlannedWorkouts();
  const deletePlan = useDeletePlannedWorkout();
  const now = useNow();
  const [planning, setPlanning] = useState(false);
  const [deleting, setDeleting] = useState<PlannedWorkout | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deletePlan.mutateAsync(deleting.id);
      toast.success("Plan deleted");
    } catch (cause) {
      toast.error(cause instanceof StorageWriteError ? cause.message : "Could not delete plan");
    }
  }

  return (
    <section
      aria-label="Upcoming workouts"
      className="mb-6 rounded-md border border-border bg-card min-w-0 p-3 md:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Upcoming</h2>
        <Button variant="outline" size="sm" onClick={() => setPlanning(true)}>
          <CalendarPlus /> Plan workout
        </Button>
      </div>

      {plans.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing planned. Plan a workout to see how long is left until it.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {plans.map((plan) => (
            <PlanRow
              key={plan.id}
              plan={plan}
              now={now}
              inProgress={plan.id === activePlanId}
              onStart={() => onStart(plan)}
              onDelete={() => setDeleting(plan)}
            />
          ))}
        </ul>
      )}

      <PlanWorkoutDialog open={planning} onOpenChange={setPlanning} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete planned workout?"
        description={`“${deleting?.title ?? UNTITLED_PLAN}” will be removed from your upcoming workouts.`}
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}
