import type { RecentPR } from "@/lib/dashboard";
import { formatDay } from "@/lib/date";
import { formatNumber } from "@/lib/number";

export function RecentRecords({ records }: { records: RecentPR[] }) {
  if (records.length === 0) {
    return <p className="text-sm text-muted-foreground">No records yet.</p>;
  }
  return (
    <ul className="divide-y divide-border text-sm">
      {records.map((record) => (
        <li
          key={`${record.exerciseId}-${record.date}`}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2.5 md:flex md:justify-between md:gap-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{record.name}</p>
            <p className="text-xs text-muted-foreground">{formatDay(record.date)}</p>
          </div>
          <div className="shrink-0 text-right tabular">
            <p>
              {formatNumber(record.weight)} kg × {record.reps}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatNumber(record.value)} kg est. 1RM
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
