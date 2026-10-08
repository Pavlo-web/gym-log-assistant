import { bestEpley1RM, epley1RM } from "@/lib/calc";
import { cn } from "@/lib/utils";
import type { WorkoutSet } from "@/types/domain";

/**
 * Sets of one exercise with the estimated 1RM of each; the best set is
 * highlighted. On phones the `mobile-detail-table` styles turn each row into a
 * small grid and use `data-label` as the cell caption.
 */
export function ExerciseSetsTable({ sets }: { sets: WorkoutSet[] }) {
  const best = bestEpley1RM(sets);
  return (
    <div className="overflow-x-auto">
      <table className="mobile-detail-table w-full text-sm tabular">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-2 font-normal">#</th>
            <th className="pb-2 font-normal">Weight (kg)</th>
            <th className="pb-2 font-normal">Reps</th>
            <th className="pb-2 text-right font-normal">Est. 1RM</th>
          </tr>
        </thead>
        <tbody>
          {sets.map((set, index) => {
            const estimate = epley1RM(set.weight, set.reps);
            const isBest = best > 0 && estimate === best;
            return (
              <tr key={set.id} className={cn("border-t border-border", isBest && "bg-accent/40")}>
                <td className="py-2">{index + 1}</td>
                <td data-label="Weight (kg)">{set.weight}</td>
                <td data-label="Reps">{set.reps}</td>
                <td
                  data-label="Est. 1RM"
                  className={cn("text-right", isBest && "font-semibold text-primary")}
                >
                  {estimate.toFixed(1)} kg
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
