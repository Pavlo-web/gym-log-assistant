import { lazy, Suspense } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { LayoutDashboard, Plus } from "lucide-react";
import { DemoDataNotice, DemoDataOffer, LoadDemoDataButton } from "@/components/DemoData";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, LoadingState } from "@/components/PageStatus";
import { Button } from "@/components/ui/button";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useWorkouts } from "@/hooks/useWorkouts";
import { trainingCalendar } from "@/lib/calendar";
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
import { NextWorkoutNotice } from "./NextWorkoutNotice";
import { RecentRecords } from "./RecentRecords";
import { RecentWorkouts } from "./RecentWorkouts";
import { SummaryTiles } from "./SummaryTiles";
import { TrainingCalendar } from "./TrainingCalendar";

// Recharts is heavy and browser-only, so the chart loads on demand on the client.
const WeeklyVolumeChart = lazy(() => import("./WeeklyVolumeChart"));
const chartPlaceholder = <div className="h-64" />;

/** Pairs of sections sit side by side once the screen is wide enough for two readable columns. */
const TWO_COLUMNS = "grid grid-cols-1 gap-x-6 xl:grid-cols-2";

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

      <div className={TWO_COLUMNS}>
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
      </div>

      <DashboardSection title="Training calendar" subtitle="Last 12 months">
        <TrainingCalendar calendar={trainingCalendar(workouts, today)} />
      </DashboardSection>

      <div className={TWO_COLUMNS}>
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
      </div>
      <DemoDataOffer />
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
        <LoadingState label="Loading dashboard…" />
      </>
    );
  }

  if (workouts.isError || exercises.isError) {
    return (
      <>
        <DashboardHeader />
        <ErrorState
          message="Could not load dashboard."
          onRetry={() => {
            void workouts.refetch();
            void exercises.refetch();
          }}
        />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <DemoDataNotice />
      <NextWorkoutNotice />
      {hasUnfinishedDraft(draft.data) && <DraftNotice />}
      {workouts.data.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="No workouts yet"
          description="Your overview will appear here once you log a workout."
        >
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/">Log your first workout</Link>
            </Button>
            <LoadDemoDataButton />
          </div>
        </EmptyState>
      ) : (
        <Overview workouts={workouts.data} exercises={exercises.data} />
      )}
    </>
  );
}
