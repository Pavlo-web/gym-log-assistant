import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  activeRow,
  AXIS_STROKE,
  AXIS_TICK,
  CHART_MARGIN,
  GRID_PROPS,
  paddedDomain,
  SERIES_ANIMATION,
  SERIES_COLOR,
  yTickCount,
  type TooltipProps,
} from "@/components/charts/chart-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatDay, formatDayMonth } from "@/lib/date";
import { formatNumber } from "@/lib/number";
import type { ExercisePoint } from "@/lib/progress";

export type Metric = "topWeight" | "bestE1RM" | "volume";

/** Minimum pixel gap between x-axis labels. */
const TICK_GAP = { mobile: 50, desktop: 5 };

function PointTooltip(props: TooltipProps<ExercisePoint>) {
  const point = activeRow(props);
  if (!point) return null;
  return (
    <ChartTooltip title={formatDay(point.date)}>
      <p>
        Top: {formatNumber(point.topWeight)} kg × {point.topReps}
      </p>
      <p>Est. 1RM: {formatNumber(point.bestE1RM)} kg</p>
      <p>Volume: {formatNumber(point.volume)} kg</p>
    </ChartTooltip>
  );
}

interface ProgressChartProps {
  points: ExercisePoint[];
  metric: Metric;
}

/** Line chart of one metric over time. Default export so the page can lazy-load Recharts. */
export default function ProgressChart({ points, metric }: ProgressChartProps) {
  const mobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const domain = paddedDomain(points.map((point) => point[metric]));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={CHART_MARGIN}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            minTickGap={mobile ? TICK_GAP.mobile : TICK_GAP.desktop}
            dataKey="date"
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            tickFormatter={formatDayMonth}
          />
          <YAxis
            tickCount={yTickCount(mobile)}
            domain={domain}
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            width={56}
            tickFormatter={formatNumber}
            unit=" kg"
          />
          <Tooltip content={<PointTooltip />} cursor={{ stroke: AXIS_STROKE }} />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={SERIES_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: SERIES_COLOR, stroke: SERIES_COLOR }}
            activeDot={{ r: 6 }}
            isAnimationActive={!reducedMotion}
            {...SERIES_ANIMATION}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
