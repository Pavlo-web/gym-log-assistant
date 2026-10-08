import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { NAV_ITEMS } from "@/components/navigation";
import { cn } from "@/lib/utils";

const SIDEBAR_LINK = "flex items-center gap-3 rounded-md px-3 py-2 text-sm [&_svg]:size-4";

/** Pages whose content is a grid of cards and can use a wide screen; the rest stay readable-width. */
const WIDE_PAGES: readonly string[] = ["/dashboard"];

function Wordmark() {
  return (
    <>
      Gym<span className="text-primary"> Log</span>
    </>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar px-5 py-7 md:flex">
      <Link to="/" className="mb-10 block">
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          <Wordmark />
        </span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className={`${SIDEBAR_LINK} text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
            activeProps={{
              className: `${SIDEBAR_LINK} bg-sidebar-accent text-primary font-medium`,
            }}
          >
            <item.icon aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

/** Top bar shown on phones, where the sidebar is hidden. */
function MobileTopBar() {
  return (
    <div className="border-b border-border bg-sidebar px-3 py-3 md:hidden">
      <span className="text-lg font-semibold text-sidebar-foreground">
        <Wordmark />
      </span>
    </div>
  );
}

/** Page frame: sidebar on desktop, top bar and bottom navigation on phones. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const wide = WIDE_PAGES.includes(pathname);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileTopBar />
      <MobileNavigation />
      <main className="md:pl-60">
        <div
          className={cn(
            "mobile-page mx-auto w-full min-w-0 px-3 pt-6 md:px-6 md:py-12",
            wide ? "max-w-6xl" : "max-w-3xl",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
