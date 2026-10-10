import { SectionTitle } from "@/components/SectionTitle";
import { Surface } from "@/components/Surface";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { formatDay } from "@/lib/date";
import { formatNumber } from "@/lib/number";
import type { ExercisePoint, PersonalRecords } from "@/lib/progress";

const isRecordDate = (records: PersonalRecords | null, date: string): boolean => {
  if (!records) return false;
  return [records.maxWeight, records.bestE1RM, records.maxVolume].some(
    (record) => record.date === date,
  );
};

function SessionDate({ point }: { point: ExercisePoint }) {
  const [workoutId] = point.workoutIds;
  const label = formatDay(point.date);
  if (!workoutId) return <>{label}</>;
  return (
    <Link
      to="/history/$workoutId"
      params={{ workoutId }}
      className="hover:text-primary hover:underline"
    >
      {label}
    </Link>
  );
}

interface SessionsTableProps {
  /** Ascending by date; the table lists them newest first. */
  points: ExercisePoint[];
  records: PersonalRecords | null;
}

// On phones `mobile-sessions` turns each row into a grid captioned by `data-label`.
export function SessionsTable({ points, records }: SessionsTableProps) {
  return (
    <Surface as="section">
      <SectionTitle title="Sessions" className="mb-3" />
      <div className="overflow-x-auto">
        <table className="mobile-sessions w-full text-sm tabular" aria-label="Sessions">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 font-normal">Date</th>
              <th className="pb-2 font-normal">Sets</th>
              <th className="pb-2 font-normal">Top weight</th>
              <th className="pb-2 font-normal">Est. 1RM</th>
              <th className="pb-2 text-right font-normal">Volume</th>
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map((point) => (
              <tr key={point.date} className="border-t border-border">
                <td className="py-2">
                  <SessionDate point={point} />
                  {isRecordDate(records, point.date) && (
                    <Badge variant="outline" className="ml-2 border-primary/50 text-primary">
                      PR
                    </Badge>
                  )}
                </td>
                <td data-label="Sets">{point.sets}</td>
                <td data-label="Top weight">
                  {formatNumber(point.topWeight)} kg × {point.topReps}
                </td>
                <td data-label="Est. 1RM">{formatNumber(point.bestE1RM)} kg</td>
                <td data-label="Volume" className="text-right">
                  {formatNumber(point.volume)} kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Surface>
  );
}
