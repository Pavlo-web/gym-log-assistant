import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDay, isIsoDate, parseLocalDate, toIsoDate } from "@/lib/date";

interface DatePickerProps {
  /** Selected day as yyyy-mm-dd; anything else shows the placeholder. */
  value: string;
  onChange: (value: string) => void;
  /** Latest selectable day as yyyy-mm-dd. */
  max: string;
  id?: string;
}

/** Button that opens a calendar popover; works with local yyyy-mm-dd strings. */
export function DatePicker({ value, onChange, max, id }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = isIsoDate(value) ? parseLocalDate(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="tabular h-9 w-full justify-between border-input bg-transparent px-3 text-base font-normal shadow-sm focus-visible:ring-ring md:text-sm"
        >
          <span>{selected ? formatDay(value) : "Pick a date"}</span>
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          {...(selected ? { defaultMonth: selected } : {})}
          disabled={{ after: parseLocalDate(max) }}
          weekStartsOn={1}
          className="mobile-calendar pointer-events-auto p-3"
          onSelect={(day) => {
            if (!day) return;
            onChange(toIsoDate(day));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
