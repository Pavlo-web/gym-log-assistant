import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Surface } from "@/components/Surface";
import { Button } from "@/components/ui/button";
import { StorageWriteError } from "@/data";
import { useHasDemoData, useLoadDemoData, useRemoveDemoData } from "@/hooks/useDemoData";

const failureMessage = (cause: unknown, fallback: string): string =>
  cause instanceof StorageWriteError ? cause.message : fallback;

export function LoadDemoDataButton({ className }: { className?: string }) {
  const load = useLoadDemoData();

  const loadDemo = async () => {
    try {
      await load.mutateAsync();
      toast.success("Demo data loaded");
    } catch (cause) {
      toast.error(failureMessage(cause, "Could not load demo data"));
    }
  };

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

export function DemoDataNotice() {
  const { data: hasDemoData } = useHasDemoData();
  const remove = useRemoveDemoData();
  if (!hasDemoData) return null;

  const removeDemo = async () => {
    try {
      await remove.mutateAsync();
      toast.success("Demo data removed");
    } catch (cause) {
      toast.error(failureMessage(cause, "Could not remove demo data"));
    }
  };

  return (
    <Surface
      padding="compact"
      className="mb-6 grid grid-cols-1 items-center gap-2 text-sm md:flex md:justify-between md:gap-4"
    >
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
    </Surface>
  );
}

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
