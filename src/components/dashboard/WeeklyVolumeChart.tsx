import { useIsMobile } from "@/hooks/use-mobile";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import type { WeekBucket } from "@/lib/dashboard";
import { localWorkoutDate } from "@/components/history/history-utils";

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });

function TooltipBox({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: WeekBucket }[];
}) {
  const p = active ? payload?.[0]?.payload : undefined;
  if (!p) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md tabular">
      <p className="mb-1 font-medium">Week of {format(localWorkoutDate(p.week), "d MMM yyyy")}</p>
      <p>Volume: {fmt(p.volume)} kg</p>
      <p>Workouts: {p.workouts}</p>
    </div>
  );
}

export default function WeeklyVolumeChart({ data }: { data: WeekBucket[] }) {
  const mobile = useIsMobile();
  const tick = { fill: "var(--muted-foreground)", fontSize: 12 };
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            {...(mobile ? { interval: 1 } : {})}
            dataKey="week"
            tick={tick}
            stroke="var(--border)"
            tickFormatter={(d: string) => format(localWorkoutDate(d), "d MMM")}
          />
          <YAxis
            tickCount={mobile ? 4 : 5}
            tick={tick}
            stroke="var(--border)"
            width={mobile ? 56 : 64}
            tickFormatter={(v: number) => fmt(v)}
            unit=" kg"
            allowDecimals={false}
          />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
          <Bar
            dataKey="volume"
            fill="var(--chart-1)"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
