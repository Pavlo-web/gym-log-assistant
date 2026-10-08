import {
  CartesianGrid,
  Line,
  LineChart,
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
  SERIES_COLOR,
  yTickCount,
  type TooltipProps,
} from "@/components/charts/chart-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDay, formatDayMonth } from "@/lib/date";
import { formatNumber } from "@/lib/number";
import type { BodyWeightEntry } from "@/types/domain";

/** Minimum pixel gap between x-axis labels. */
const TICK_GAP = { mobile: 50, desktop: 20 };

/** Body weight moves by a kilo or two, so the axis stays tight around the data. */
const AXIS_HEADROOM_SHARE = 0.01;

function EntryTooltip(props: TooltipProps<BodyWeightEntry>) {
  const entry = activeRow(props);
  if (!entry) return null;
  return (
    <ChartTooltip title={formatDay(entry.date)}>
      <p>{formatNumber(entry.weight)} kg</p>
    </ChartTooltip>
  );
}

interface BodyWeightChartProps {
  /** Oldest first. */
  entries: BodyWeightEntry[];
}

/** Line chart of body weight over time. Default export so the page can lazy-load Recharts. */
export default function BodyWeightChart({ entries }: BodyWeightChartProps) {
  const mobile = useIsMobile();
  const domain = paddedDomain(
    entries.map((entry) => entry.weight),
    AXIS_HEADROOM_SHARE,
  );
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={entries} margin={CHART_MARGIN}>
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
          <Tooltip content={<EntryTooltip />} cursor={{ stroke: AXIS_STROKE }} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={SERIES_COLOR}
            strokeWidth={2}
            dot={{ r: 3, fill: SERIES_COLOR, stroke: SERIES_COLOR }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
