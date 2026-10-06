import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/types/domain";
import { cn } from "@/lib/utils";

export interface ExerciseOption { id: string; name: string; group?: MuscleGroup }

export function ExerciseSelect({ options, value, onChange }: { options: ExerciseOption[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value);
  const groups = [...MUSCLE_GROUPS, undefined].map((g) => ({ g, items: options.filter((o) => o.group === g).sort((a, b) => a.name.localeCompare(b.name)) })).filter((x) => x.items.length);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} aria-label="Select exercise" className="w-full justify-between md:w-72">
          <span className="min-w-0 truncate">{current?.name ?? "Select exercise"}</span>
          <ChevronsUpDown className="shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search exercises…" />
          <CommandList>
            <CommandEmpty>No exercises found.</CommandEmpty>
            {groups.map(({ g, items }) => (
              <CommandGroup key={g ?? "other"} heading={g ?? "Other"}>
                {items.map((o) => (
                  <CommandItem key={o.id} value={`${o.name} ${o.id}`} onSelect={() => { onChange(o.id); setOpen(false); }}>
                    <Check className={cn("mr-1", o.id === value ? "opacity-100" : "opacity-0")} />
                    {o.name}
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
