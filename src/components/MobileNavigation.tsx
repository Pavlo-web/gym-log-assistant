import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  MOBILE_ACTION,
  MOBILE_MORE_ITEMS,
  MOBILE_TABS,
  type NavItem,
} from "@/components/navigation";
import { cn } from "@/lib/utils";

/** Tabs shown to the left of the centre button; the rest go to its right. */
const TABS_BEFORE_ACTION = 2;

const TAB_BUTTON =
  "h-16 min-w-0 flex-col gap-1 rounded-none px-0 text-[10px] font-normal hover:bg-transparent [&_svg]:size-5";

const tabColor = (active: boolean): string => (active ? "text-primary" : "text-muted-foreground");

function NavTab({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active = pathname.startsWith(item.to);
  return (
    <Button asChild variant="ghost" className={cn(TAB_BUTTON, tabColor(active))}>
      <Link to={item.to} aria-current={active ? "page" : undefined}>
        <Icon aria-hidden="true" />
        {item.mobileLabel ?? item.label}
      </Link>
    </Button>
  );
}

/** Raised round button in the middle of the bar for the primary action. */
function ActionButton({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active = pathname === item.to;
  const label = item.mobileLabel ?? item.label;
  return (
    <div className="flex min-w-0 flex-col items-center">
      <Button
        asChild
        className={cn(
          "-mt-5 size-14 shrink-0 rounded-full border-4 border-sidebar p-0 [&_svg]:size-7",
          active && "ring-2 ring-ring ring-offset-2 ring-offset-sidebar",
        )}
      >
        <Link to={item.to} aria-label={label} aria-current={active ? "page" : undefined}>
          <Icon aria-hidden="true" />
        </Link>
      </Button>
      <span className={cn("mt-1 text-[10px]", tabColor(active))}>{label}</span>
    </div>
  );
}

/** "More" tab: opens a bottom sheet with the sections that do not fit in the bar. */
function MoreMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const active = MOBILE_MORE_ITEMS.some((item) => item.to === pathname);
  return (
    <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          aria-current={active ? "page" : undefined}
          className={cn(TAB_BUTTON, tabColor(active))}
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
          {MOBILE_MORE_ITEMS.map((item) => (
            <DrawerClose key={item.to} asChild>
              <Button asChild variant="ghost" className="justify-start">
                <Link to={item.to}>
                  <item.icon />
                  {item.label}
                </Link>
              </Button>
            </DrawerClose>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** Fixed bottom bar shown on phones instead of the sidebar. */
export function MobileNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav
      aria-label="Mobile navigation"
      className="mobile-navigation fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-start border-t border-sidebar-border bg-sidebar md:hidden"
    >
      {MOBILE_TABS.slice(0, TABS_BEFORE_ACTION).map((item) => (
        <NavTab key={item.to} item={item} pathname={pathname} />
      ))}
      {MOBILE_ACTION && <ActionButton item={MOBILE_ACTION} pathname={pathname} />}
      {MOBILE_TABS.slice(TABS_BEFORE_ACTION).map((item) => (
        <NavTab key={item.to} item={item} pathname={pathname} />
      ))}
      <MoreMenu pathname={pathname} />
    </nav>
  );
}
