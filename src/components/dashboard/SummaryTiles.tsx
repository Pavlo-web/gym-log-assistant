import type { WeekBucket } from "@/lib/dashboard";
import { formatNumber } from "@/lib/number";

interface TileProps {
  label: string;
  value: string;
  /** Change versus the previous period, already formatted. */
  delta?: string;
}

function Tile({ label, value, delta }: TileProps) {
  return (
    <div className="rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tabular md:text-2xl">{value}</p>
      {delta && <p className="mt-1 text-xs text-muted-foreground tabular">{delta}</p>}
    </div>
  );
}

/** "+2 vs last week", "−150 kg vs last week" or "±0 vs last week". */
function weekDelta(difference: number, unit = ""): string {
  const sign = difference > 0 ? "+" : difference < 0 ? "−" : "±";
  return `${sign}${formatNumber(Math.abs(difference))}${unit} vs last week`;
}

interface SummaryTilesProps {
  thisWeek: WeekBucket;
  lastWeek: WeekBucket;
  workoutsThisMonth: number;
  /** Consecutive weeks with at least one workout. */
  streak: number;
}

export function SummaryTiles({ thisWeek, lastWeek, workoutsThisMonth, streak }: SummaryTilesProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 min-[350px]:grid-cols-2 md:gap-4 lg:grid-cols-4">
      <Tile
        label="Workouts this week"
        value={String(thisWeek.workouts)}
        delta={weekDelta(thisWeek.workouts - lastWeek.workouts)}
      />
      <Tile label="Workouts this month" value={String(workoutsThisMonth)} />
      <Tile
        label="Volume this week"
        value={`${formatNumber(thisWeek.volume)} kg`}
        delta={weekDelta(thisWeek.volume - lastWeek.volume, " kg")}
      />
      <Tile label="Weekly streak" value={`${streak} ${streak === 1 ? "week" : "weeks"}`} />
    </div>
  );
}
