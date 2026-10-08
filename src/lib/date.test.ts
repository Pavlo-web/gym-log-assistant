import { describe, expect, it } from "vitest";
import {
  formatDay,
  formatDayMonth,
  formatLongDay,
  formatMonth,
  formatWeekdayDay,
  isIsoDate,
  parseLocalDate,
  toIsoDate,
  todayLocal,
} from "./date";

describe("parseLocalDate", () => {
  it("returns local midnight of the given day", () => {
    const date = parseLocalDate("2026-10-05");
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 5]);
    expect([date.getHours(), date.getMinutes()]).toEqual([0, 0]);
  });

  it("round-trips through toIsoDate without shifting the day", () => {
    for (const value of ["2026-01-01", "2026-03-29", "2026-10-25", "2026-12-31", "2024-02-29"]) {
      expect(toIsoDate(parseLocalDate(value))).toBe(value);
    }
  });
});

describe("toIsoDate", () => {
  it("uses the local calendar day at both ends of the day", () => {
    expect(toIsoDate(new Date(2026, 9, 5, 23, 59))).toBe("2026-10-05");
    expect(toIsoDate(new Date(2026, 9, 5, 0, 1))).toBe("2026-10-05");
  });
});

describe("todayLocal", () => {
  it("is a valid ISO date", () => {
    expect(isIsoDate(todayLocal())).toBe(true);
  });
});

describe("isIsoDate", () => {
  it("accepts real calendar days", () => {
    expect(isIsoDate("2026-10-05")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true);
  });

  it("rejects malformed strings and impossible days", () => {
    expect(isIsoDate("")).toBe(false);
    expect(isIsoDate("2026-10-5")).toBe(false);
    expect(isIsoDate("05.10.2026")).toBe(false);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
  });
});

describe("display formats", () => {
  it("formats a stored date in each style", () => {
    const value = "2026-10-05";
    expect(formatDayMonth(value)).toBe("5 Oct");
    expect(formatDay(value)).toBe("5 Oct 2026");
    expect(formatWeekdayDay(value)).toBe("Mon, 5 Oct 2026");
    expect(formatLongDay(value)).toBe("Monday, 5 October 2026");
    expect(formatMonth(value)).toBe("October 2026");
  });
});
