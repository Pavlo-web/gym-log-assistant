export const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };
export const AXIS_STROKE = "var(--border)";
export const SERIES_COLOR = "var(--chart-1)";
export const CHART_MARGIN = { top: 10, right: 16, left: 0, bottom: 0 };

export const SERIES_ANIMATION = { animationDuration: 700, animationEasing: "ease-out" } as const;

export const GRID_PROPS = { stroke: AXIS_STROKE, strokeDasharray: "3 3", vertical: false };

export const yTickCount = (mobile: boolean): number => (mobile ? 4 : 5);

export interface TooltipProps<Row> {
  active?: boolean;
  payload?: { payload: Row }[];
}

export const activeRow = <Row>({ active, payload }: TooltipProps<Row>): Row | undefined =>
  active ? payload?.[0]?.payload : undefined;

// `minShare` is the least headroom as a share of the largest value. Lower it for data that
// moves little, such as body weight, or the trend flattens out.
export const paddedDomain = (values: readonly number[], minShare = 0.05): [number, number] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.15, max * minShare, 1);
  return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
};
