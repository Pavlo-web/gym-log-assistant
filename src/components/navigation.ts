import {
  Calculator,
  Dumbbell,
  History,
  LayoutDashboard,
  Plus,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Where an item sits in the phone bottom bar:
 * - "tab": one of the regular tabs
 * - "action": the raised centre button
 * - "more": inside the "More" sheet
 */
type MobilePlacement = "tab" | "action" | "more";

export interface NavItem {
  to: "/dashboard" | "/" | "/history" | "/exercises" | "/progress" | "/calculator";
  label: string;
  /** Label used in the phone bottom bar when it differs from the sidebar. */
  mobileLabel?: string;
  icon: LucideIcon;
  mobile: MobilePlacement;
}

/** Every section of the app, in sidebar order. The single source for both navigations. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, mobile: "tab" },
  { to: "/", label: "Workout", mobileLabel: "Log workout", icon: Plus, mobile: "action" },
  { to: "/history", label: "History", icon: History, mobile: "tab" },
  { to: "/exercises", label: "Exercises", icon: Dumbbell, mobile: "more" },
  { to: "/progress", label: "Progress", icon: TrendingUp, mobile: "tab" },
  { to: "/calculator", label: "1RM Calculator", icon: Calculator, mobile: "more" },
];

function byPlacement(placement: MobilePlacement): NavItem[] {
  return NAV_ITEMS.filter((item) => item.mobile === placement);
}

export const MOBILE_TABS = byPlacement("tab");
export const MOBILE_MORE_ITEMS = byPlacement("more");
export const MOBILE_ACTION = byPlacement("action")[0];
