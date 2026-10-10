import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { PickerTrigger } from "@/components/ui/picker-trigger";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDay, isIsoDate, parseLocalDate, toIsoDate } from "@/lib/date";

interface DatePickerProps {
  /** Selected day as yyyy-mm-dd; anything else shows the placeholder. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable day as yyyy-mm-dd. */
  min?: string;
  /** Latest selectable day as yyyy-mm-dd. */
  max?: string;
  id?: string;
}

/** Button that opens a calendar popover; works with local yyyy-mm-dd strings. */
export function DatePicker({ value, onChange, min, max, id }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = isIsoDate(value) ? parseLocalDate(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger
          id={id}
          icon={CalendarDays}
          value={selected ? formatDay(value) : undefined}
          placeholder="Pick a date"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          {...(selected ? { defaultMonth: selected } : {})}
          disabled={[
            ...(min ? [{ before: parseLocalDate(min) }] : []),
            ...(max ? [{ after: parseLocalDate(max) }] : []),
          ]}
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
