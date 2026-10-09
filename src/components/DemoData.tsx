import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StorageWriteError } from "@/data";
import { useHasDemoData, useLoadDemoData, useRemoveDemoData } from "@/hooks/useDemoData";

function failureMessage(cause: unknown, fallback: string): string {
  return cause instanceof StorageWriteError ? cause.message : fallback;
}

/** Fills the app with sample workouts, for looking around before logging anything. */
export function LoadDemoDataButton({ className }: { className?: string }) {
  const load = useLoadDemoData();

  async function loadDemo() {
    try {
      await load.mutateAsync();
      toast.success("Demo data loaded");
    } catch (cause) {
      toast.error(failureMessage(cause, "Could not load demo data"));
    }
  }

  return (
    <Button
      variant="outline"
      disabled={load.isPending}
      onClick={() => void loadDemo()}
      className={className}
    >
      <Sparkles /> Load demo data
    </Button>
  );
}

/** Says that sample records are mixed in and offers to remove them; hidden when there are none. */
export function DemoDataNotice() {
  const { data: hasDemoData } = useHasDemoData();
  const remove = useRemoveDemoData();
  if (!hasDemoData) return null;

  async function removeDemo() {
    try {
      await remove.mutateAsync();
      toast.success("Demo data removed");
    } catch (cause) {
      toast.error(failureMessage(cause, "Could not remove demo data"));
    }
  }

  return (
    <div className="mb-6 grid grid-cols-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm md:flex md:justify-between md:gap-4">
      <span className="text-muted-foreground">
        You are looking at demo data. Your own records are kept when you remove it.
      </span>
      <Button
        variant="link"
        disabled={remove.isPending}
        onClick={() => void removeDemo()}
        className="h-auto justify-start p-0 md:justify-end"
      >
        Remove demo data
      </Button>
    </div>
  );
}

/** Quiet offer under a page that already has records; hidden once sample data is loaded. */
export function DemoDataOffer() {
  const { data: hasDemoData, isPending } = useHasDemoData();
  if (isPending || hasDemoData) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pb-2 text-sm text-muted-foreground">
      <span>Want to see the app with three months of training?</span>
      <LoadDemoDataButton />
    </div>
  );
}
