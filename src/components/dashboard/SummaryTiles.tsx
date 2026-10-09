import { StatTile } from "@/components/StatTile";
import type { WeekBucket } from "@/lib/dashboard";
import { formatNumber } from "@/lib/number";

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
      <StatTile
        label="Workouts this week"
        value={{ amount: thisWeek.workouts, format: String }}
        detail={weekDelta(thisWeek.workouts - lastWeek.workouts)}
      />
      <StatTile label="Workouts this month" value={{ amount: workoutsThisMonth, format: String }} />
      <StatTile
        label="Volume this week"
        value={{ amount: thisWeek.volume, format: (kg) => `${formatNumber(kg)} kg` }}
        detail={weekDelta(thisWeek.volume - lastWeek.volume, " kg")}
      />
      <StatTile
        label="Weekly streak"
        value={{
          amount: streak,
          format: (weeks) => `${weeks} ${weeks === 1 ? "week" : "weeks"}`,
        }}
      />
    </div>
  );
}
