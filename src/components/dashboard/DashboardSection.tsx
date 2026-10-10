import { SectionTitle } from "@/components/SectionTitle";
import { Surface } from "@/components/Surface";
import type { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function DashboardSection({ title, subtitle, action, children }: DashboardSectionProps) {
  return (
    <Surface as="section" className="mb-6">
      <SectionTitle title={title} subtitle={subtitle} action={action} className="mb-4" />
      {children}
    </Surface>
  );
}
