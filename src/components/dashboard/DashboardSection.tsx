import { SectionTitle } from "@/components/SectionTitle";
import { Surface } from "@/components/Surface";
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
    <Surface as="section" className="mb-6">
      <SectionTitle title={title} subtitle={subtitle} action={action} className="mb-4" />
      {children}
    </Surface>
  );
}
