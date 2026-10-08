import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout route for /history: the list, details and edit pages render through the outlet. */
export const Route = createFileRoute("/history")({ component: Outlet });
