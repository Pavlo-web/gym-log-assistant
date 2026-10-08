import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { LineChart as ChartIcon } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useExercises } from "@/hooks/useExercises";
import { useWorkouts } from "@/hooks/useWorkouts";
import { exerciseHistory, loggedExercises, personalRecords } from "@/lib/progress";
import { ExerciseSelect } from "./ExerciseSelect";
import type { Metric } from "./ProgressChart";
import { RecordStats } from "./RecordStats";
import { SessionsTable } from "./SessionsTable";

// Recharts is heavy and browser-only, so the chart loads on demand on the client.
const ProgressChart = lazy(() => import("./ProgressChart"));
const chartPlaceholder = <div className="h-72" />;

const METRICS: { value: Metric; label: string }[] = [
  { value: "topWeight", label: "Top weight" },
  { value: "bestE1RM", label: "Est. 1RM" },
  { value: "volume", label: "Volume" },
];

function isMetric(value: string): value is Metric {
  return METRICS.some((metric) => metric.value === value);
}

interface ProgressPageProps {
  /** Exercise id from the URL; ignored when it has no logged sets. */
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

export function ProgressPage({ selectedId, onSelect }: ProgressPageProps) {
  const workouts = useWorkouts();
  const exercises = useExercises();
  const [metric, setMetric] = useState<Metric>("topWeight");

  const options = useMemo(
    () => loggedExercises(workouts.data ?? [], exercises.data ?? []),
    [workouts.data, exercises.data],
  );

  if (workouts.isPending || exercises.isPending) {
    return (
      <>
        <PageHeader title="Progress" />
        <p role="status" className="py-12 text-muted-foreground">
          Loading progress…
        </p>
      </>
    );
  }

  if (workouts.isError || exercises.isError) {
    return (
      <>
        <PageHeader title="Progress" />
        <p role="alert" className="py-12 text-destructive">
          Could not load progress. Please try again.
        </p>
      </>
    );
  }

  // Default to the most recently trained exercise: options are ordered newest first.
  const current = options.find((option) => option.id === selectedId) ?? options[0];
  if (!current) {
    return (
      <>
        <PageHeader title="Progress" />
        <EmptyState
          icon={ChartIcon}
          title="No workouts yet"
          description="Log a workout to start tracking your progress."
        >
          <Button asChild className="mt-5">
            <Link to="/">Log a workout</Link>
          </Button>
        </EmptyState>
      </>
    );
  }

  const points = exerciseHistory(workouts.data, current.id);
  const records = personalRecords(workouts.data, current.id);

  return (
    <>
      <PageHeader title="Progress" />
      <div className="mb-6">
        <ExerciseSelect options={options} value={current.id} onChange={onSelect} />
      </div>

      {records && <RecordStats records={records} />}

      <section className="mb-6 rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={metric}
          onValueChange={(value) => {
            // Radix sends an empty string when the active item is clicked again.
            if (isMetric(value)) setMetric(value);
          }}
          className="mobile-metric mb-4 justify-start"
          aria-label="Chart metric"
        >
          {METRICS.map(({ value, label }) => (
            <ToggleGroupItem key={value} value={value}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ClientOnly fallback={chartPlaceholder}>
          <Suspense fallback={chartPlaceholder}>
            <ProgressChart points={points} metric={metric} />
          </Suspense>
        </ClientOnly>
        {points.length === 1 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Log more sessions with this exercise to see a trend.
          </p>
        )}
      </section>

      <SessionsTable points={points} records={records} />
    </>
  );
}
