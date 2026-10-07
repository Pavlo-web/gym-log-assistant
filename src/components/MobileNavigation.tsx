import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calculator,
  Dumbbell,
  History,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/progress", label: "Progress", icon: TrendingUp },
] as const;

export function MobileNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const moreActive = pathname === "/exercises" || pathname === "/calculator";
  function tab(item: (typeof tabs)[number]) {
    const Icon = item.icon;
    const active = pathname.startsWith(item.to);
    return (
      <Button
        key={item.to}
        asChild
        variant="ghost"
        className={cn(
          "h-16 min-w-0 flex-col gap-1 rounded-none px-0 text-[10px] font-normal hover:bg-transparent [&_svg]:size-5",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Link to={item.to} aria-current={active ? "page" : undefined}>
          <Icon aria-hidden="true" />
          {item.label}
        </Link>
      </Button>
    );
  }
  return (
    <nav
      aria-label="Mobile navigation"
      className="mobile-navigation fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-start border-t border-sidebar-border bg-sidebar md:hidden"
    >
      {tab(tabs[0])}
      {tab(tabs[1])}
      <div className="flex min-w-0 flex-col items-center">
        <Button
          asChild
          className={cn(
            "-mt-5 size-14 shrink-0 rounded-full border-4 border-sidebar p-0 [&_svg]:size-7",
            pathname === "/" && "ring-2 ring-ring ring-offset-2 ring-offset-sidebar",
          )}
        >
          <Link
            to="/"
            aria-label="Log workout"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <Plus aria-hidden="true" />
          </Link>
        </Button>
        <span
          className={cn(
            "mt-1 text-[10px]",
            pathname === "/" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Log workout
        </span>
      </div>
      {tab(tabs[2])}
      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-current={moreActive ? "page" : undefined}
            className={cn(
              "h-16 min-w-0 flex-col gap-1 rounded-none px-0 text-[10px] font-normal hover:bg-transparent [&_svg]:size-5",
              moreActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <MoreHorizontal aria-hidden="true" />
            More
          </Button>
        </DrawerTrigger>
        <DrawerContent className="mobile-sheet" aria-describedby={undefined}>
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-2 px-4 pb-4">
            <DrawerClose asChild>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/exercises">
                  <Dumbbell />
                  Exercises
                </Link>
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/calculator">
                  <Calculator />
                  1RM Calculator
                </Link>
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
