import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/", label: "Workout" },
  { to: "/history", label: "History" },
  { to: "/exercises", label: "Exercises" },
  { to: "/progress", label: "Progress" },
  { to: "/calculator", label: "1RM Calculator" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar px-5 py-7 md:flex">
        <Link to="/" className="mb-10 block">
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            Gym<span className="text-primary"> Log</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "rounded-md px-3 py-2 text-sm bg-sidebar-accent text-primary font-medium",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto text-xs text-muted-foreground">Local data · kg</p>
      </aside>

      <div className="flex gap-1 overflow-x-auto border-b border-border bg-sidebar px-4 py-3 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground"
            activeProps={{
              className:
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm bg-sidebar-accent text-primary",
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <main className="md:pl-60">
        <div className="mx-auto w-full max-w-3xl px-6 py-12">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
    </header>
  );
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </>
  );
}
