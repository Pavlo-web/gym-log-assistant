import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExercises } from "@/hooks/useExercises";
import { useWorkouts } from "@/hooks/useWorkouts";
import { workoutVolume } from "@/lib/calc";
import { exerciseLabel, localWorkoutDate, workoutStats } from "./history-utils";

export function HistoryList() {
  const workouts = useWorkouts();
  const exercises = useExercises();
  const groups = new Map<string, NonNullable<typeof workouts.data>>();
  for (const workout of workouts.data ?? []) {
    const month = format(localWorkoutDate(workout.date), "MMMM yyyy");
    groups.set(month, [...(groups.get(month) ?? []), workout]);
  }
  return <>
    <PageHeader title="History" />
    {workouts.isPending || exercises.isPending ? <p role="status" className="py-12 text-center text-muted-foreground">Loading workouts…</p>
      : workouts.isError || exercises.isError ? <p role="alert" className="py-12 text-center text-destructive">Could not load history. Please try again.</p>
      : groups.size === 0 ? <div className="py-16 text-center"><p className="mb-5 text-muted-foreground">No workouts yet.</p><Button asChild><Link to="/">Log a workout</Link></Button></div>
      : [...groups].map(([month, items]) => <section key={month} className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">{month}</h2>
        <div className="space-y-3">{items.map((workout) => {
          const stats = workoutStats(workout);
          const names = workout.entries.slice(0, 3).map((entry) => exerciseLabel(entry, exercises.data ?? []).name);
          const more = workout.entries.length - names.length;
          return <Link key={workout.id} to="/history/$workoutId" params={{ workoutId: workout.id }} className="block rounded-md border border-border bg-card p-3 md:p-5 transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="grid grid-cols-1 items-center gap-3 md:flex md:flex-wrap md:justify-between md:gap-4">
              <div className="min-w-0 flex-1"><h3 className="break-words font-semibold">{format(localWorkoutDate(workout.date), "EEE, d MMM yyyy")}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{names.join(", ")}{more > 0 ? ` +${more} more` : ""}</p></div>
              <div className="grid grid-cols-[1fr_1fr_minmax(0,1.7fr)_auto] items-center gap-2 text-right text-sm tabular md:flex md:gap-5"><div><strong className="block">{stats.exercises}</strong><span className="text-muted-foreground">Exercises</span></div><div><strong className="block">{stats.sets}</strong><span className="text-muted-foreground">Sets</span></div><div><strong className="block">{workoutVolume(workout).toLocaleString("en-US", { maximumFractionDigits: 1 })} kg</strong><span className="text-muted-foreground">Volume</span></div><ChevronRight className="size-4 text-muted-foreground" /></div>
            </div>
          </Link>;
        })}</div>
      </section>)}
  </>;
}