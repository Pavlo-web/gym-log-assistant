/** Styling shared by every chart so they read as one family. */
export const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };
export const AXIS_STROKE = "var(--border)";
export const SERIES_COLOR = "var(--chart-1)";
export const CHART_MARGIN = { top: 10, right: 16, left: 0, bottom: 0 };

/** How a series draws itself in: spread onto `<Bar />` or `<Line />`. */
export const SERIES_ANIMATION = { animationDuration: 700, animationEasing: "ease-out" } as const;

/** Horizontal dashed grid lines: spread onto `<CartesianGrid />`. */
export const GRID_PROPS = { stroke: AXIS_STROKE, strokeDasharray: "3 3", vertical: false };

/** Fewer y-axis ticks on phones, where the plot is short on width. */
export function yTickCount(mobile: boolean): number {
  return mobile ? 4 : 5;
}

/** Recharts passes the hovered data row to a custom tooltip in this shape. */
export interface TooltipProps<Row> {
  active?: boolean;
  payload?: { payload: Row }[];
}

/** The hovered data row, or undefined while the tooltip is hidden. */
export function activeRow<Row>({ active, payload }: TooltipProps<Row>): Row | undefined {
  return active ? payload?.[0]?.payload : undefined;
}

/**
 * Y-axis range with headroom around the data so the line does not hug the edges.
 * `minShare` is the least headroom as a share of the largest value: lower it for
 * data that moves little, such as body weight, or the trend flattens out.
 */
export function paddedDomain(values: readonly number[], minShare = 0.05): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.15, max * minShare, 1);
  return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
}
