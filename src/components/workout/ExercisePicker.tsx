import { useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useExercises } from "@/hooks/useExercises";
import { MUSCLE_GROUPS, type Exercise } from "@/types/domain";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addedIds: Set<string>;
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePicker({ open, onOpenChange, addedIds, onSelect }: Props) {
  const { data: exercises = [], isPending, isError } = useExercises();
  const [search, setSearch] = useState("");
  const mobile = useIsMobile();
  const q = search.trim().toLocaleLowerCase();
  const groups = MUSCLE_GROUPS.map((g) => ({
    group: g,
    items: exercises
      .filter((e) => e.muscleGroup === g && e.name.toLocaleLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);

  const change = (o: boolean) => {
    onOpenChange(o);
    if (!o) setSearch("");
  };
  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={change} shouldScaleBackground={false}>
        <DrawerContent className="mobile-sheet flex flex-col" aria-describedby={undefined}>
          <DrawerHeader>
            <DrawerTitle>Add exercise</DrawerTitle>
          </DrawerHeader>
          <div className="shrink-0 px-4 pb-3">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search exercises"
                placeholder="Search exercises"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
            {isPending ? (
              <p role="status" className="py-8 text-center text-sm text-muted-foreground">
                Loading exercises…
              </p>
            ) : isError ? (
              <p role="alert" className="py-8 text-center text-sm text-muted-foreground">
                Could not load exercises.
              </p>
            ) : groups.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No exercises found.</p>
            ) : (
              groups.map(({ group, items }) => (
                <div key={group}>
                  <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {group}
                  </h3>
                  <ul>
                    {items.map((ex) => {
                      const added = addedIds.has(ex.id);
                      return (
                        <li key={ex.id}>
                          <button
                            type="button"
                            disabled={added}
                            onClick={() => {
                              onSelect(ex);
                              setSearch("");
                            }}
                            className="flex w-full items-center justify-between rounded-md px-2 py-2 min-h-11 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40"
                          >
                            {ex.name}
                            {added && <span className="text-xs text-muted-foreground">Added</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            autoFocus
            aria-label="Search exercises"
            placeholder="Search exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
          {isPending ? (
            <p role="status" className="py-8 text-center text-sm text-muted-foreground">
              Loading exercises…
            </p>
          ) : isError ? (
            <p role="alert" className="py-8 text-center text-sm text-muted-foreground">
              Could not load exercises.
            </p>
          ) : groups.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No exercises found.</p>
          ) : (
            groups.map(({ group, items }) => (
              <div key={group}>
                <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group}
                </h3>
                <ul>
                  {items.map((ex) => {
                    const added = addedIds.has(ex.id);
                    return (
                      <li key={ex.id}>
                        <button
                          type="button"
                          disabled={added}
                          onClick={() => {
                            onSelect(ex);
                            setSearch("");
                          }}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40"
                        >
                          {ex.name}
                          {added && <span className="text-xs text-muted-foreground">Added</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
