import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWeightChange, type BodyWeightRow } from "@/lib/body-weight";
import { formatWeekdayDay } from "@/lib/date";
import { formatNumber } from "@/lib/number";

interface BodyWeightLogProps {
  /** Newest first. */
  rows: BodyWeightRow[];
  onDelete: (row: BodyWeightRow) => void;
}

/** Every entry of the log with its change from the previous one. */
export function BodyWeightLog({ rows, onDelete }: BodyWeightLogProps) {
  return (
    <section className="rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
      <h2 className="mb-3 font-semibold">Entries</h2>
      <ul className="divide-y divide-border text-sm">
        {rows.map((row) => {
          const date = formatWeekdayDay(row.date);
          return (
            <li key={row.id} className="flex min-h-12 items-center justify-between gap-3 py-1.5">
              <span className="min-w-0">{date}</span>
              <span className="flex shrink-0 items-center gap-3 tabular">
                {row.change !== null && (
                  <span className="text-xs text-muted-foreground">
                    {formatWeightChange(row.change)}
                  </span>
                )}
                <span className="font-medium">{formatNumber(row.weight)} kg</span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete entry for ${date}`}
                  title={`Delete entry for ${date}`}
                  onClick={() => onDelete(row)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
