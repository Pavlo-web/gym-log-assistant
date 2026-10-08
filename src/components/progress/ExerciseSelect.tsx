import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { LoggedExercise } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { MUSCLE_GROUPS } from "@/types/domain";

/** Heading for exercises whose muscle group is unknown (deleted, with no stored group). */
const UNGROUPED = "Other";

interface ExerciseSelectProps {
  options: LoggedExercise[];
  /** Id of the selected exercise. */
  value: string;
  onChange: (id: string) => void;
}

/** Searchable dropdown of exercises, grouped by muscle group. */
export function ExerciseSelect({ options, value, onChange }: ExerciseSelectProps) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.id === value);
  const groups = [...MUSCLE_GROUPS, undefined]
    .map((group) => ({
      group,
      items: options
        .filter((option) => option.group === group)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select exercise"
          className="w-full justify-between md:w-72"
        >
          <span className="min-w-0 truncate">{current?.name ?? "Select exercise"}</span>
          <ChevronsUpDown className="shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search exercises…" />
          <CommandList>
            <CommandEmpty>No exercises found.</CommandEmpty>
            {groups.map(({ group, items }) => (
              <CommandGroup key={group ?? UNGROUPED} heading={group ?? UNGROUPED}>
                {items.map((option) => (
                  <CommandItem
                    key={option.id}
                    // The id keeps same-named exercises distinct in cmdk's search index.
                    value={`${option.name} ${option.id}`}
                    onSelect={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-1", option.id === value ? "opacity-100" : "opacity-0")}
                    />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
