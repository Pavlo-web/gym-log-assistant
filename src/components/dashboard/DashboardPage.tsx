import { lazy, Suspense } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { LayoutDashboard, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useWorkouts } from "@/hooks/useWorkouts";
import {
  muscleGroupSplit,
  RECENT_ITEMS,
  recentPRs,
  weeklyBuckets,
  weeklyStreak,
  workoutsThisMonth,
} from "@/lib/dashboard";
import type { Exercise, Workout, WorkoutDraft } from "@/types/domain";
import { DashboardSection } from "./DashboardSection";
import { MuscleSplit } from "./MuscleSplit";
import { RecentRecords } from "./RecentRecords";
import { RecentWorkouts } from "./RecentWorkouts";
import { SummaryTiles } from "./SummaryTiles";

// Recharts is heavy and browser-only, so the chart loads on demand on the client.
const WeeklyVolumeChart = lazy(() => import("./WeeklyVolumeChart"));
const chartPlaceholder = <div className="h-64" />;

function DashboardHeader() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:flex md:flex-wrap md:justify-between">
      <PageHeader title="Dashboard" description="An overview of your recent training." />
      {/* Phones reach the same action through the bottom navigation. */}
      <Button asChild className="hidden md:inline-flex">
        <Link to="/">
          <Plus /> Log workout
        </Link>
      </Button>
    </div>
  );
}

function hasUnfinishedDraft(draft: WorkoutDraft | null | undefined): boolean {
  return !!draft && (draft.entries.length > 0 || draft.notes.trim() !== "");
}

function DraftNotice() {
  return (
    <div className="mb-6 grid grid-cols-1 items-center gap-2 md:flex md:justify-between md:gap-4 rounded-md border border-border bg-card px-4 py-3 text-sm">
      <span className="text-muted-foreground">You have an unfinished workout.</span>
      <Button asChild variant="link" className="h-auto p-0">
        <Link to="/">Continue draft</Link>
      </Button>
    </div>
  );
}

interface OverviewProps {
  /** Newest first. */
  workouts: Workout[];
  exercises: Exercise[];
}

function Overview({ workouts, exercises }: OverviewProps) {
  const today = new Date();
  const weeks = weeklyBuckets(workouts, today);
  const [lastWeek, thisWeek] = weeks.slice(-2);

  return (
    <>
      {thisWeek && lastWeek && (
        <SummaryTiles
          thisWeek={thisWeek}
          lastWeek={lastWeek}
          workoutsThisMonth={workoutsThisMonth(workouts, today)}
          streak={weeklyStreak(workouts, today)}
        />
      )}

      <DashboardSection title="Weekly volume" subtitle="Last 8 weeks">
        <ClientOnly fallback={chartPlaceholder}>
          <Suspense fallback={chartPlaceholder}>
            <WeeklyVolumeChart data={weeks} />
          </Suspense>
        </ClientOnly>
      </DashboardSection>

      <DashboardSection title="Muscle group split" subtitle="Sets in the last 30 days">
        <MuscleSplit split={muscleGroupSplit(workouts, exercises, today)} />
      </DashboardSection>

      <DashboardSection title="Recent personal records" subtitle="Best estimated 1RM">
        <RecentRecords records={recentPRs(workouts, exercises)} />
      </DashboardSection>

      <DashboardSection
        title="Recent workouts"
        action={
          <Button asChild variant="link" className="h-auto p-0">
            <Link to="/history">View all</Link>
          </Button>
        }
      >
        <RecentWorkouts workouts={workouts.slice(0, RECENT_ITEMS)} />
      </DashboardSection>
    </>
  );
}

export function DashboardPage() {
  const workouts = useWorkouts();
  const exercises = useExercises();
  const draft = useWorkoutDraft();

  if (workouts.isPending || exercises.isPending) {
    return (
      <>
        <DashboardHeader />
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">
          Loading dashboard…
        </p>
      </>
    );
  }

  if (workouts.isError || exercises.isError) {
    return (
      <>
        <DashboardHeader />
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
  }

  return (
    <>
      <DashboardHeader />
      {hasUnfinishedDraft(draft.data) && <DraftNotice />}
      {workouts.data.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="No workouts yet"
          description="Your overview will appear here once you log a workout."
        >
          <Button asChild className="mt-5">
            <Link to="/">Log your first workout</Link>
          </Button>
        </EmptyState>
      ) : (
        <Overview workouts={workouts.data} exercises={exercises.data} />
      )}
    </>
  );
}
