import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import type { ExercisePoint } from "@/lib/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { localWorkoutDate } from "@/components/history/history-utils";

export type Metric = "topWeight" | "bestE1RM" | "volume";
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });

function TooltipBox({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ExercisePoint }[];
}) {
  const p = active ? payload?.[0]?.payload : undefined;
  if (!p) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md tabular">
      <p className="mb-1 font-medium">{format(localWorkoutDate(p.date), "d MMM yyyy")}</p>
      <p>
        Top: {fmt(p.topWeight)} kg × {p.topReps}
      </p>
      <p>Est. 1RM: {fmt(p.bestE1RM)} kg</p>
      <p>Volume: {fmt(p.volume)} kg</p>
    </div>
  );
}

export default function ProgressChart({
  points,
  metric,
}: {
  points: ExercisePoint[];
  metric: Metric;
}) {
  const values = points.map((p) => p[metric]);
  const min = Math.min(...values),
    max = Math.max(...values);
  const pad = Math.max((max - min) * 0.15, max * 0.05, 1);
  const domain: [number, number] = [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
  const mobile = useIsMobile();
  const tick = { fill: "var(--muted-foreground)", fontSize: 12 };
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            minTickGap={mobile ? 50 : 5}
            dataKey="date"
            tick={tick}
            stroke="var(--border)"
            tickFormatter={(d: string) => format(localWorkoutDate(d), "d MMM")}
          />
          <YAxis
            tickCount={mobile ? 4 : 5}
            domain={domain}
            tick={tick}
            stroke="var(--border)"
            width={56}
            tickFormatter={(v: number) => `${fmt(v)}`}
            unit=" kg"
          />
          <Tooltip content={<TooltipBox />} cursor={{ stroke: "var(--border)" }} />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--chart-1)" }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
