import { formatDay } from "@/lib/date";
import { formatNumber } from "@/lib/number";
import type { PersonalRecords } from "@/lib/progress";

interface StatProps {
  label: string;
  value: string;
  /** Extra detail under the value, e.g. the set a 1RM estimate comes from. */
  detail?: string;
  date: string;
}

function Stat({ label, value, detail, date }: StatProps) {
  return (
    <div className="rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular">{value}</p>
      {detail && <p className="text-xs text-muted-foreground tabular">{detail}</p>}
      <p className="mt-2 text-xs text-muted-foreground">{formatDay(date)}</p>
    </div>
  );
}

/** The three personal records of one exercise, each with the date it was set. */
export function RecordStats({ records }: { records: PersonalRecords }) {
  const { maxWeight, bestE1RM, maxVolume } = records;
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <Stat
        label="Heaviest weight"
        value={`${formatNumber(maxWeight.value)} kg × ${maxWeight.reps}`}
        date={maxWeight.date}
      />
      <Stat
        label="Best estimated 1RM"
        value={`${formatNumber(bestE1RM.value)} kg`}
        detail={`from ${formatNumber(bestE1RM.weight)} kg × ${bestE1RM.reps}`}
        date={bestE1RM.date}
      />
      <Stat
        label="Most volume in a session"
        value={`${formatNumber(maxVolume.value)} kg`}
        date={maxVolume.date}
      />
    </div>
  );
}
