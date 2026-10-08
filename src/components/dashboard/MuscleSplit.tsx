import type { MuscleGroupSets } from "@/lib/dashboard";

/** Horizontal bars comparing sets per muscle group; the busiest group fills the row. */
export function MuscleSplit({ split }: { split: MuscleGroupSets[] }) {
  const maxSets = Math.max(1, ...split.map((item) => item.sets));
  return (
    <ul className="space-y-3" aria-label="Sets per muscle group">
      {split.map(({ group, sets }) => (
        <li key={group} className="grid grid-cols-[88px_1fr_40px] items-center gap-3 text-sm">
          <span className="text-muted-foreground">{group}</span>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${(sets / maxSets) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-right tabular">{sets}</span>
        </li>
      ))}
    </ul>
  );
}
