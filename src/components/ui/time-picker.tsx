import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Clock } from "lucide-react";
import { PickerTrigger } from "@/components/ui/picker-trigger";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isTimeOfDay } from "@/lib/date";
import { cn } from "@/lib/utils";

const twoDigits = (value: number): string => String(value).padStart(2, "0");

const HOURS = Array.from({ length: 24 }, (_, hour) => twoDigits(hour));
/** Hour used when a minute is picked before any hour. */
const FALLBACK_HOUR = "12";

/** Minutes on the step, plus the current one when it falls between steps. */
const minuteOptions = (step: number, current: string | undefined): string[] => {
  const options = Array.from({ length: Math.ceil(60 / step) }, (_, index) =>
    twoDigits(index * step),
  );
  if (current && !options.includes(current)) options.push(current);
  return options.sort();
};

interface TimeColumnProps {
  label: string;
  options: string[];
  selected: string | undefined;
  onSelect: (option: string) => void;
}

/** One scrollable list of the picker; options look like calendar days. */
function TimeColumn({ label, options, selected, onSelect }: TimeColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Open with the selected option in the middle of the column.
  useEffect(() => {
    const list = listRef.current;
    const option = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !option) return;
    list.scrollTop = option.offsetTop - list.clientHeight / 2 + option.clientHeight / 2;
    // Runs once, on open: later selections must not move the list under the pointer.
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    const edge = { Home: 0, End: options.length - 1 }[event.key];
    if (move === undefined && edge === undefined) return;
    event.preventDefault();
    const buttons = [...(listRef.current?.querySelectorAll<HTMLElement>("button") ?? [])];
    const current = buttons.indexOf(document.activeElement as HTMLElement);
    const next = edge ?? Math.min(buttons.length - 1, Math.max(0, current + (move ?? 0)));
    buttons[next]?.focus();
  };

  // Tab reaches one option per column; arrows move between the rest.
  const tabStop = selected && options.includes(selected) ? selected : options[0];

  return (
    <div className="flex flex-col">
      <p className="pb-2 text-center text-xs text-muted-foreground">{label}</p>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="relative flex h-56 flex-col gap-0.5 overflow-y-auto px-1"
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={option === selected}
            tabIndex={option === tabStop ? 0 : -1}
            onClick={() => onSelect(option)}
            className={cn(
              "mobile-control tabular flex h-8 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md text-sm transition-colors",
              option === selected
                ? "bg-primary font-medium text-primary-foreground"
                : "hover:bg-hover",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TimePickerProps {
  /** Selected time as 24-hour HH:mm; anything else shows the placeholder. */
  value: string;
  onChange: (value: string) => void;
  /** Gap between the offered minutes. */
  minuteStep?: number;
  id?: string;
  "aria-invalid"?: boolean;
}

/**
 * Button that opens hour and minute columns; the sibling of `DatePicker`.
 * Picking an hour keeps the popover open, picking a minute closes it.
 */
export function TimePicker({
  value,
  onChange,
  minuteStep = 5,
  id,
  "aria-invalid": invalid,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [hour, minute] = isTimeOfDay(value) ? value.split(":") : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger
          id={id}
          icon={Clock}
          value={hour && minute ? value : undefined}
          placeholder="Pick a time"
          aria-invalid={invalid}
        />
      </PopoverTrigger>
      <PopoverContent
        className="flex w-auto gap-1 p-3"
        align="start"
        // Start on the selected hour so the arrow keys work straight away.
        onOpenAutoFocus={(event) => {
          const start = event.currentTarget as HTMLElement | null;
          const option = start?.querySelector<HTMLElement>('[role="option"][tabindex="0"]');
          if (!option) return;
          event.preventDefault();
          option.focus({ preventScroll: true });
        }}
      >
        <TimeColumn
          label="Hour"
          options={HOURS}
          selected={hour}
          onSelect={(next) => onChange(`${next}:${minute ?? "00"}`)}
        />
        <div className="w-px bg-border" aria-hidden="true" />
        <TimeColumn
          label="Min"
          options={minuteOptions(minuteStep, minute)}
          selected={minute}
          onSelect={(next) => {
            onChange(`${hour ?? FALLBACK_HOUR}:${next}`);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
