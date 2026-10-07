import { useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePicker({
  value,
  onChange,
  max,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  max: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const date = parse(value, "yyyy-MM-dd", new Date());
  const maximum = parse(max, "yyyy-MM-dd", new Date());
  const selected = isValid(date) && format(date, "yyyy-MM-dd") === value ? date : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="tabular h-9 w-full justify-between border-input bg-transparent px-3 text-base font-normal shadow-sm focus-visible:ring-ring md:text-sm"
        >
          <span>{selected ? format(selected, "d MMM yyyy") : "Pick a date"}</span>
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          {...(selected ? { defaultMonth: selected } : {})}
          disabled={{ after: maximum }}
          weekStartsOn={1}
          className="mobile-calendar pointer-events-auto p-3"
          onSelect={(day) => {
            if (day) {
              onChange(format(day, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
