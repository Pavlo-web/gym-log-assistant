import { format, isValid } from "date-fns";

/**
 * Workout dates are stored as local calendar days in `yyyy-MM-dd` form.
 * They must never go through `new Date(string)` or `toISOString()`, which
 * treat them as UTC and can shift the day in other time zones.
 */
const ISO_DATE_FORMAT = "yyyy-MM-dd";
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Formats a date as a local `yyyy-MM-dd` string. */
export const toIsoDate = (date: Date): string => format(date, ISO_DATE_FORMAT);

/** Today's local date as `yyyy-MM-dd`. */
export const todayLocal = (): string => toIsoDate(new Date());

/** Parses `yyyy-MM-dd` as midnight of that day in the local time zone. */
export const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 2000, (month ?? 1) - 1, day ?? 1);
};

/** True for a well-formed `yyyy-MM-dd` string that names a real calendar day. */
export const isIsoDate = (value: string): boolean => {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = parseLocalDate(value);
  return isValid(date) && toIsoDate(date) === value;
};

const formatter =
  (pattern: string) =>
  (value: string): string =>
    format(parseLocalDate(value), pattern);

/** "5 Oct" */
export const formatDayMonth = formatter("d MMM");
/** "5 Oct 2026" */
export const formatDay = formatter("d MMM yyyy");
/** "Mon, 5 Oct 2026" */
export const formatWeekdayDay = formatter("EEE, d MMM yyyy");
/** "Monday, 5 October 2026" */
export const formatLongDay = formatter("EEEE, d MMMM yyyy");
/** "October 2026" */
export const formatMonth = formatter("MMMM yyyy");

const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** True for a 24-hour `HH:mm` time such as "07:30" or "18:00". */
export const isTimeOfDay = (value: string): boolean => TIME_OF_DAY_PATTERN.test(value);

/** The moment a local `yyyy-MM-dd` day and `HH:mm` time name. */
export const parseLocalDateTime = (date: string, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const moment = parseLocalDate(date);
  moment.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return moment;
};
