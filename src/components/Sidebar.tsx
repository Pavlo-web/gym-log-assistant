import { Link } from "@tanstack/react-router";
import { PRIMARY_ACTION, SIDEBAR_ITEMS } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";

const ITEM =
  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors [&_svg]:size-4";
/** The current page: a lighter row with a coral bar at its left edge. */
const ACTIVE_ITEM = `${ITEM} bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary [&_svg]:text-primary`;

/** Desktop navigation: the main action as a button, then the sections of the app. */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar px-3 py-7 md:flex">
      <Link to="/" className="mb-6 block px-3">
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          <Wordmark />
        </span>
      </Link>
      {PRIMARY_ACTION && (
        <Button asChild className="mb-4 justify-start px-3">
          <Link to={PRIMARY_ACTION.to}>
            <PRIMARY_ACTION.icon aria-hidden="true" />
            {PRIMARY_ACTION.mobileLabel ?? PRIMARY_ACTION.label}
          </Link>
        </Button>
      )}
      <nav aria-label="Sections" className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`${ITEM} text-muted-foreground hover:bg-hover hover:text-foreground`}
            activeProps={{ className: ACTIVE_ITEM }}
          >
            <item.icon aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
