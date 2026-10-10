import { repsAtPercent, roundToHalf } from "@/lib/calc";
import { formatFixed } from "@/lib/number";

/** Rows of the table: 100% down to 50% in 5% steps. */
const PERCENTS = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

/** Loads at each percentage of a 1RM, with the reps roughly possible at that load. */
export function PercentageTable({ oneRepMax }: { oneRepMax: number }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-muted-foreground">
          <th className="px-3 py-3 md:px-5 font-normal">Percent</th>
          <th className="px-3 py-3 md:px-5 text-right font-normal">Weight (kg)</th>
          <th className="px-3 py-3 md:px-5 text-right font-normal">Approx. reps</th>
        </tr>
      </thead>
      <tbody>
        {PERCENTS.map((percent) => (
          <tr key={percent} className="border-t border-border">
            <td className="tabular px-3 py-2.5 md:px-5">{percent}%</td>
            <td className="tabular px-3 py-2.5 md:px-5 text-right">
              {formatFixed(roundToHalf((oneRepMax * percent) / 100))}
            </td>
            <td className="tabular px-3 py-2.5 md:px-5 text-right text-muted-foreground">
              {repsAtPercent(percent / 100)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
