import { StatTile } from "@/components/StatTile";
import { formatDay } from "@/lib/date";
import { formatNumber } from "@/lib/number";
import type { PersonalRecords } from "@/lib/progress";

export function RecordStats({ records }: { records: PersonalRecords }) {
  const { maxWeight, bestE1RM, maxVolume } = records;
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <StatTile
        label="Heaviest weight"
        value={`${formatNumber(maxWeight.value)} kg × ${maxWeight.reps}`}
        footnote={formatDay(maxWeight.date)}
      />
      <StatTile
        label="Best estimated 1RM"
        value={`${formatNumber(bestE1RM.value)} kg`}
        detail={`from ${formatNumber(bestE1RM.weight)} kg × ${bestE1RM.reps}`}
        footnote={formatDay(bestE1RM.date)}
      />
      <StatTile
        label="Most volume in a session"
        value={`${formatNumber(maxVolume.value)} kg`}
        footnote={formatDay(maxVolume.date)}
      />
    </div>
  );
}
