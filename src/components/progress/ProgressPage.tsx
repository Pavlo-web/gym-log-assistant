import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { format } from "date-fns";
import { LineChart as ChartIcon } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useExercises } from "@/hooks/useExercises";
import { useWorkouts } from "@/hooks/useWorkouts";
import { exerciseHistory, personalRecords } from "@/lib/progress";
import { localWorkoutDate } from "@/components/history/history-utils";
import { ExerciseSelect, type ExerciseOption } from "./ExerciseSelect";
import type { Metric } from "./ProgressChart";

const ProgressChart = lazy(() => import("./ProgressChart"));
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const day = (d: string) => format(localWorkoutDate(d), "d MMM yyyy");

export function ProgressPage({ selectedId, onSelect }: { selectedId: string | undefined; onSelect: (id: string) => void }) {
  const workouts = useWorkouts();
  const exercises = useExercises();
  const [metric, setMetric] = useState<Metric>("topWeight");

  const options = useMemo<ExerciseOption[]>(() => {
    const map = new Map<string, ExerciseOption>();
    for (const w of workouts.data ?? []) for (const e of w.entries) {
      if (map.has(e.exerciseId) || e.sets.length === 0) continue;
      const live = exercises.data?.find((x) => x.id === e.exerciseId);
      const group = live?.muscleGroup ?? e.muscleGroup;
      map.set(e.exerciseId, { id: e.exerciseId, name: live?.name ?? e.exerciseName ?? "Deleted exercise", ...(group ? { group } : {}) });
    }
    return [...map.values()];
  }, [workouts.data, exercises.data]);

  if (workouts.isPending || exercises.isPending) return <><PageHeader title="Progress" /><p role="status" className="py-12 text-muted-foreground">Loading progress…</p></>;
  if (workouts.isError || exercises.isError) return <><PageHeader title="Progress" /><p role="alert" className="py-12 text-destructive">Could not load progress. Please try again.</p></>;
  if (options.length === 0) return <><PageHeader title="Progress" />
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <ChartIcon aria-hidden="true" className="mb-3 size-6 text-muted-foreground" />
      <p className="text-sm font-medium">No workouts yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Log a workout to start tracking your progress.</p>
      <Button asChild className="mt-5"><Link to="/">Log a workout</Link></Button>
    </div></>;

  const fallback = workouts.data?.find((w) => w.entries.some((e) => e.sets.length))?.entries.find((e) => e.sets.length)?.exerciseId ?? options[0]!.id;
  const current = options.some((o) => o.id === selectedId) ? selectedId! : fallback;
  const points = exerciseHistory(workouts.data ?? [], current);
  const records = personalRecords(workouts.data ?? [], current);

  return <>
    <PageHeader title="Progress" />
    <div className="mb-6"><ExerciseSelect options={options} value={current} onChange={onSelect} /></div>

    {records && <div className="mb-6 grid gap-4 md:grid-cols-3">
      <Stat label="Heaviest weight" value={`${fmt(records.maxWeight.value)} kg × ${records.maxWeight.reps}`} date={records.maxWeight.date} />
      <Stat label="Best estimated 1RM" value={`${fmt(records.bestE1RM.value)} kg`} sub={`from ${fmt(records.bestE1RM.weight)} kg × ${records.bestE1RM.reps}`} date={records.bestE1RM.date} />
      <Stat label="Most volume in a session" value={`${fmt(records.maxVolume.value)} kg`} date={records.maxVolume.date} />
    </div>}

    <section className="mb-6 rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
      <ToggleGroup type="single" variant="outline" size="sm" value={metric} onValueChange={(v) => v && setMetric(v as Metric)} className="mobile-metric mb-4 justify-start" aria-label="Chart metric">
        <ToggleGroupItem value="topWeight">Top weight</ToggleGroupItem>
        <ToggleGroupItem value="bestE1RM">Est. 1RM</ToggleGroupItem>
        <ToggleGroupItem value="volume">Volume</ToggleGroupItem>
      </ToggleGroup>
      <ClientOnly fallback={<div className="h-72" />}>
        <Suspense fallback={<div className="h-72" />}><ProgressChart points={points} metric={metric} /></Suspense>
      </ClientOnly>
      {points.length === 1 && <p className="mt-2 text-sm text-muted-foreground">Log more sessions with this exercise to see a trend.</p>}
    </section>

    <section className="rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
      <h2 className="mb-3 font-semibold">Sessions</h2>
      <div className="overflow-x-auto"><table className="mobile-sessions w-full text-sm tabular" aria-label="Sessions">
        <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-2 font-normal">Date</th><th className="pb-2 font-normal">Sets</th><th className="pb-2 font-normal">Top weight</th><th className="pb-2 font-normal">Est. 1RM</th><th className="pb-2 text-right font-normal">Volume</th></tr></thead>
        <tbody>{[...points].reverse().map((p) => {
          const pr = records && (records.maxWeight.date === p.date || records.bestE1RM.date === p.date || records.maxVolume.date === p.date);
          return <tr key={p.date} className="border-t border-border">
            <td className="py-2"><Link to="/history/$workoutId" params={{ workoutId: p.workoutIds[0]! }} className="hover:text-primary hover:underline">{day(p.date)}</Link>{pr && <Badge variant="outline" className="ml-2 border-primary/50 text-primary">PR</Badge>}</td>
            <td data-label="Sets">{p.sets}</td><td data-label="Top weight">{fmt(p.topWeight)} kg × {p.topReps}</td><td data-label="Est. 1RM">{fmt(p.bestE1RM)} kg</td><td data-label="Volume" className="text-right">{fmt(p.volume)} kg</td>
          </tr>;
        })}</tbody>
      </table></div>
    </section>
  </>;
}

function Stat({ label, value, sub, date }: { label: string; value: string; sub?: string; date: string }) {
  return <div className="rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-2 text-2xl font-semibold tabular">{value}</p>
    {sub && <p className="text-xs text-muted-foreground tabular">{sub}</p>}
    <p className="mt-2 text-xs text-muted-foreground">{day(date)}</p>
  </div>;
}
