import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  activeRow,
  AXIS_STROKE,
  AXIS_TICK,
  CHART_MARGIN,
  GRID_PROPS,
  SERIES_ANIMATION,
  SERIES_COLOR,
  yTickCount,
  type TooltipProps,
} from "@/components/charts/chart-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { WeekBucket } from "@/lib/dashboard";
import { formatDay, formatDayMonth } from "@/lib/date";
import { formatNumber } from "@/lib/number";

function WeekTooltip(props: TooltipProps<WeekBucket>) {
  const week = activeRow(props);
  if (!week) return null;
  return (
    <ChartTooltip title={`Week of ${formatDay(week.week)}`}>
      <p>Volume: {formatNumber(week.volume)} kg</p>
      <p>Workouts: {week.workouts}</p>
    </ChartTooltip>
  );
}

/** Bar chart of total volume per week. Default export so the page can lazy-load Recharts. */
export default function WeeklyVolumeChart({ data }: { data: WeekBucket[] }) {
  const mobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            // Label every second week on phones so the dates do not collide.
            {...(mobile ? { interval: 1 } : {})}
            dataKey="week"
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            tickFormatter={formatDayMonth}
          />
          <YAxis
            tickCount={yTickCount(mobile)}
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            width={mobile ? 56 : 64}
            tickFormatter={formatNumber}
            unit=" kg"
            allowDecimals={false}
          />
          <Tooltip content={<WeekTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
          <Bar
            dataKey="volume"
            fill={SERIES_COLOR}
            radius={[3, 3, 0, 0]}
            isAnimationActive={!reducedMotion}
            {...SERIES_ANIMATION}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
