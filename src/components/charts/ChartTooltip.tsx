import type { ReactNode } from "react";

/** Tooltip box used by every chart: a bold title line followed by the values. */
export function ChartTooltip({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md tabular">
      <p className="mb-1 font-medium">{title}</p>
      {children}
    </div>
  );
}
