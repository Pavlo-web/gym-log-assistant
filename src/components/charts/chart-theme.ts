/** Styling shared by every chart so they read as one family. */
export const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };
export const AXIS_STROKE = "var(--border)";
export const SERIES_COLOR = "var(--chart-1)";
export const CHART_MARGIN = { top: 10, right: 16, left: 0, bottom: 0 };

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
