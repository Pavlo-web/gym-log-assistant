import { useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useExercises } from "@/hooks/useExercises";
import { cn } from "@/lib/utils";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from "@/types/domain";

interface ExerciseGroup {
  group: MuscleGroup;
  items: Exercise[];
}

/** Exercises matching the search, grouped by muscle group and sorted by name. */
const groupExercises = (exercises: readonly Exercise[], search: string): ExerciseGroup[] => {
  const query = search.trim().toLocaleLowerCase();
  return MUSCLE_GROUPS.map((group) => ({
    group,
    items: exercises
      .filter(
        (exercise) =>
          exercise.muscleGroup === group && exercise.name.toLocaleLowerCase().includes(query),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(({ items }) => items.length > 0);
};

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

function SearchField({ value, onChange, autoFocus = false }: SearchFieldProps) {
  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        autoFocus={autoFocus}
        aria-label="Search exercises"
        placeholder="Search exercises"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-10"
      />
    </div>
  );
}

function ListMessage({ role, children }: { role?: "status" | "alert"; children: string }) {
  return (
    <p role={role} className="py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

interface ExerciseListProps {
  groups: ExerciseGroup[];
  /** Exercises already in the workout; shown as "Added" and not selectable. */
  addedIds: Set<string>;
  onSelect: (exercise: Exercise) => void;
  /** Extra classes for each row, e.g. a taller tap target on phones. */
  rowClassName?: string;
}

function ExerciseList({ groups, addedIds, onSelect, rowClassName }: ExerciseListProps) {
  const { isPending, isError } = useExercises();
  if (isPending) return <ListMessage role="status">Loading exercises…</ListMessage>;
  if (isError) return <ListMessage role="alert">Could not load exercises.</ListMessage>;
  if (groups.length === 0) return <ListMessage>No exercises found.</ListMessage>;

  return groups.map(({ group, items }) => (
    <div key={group}>
      <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {group}
      </h3>
      <ul>
        {items.map((exercise) => {
          const added = addedIds.has(exercise.id);
          return (
            <li key={exercise.id}>
              <button
                type="button"
                disabled={added}
                onClick={() => onSelect(exercise)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40",
                  rowClassName,
                )}
              >
                {exercise.name}
                {added && <span className="text-xs text-muted-foreground">Added</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  ));
}

interface ExercisePickerProps {
  /** Heading of the picker, e.g. "Add exercise" or "Change exercise". */
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addedIds: Set<string>;
  onSelect: (exercise: Exercise) => void;
}

/** Searchable exercise list: a bottom sheet on phones, a dialog on larger screens. */
export function ExercisePicker({
  title,
  open,
  onOpenChange,
  addedIds,
  onSelect,
}: ExercisePickerProps) {
  const { data: exercises = [] } = useExercises();
  const [search, setSearch] = useState("");
  const mobile = useIsMobile();
  const groups = groupExercises(exercises, search);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setSearch("");
  };

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setSearch("");
  };

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange} shouldScaleBackground={false}>
        <DrawerContent className="mobile-sheet flex flex-col" aria-describedby={undefined}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="shrink-0 px-4 pb-3">
            {/* No autofocus: it would open the keyboard over the list. */}
            <SearchField value={search} onChange={setSearch} />
          </div>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
            <ExerciseList
              groups={groups}
              addedIds={addedIds}
              onSelect={handleSelect}
              rowClassName="min-h-11"
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SearchField value={search} onChange={setSearch} autoFocus />
        <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
          <ExerciseList groups={groups} addedIds={addedIds} onSelect={handleSelect} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
