import type { ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HintProps {
  /** Short text shown on hover and keyboard focus. */
  label: string;
  /** The control being explained, usually an icon-only button. */
  children: ReactElement;
}

/** Tooltip for icon-only controls; replaces the native `title` attribute. */
export function Hint({ label, children }: HintProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
