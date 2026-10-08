import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Weight } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatTile } from "@/components/StatTile";
import { Button } from "@/components/ui/button";
import { useBodyWeight, useDeleteBodyWeight } from "@/hooks/useBodyWeight";
import {
  bodyWeightRows,
  bodyWeightSummary,
  chronological,
  formatWeightChange,
  TREND_DAYS,
  type BodyWeightRow,
  type BodyWeightSummary,
} from "@/lib/body-weight";
import { formatDay } from "@/lib/date";
import { formatNumber } from "@/lib/number";
import { BodyWeightForm } from "./BodyWeightForm";
import { BodyWeightLog } from "./BodyWeightLog";

// Recharts is heavy and browser-only, so the chart loads on demand on the client.
const BodyWeightChart = lazy(() => import("./BodyWeightChart"));
const chartPlaceholder = <div className="h-64" />;

const HEADER = (
  <PageHeader title="Body weight" description="Track your weight alongside your training" />
);

function Summary({ summary }: { summary: BodyWeightSummary }) {
  const { latest, sincePrevious, overTrend, lowest, highest } = summary;
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 min-[350px]:grid-cols-2 md:gap-4 lg:grid-cols-4">
      <StatTile
        label="Current"
        value={`${formatNumber(latest.weight)} kg`}
        detail={formatDay(latest.date)}
      />
      <StatTile
        label="Since previous entry"
        value={sincePrevious === null ? "–" : formatWeightChange(sincePrevious)}
      />
      <StatTile
        label={`Last ${TREND_DAYS} days`}
        value={overTrend === null ? "–" : formatWeightChange(overTrend)}
      />
      <StatTile label="Range" value={`${formatNumber(lowest)}–${formatNumber(highest)} kg`} />
    </div>
  );
}

export function BodyWeightPage() {
  const { data: entries, isPending, isError, refetch } = useBodyWeight();
  const remove = useDeleteBodyWeight();
  const [deleting, setDeleting] = useState<BodyWeightRow | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function confirmDelete() {
    if (!deleting) return;
    try {
      setDeleteError("");
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      setDeleteError("Could not delete the entry. Try again.");
    }
  }

  if (isPending) {
    return (
      <>
        {HEADER}
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">
          Loading body weight…
        </p>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {HEADER}
        <div role="alert" className="py-12 text-center text-sm text-muted-foreground">
          Could not load body weight.{" "}
          <Button variant="link" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      </>
    );
  }

  const summary = bodyWeightSummary(entries);

  return (
    <>
      {HEADER}
      <BodyWeightForm entries={entries} />

      {summary ? (
        <>
          <Summary summary={summary} />
          <section className="mb-6 rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
            <h2 className="mb-4 font-semibold">Trend</h2>
            <ClientOnly fallback={chartPlaceholder}>
              <Suspense fallback={chartPlaceholder}>
                <BodyWeightChart entries={chronological(entries)} />
              </Suspense>
            </ClientOnly>
            {entries.length === 1 && (
              <p className="mt-2 text-sm text-muted-foreground">Add more entries to see a trend.</p>
            )}
          </section>
          <BodyWeightLog
            rows={bodyWeightRows(entries)}
            onDelete={(row) => {
              setDeleteError("");
              setDeleting(row);
            }}
          />
        </>
      ) : (
        <EmptyState
          icon={Weight}
          title="No entries yet"
          description="Add your weight above to start tracking it."
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete entry?"
        description={`Remove the entry for ${deleting ? formatDay(deleting.date) : ""}? This cannot be undone.`}
        confirmLabel="Delete"
        keepOpenOnConfirm
        pending={remove.isPending}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
