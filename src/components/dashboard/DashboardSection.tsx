import type { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  /** Shown at the right of the heading, e.g. a "View all" link. */
  action?: ReactNode;
  children: ReactNode;
}

/** Bordered card with a heading that wraps each block of the dashboard. */
export function DashboardSection({ title, subtitle, action, children }: DashboardSectionProps) {
  return (
    <section className="mb-6 rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2 md:flex md:justify-between md:gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
