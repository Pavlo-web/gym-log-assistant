import { lazy, Suspense, type ReactNode } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronRight, LayoutDashboard, Plus } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExercises } from "@/hooks/useExercises";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { workoutVolume } from "@/lib/calc";
import {
  muscleGroupSplit,
  recentPRs,
  weeklyBuckets,
  weeklyStreak,
  workoutsThisMonth,
} from "@/lib/dashboard";
import { localWorkoutDate, workoutStats } from "@/components/history/history-utils";
import type { WorkoutDraft } from "@/types/domain";

const WeeklyVolumeChart = lazy(() => import("./WeeklyVolumeChart"));
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const day = (d: string) => format(localWorkoutDate(d), "d MMM yyyy");

function Header() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <PageHeader title="Dashboard" description="An overview of your recent training." />
      <Button asChild>
        <Link to="/">
          <Plus /> Log workout
        </Link>
      </Button>
    </div>
  );
}

function hasDraft(d: WorkoutDraft | null | undefined) {
  return !!d && (d.entries.length > 0 || d.notes.trim() !== "");
}

export function DashboardPage() {
  const workouts = useWorkouts();
  const exercises = useExercises();
  const draft = useWorkoutDraft();

  const draftNotice = hasDraft(draft.data) ? (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3 text-sm">
      <span className="text-muted-foreground">You have an unfinished workout.</span>
      <Button asChild variant="link" className="h-auto p-0">
        <Link to="/">Continue draft</Link>
      </Button>
    </div>
  ) : null;

  if (workouts.isPending || exercises.isPending)
    return (
      <>
        <Header />
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">
          Loading dashboard…
        </p>
      </>
    );
  if (workouts.isError || exercises.isError)
    return (
      <>
        <Header />
        <div role="alert" className="py-12 text-center text-sm text-muted-foreground">
          Could not load dashboard.{" "}
          <Button
            variant="link"
            onClick={() => {
              void workouts.refetch();
              void exercises.refetch();
            }}
          >
            Try again
          </Button>
        </div>
      </>
    );

  const all = workouts.data;
  if (all.length === 0)
    return (
      <>
        <Header />
        {draftNotice}
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
          <LayoutDashboard aria-hidden="true" className="mb-3 size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No workouts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your overview will appear here once you log a workout.
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Log your first workout</Link>
          </Button>
        </div>
      </>
    );

  const today = new Date();
  const weeks = weeklyBuckets(all, today);
  const thisWeek = weeks.at(-1)!;
  const lastWeek = weeks.at(-2)!;
  const split = muscleGroupSplit(all, exercises.data, today);
  const maxSets = Math.max(1, ...split.map((s) => s.sets));
  const prs = recentPRs(all, exercises.data);
  const recent = all.slice(0, 5);
  const streak = weeklyStreak(all, today);

  return (
    <>
      <Header />
      {draftNotice}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="Workouts this week"
          value={String(thisWeek.workouts)}
          delta={delta(thisWeek.workouts - lastWeek.workouts, "")}
        />
        <Tile label="Workouts this month" value={String(workoutsThisMonth(all, today))} />
        <Tile
          label="Volume this week"
          value={`${fmt(thisWeek.volume)} kg`}
          delta={delta(thisWeek.volume - lastWeek.volume, " kg")}
        />
        <Tile label="Weekly streak" value={`${streak} ${streak === 1 ? "week" : "weeks"}`} />
      </div>

      <Section title="Weekly volume" subtitle="Last 8 weeks">
        <ClientOnly fallback={<div className="h-64" />}>
          <Suspense fallback={<div className="h-64" />}>
            <WeeklyVolumeChart data={weeks} />
          </Suspense>
        </ClientOnly>
      </Section>

      <Section title="Muscle group split" subtitle="Sets in the last 30 days">
        <ul className="space-y-3" aria-label="Sets per muscle group">
          {split.map((s) => (
            <li key={s.group} className="grid grid-cols-[88px_1fr_40px] items-center gap-3 text-sm">
              <span className="text-muted-foreground">{s.group}</span>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(s.sets / maxSets) * 100}%` }}
                />
              </div>
              <span className="text-right tabular">{s.sets}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recent personal records" subtitle="Best estimated 1RM">
        {prs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {prs.map((p) => (
              <li
                key={`${p.exerciseId}-${p.date}`}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{day(p.date)}</p>
                </div>
                <div className="text-right tabular">
                  <p>
                    {fmt(p.weight)} kg × {p.reps}
                  </p>
                  <p className="text-xs text-muted-foreground">{fmt(p.value)} kg est. 1RM</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Recent workouts"
        action={
          <Button asChild variant="link" className="h-auto p-0">
            <Link to="/history">View all</Link>
          </Button>
        }
      >
        <ul className="divide-y divide-border text-sm">
          {recent.map((w) => {
            const stats = workoutStats(w);
            return (
              <li key={w.id}>
                <Link
                  to="/history/$workoutId"
                  params={{ workoutId: w.id }}
                  className="flex items-center justify-between gap-4 py-2.5 hover:text-primary"
                >
                  <span className="font-medium">
                    {format(localWorkoutDate(w.date), "EEE, d MMM yyyy")}
                  </span>
                  <span className="flex items-center gap-4 text-muted-foreground tabular">
                    <span>{stats.exercises} ex</span>
                    <span>{stats.sets} sets</span>
                    <span className="text-foreground">{fmt(workoutVolume(w))} kg</span>
                    <ChevronRight className="size-4" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}

function delta(diff: number, unit: string) {
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "±";
  return `${sign}${fmt(Math.abs(diff))}${unit} vs last week`;
}

function Tile({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular">{value}</p>
      {delta && <p className="mt-1 text-xs text-muted-foreground tabular">{delta}</p>}
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-6 rounded-md border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
