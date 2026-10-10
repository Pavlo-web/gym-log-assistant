import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldErrorProps {
  children: ReactNode;
  className?: string;
}

export function FieldError({ children, className }: FieldErrorProps) {
  return (
    <p role="alert" className={cn("text-xs text-danger", className)}>
      {children}
    </p>
  );
}

export function FormAlert({ children, className }: FieldErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm",
        className,
      )}
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
