import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { NAV_ITEMS } from "@/components/navigation";

const SIDEBAR_LINK = "rounded-md px-3 py-2 text-sm";

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
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mt-auto text-xs text-muted-foreground">Local data · kg</p>
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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileTopBar />
      <MobileNavigation />
      <main className="md:pl-60">
        <div className="mobile-page mx-auto w-full min-w-0 max-w-3xl px-3 pt-6 md:px-6 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
