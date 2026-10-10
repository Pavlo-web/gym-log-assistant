import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Sidebar } from "@/components/Sidebar";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/utils";

/** Pages whose content is a grid of cards and can use a wide screen; the rest stay readable-width. */
const WIDE_PAGES: readonly string[] = ["/dashboard"];

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
            wide ? "max-w-6xl" : "max-w-4xl",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
