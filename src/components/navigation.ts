import {
  Calculator,
  Dumbbell,
  History,
  LayoutDashboard,
  Plus,
  TrendingUp,
  Weight,
  type LucideIcon,
} from "lucide-react";

// Slot in the phone bottom bar: a regular tab, the raised centre button, or the "More" sheet.
type MobilePlacement = "tab" | "action" | "more";

export interface NavItem {
  to: "/dashboard" | "/" | "/history" | "/exercises" | "/progress" | "/body-weight" | "/calculator";
  label: string;
  mobileLabel?: string;
  icon: LucideIcon;
  mobile: MobilePlacement;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, mobile: "tab" },
  { to: "/", label: "Workout", mobileLabel: "Log workout", icon: Plus, mobile: "action" },
  { to: "/history", label: "History", icon: History, mobile: "tab" },
  { to: "/exercises", label: "Exercises", icon: Dumbbell, mobile: "more" },
  { to: "/progress", label: "Progress", icon: TrendingUp, mobile: "tab" },
  { to: "/body-weight", label: "Body weight", icon: Weight, mobile: "more" },
  { to: "/calculator", label: "1RM Calculator", icon: Calculator, mobile: "more" },
];

const byPlacement = (placement: MobilePlacement): NavItem[] =>
  NAV_ITEMS.filter((item) => item.mobile === placement);

export const MOBILE_TABS = byPlacement("tab");
export const MOBILE_MORE_ITEMS = byPlacement("more");
export const PRIMARY_ACTION = byPlacement("action")[0];
export const MOBILE_ACTION = PRIMARY_ACTION;
export const SIDEBAR_ITEMS = NAV_ITEMS.filter((item) => item.mobile !== "action");
