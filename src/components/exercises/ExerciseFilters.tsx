import { ChipGroup } from "@/components/ChipGroup";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/types/domain";

export type GroupFilter = MuscleGroup | "All";

const FILTERS = (["All", ...MUSCLE_GROUPS] satisfies GroupFilter[]).map((value) => ({
  value,
  label: value,
}));

interface ExerciseFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  group: GroupFilter;
  onGroupChange: (group: GroupFilter) => void;
}

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
          className="pl-10"
        />
      </div>
      <ChipGroup
        options={FILTERS}
        value={group}
        onChange={onGroupChange}
        aria-label="Filter by muscle group"
        className="max-w-full flex-nowrap overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0"
      />
    </div>
  );
}
