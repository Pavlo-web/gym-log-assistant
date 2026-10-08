import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/types/domain";

export type GroupFilter = MuscleGroup | "All";

const FILTERS: readonly GroupFilter[] = ["All", ...MUSCLE_GROUPS];

interface ExerciseFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  group: GroupFilter;
  onGroupChange: (group: GroupFilter) => void;
}

/** Search field and muscle-group chips above the exercise library. */
export function ExerciseFilters({
  search,
  onSearchChange,
  group,
  onGroupChange,
}: ExerciseFiltersProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search exercises"
          placeholder="Search exercises"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 pl-10"
        />
      </div>
      {/* On phones the chips scroll sideways inside their own row instead of wrapping. */}
      <div
        className="flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0"
        aria-label="Filter by muscle group"
      >
        {FILTERS.map((filter) => (
          <Button
            key={filter}
            size="sm"
            className="shrink-0"
            variant={group === filter ? "default" : "outline"}
            aria-pressed={group === filter}
            onClick={() => onGroupChange(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>
    </div>
  );
}
