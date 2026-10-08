import { subDays } from "date-fns";
import type { BodyWeightEntry } from "@/types/domain";
import { parseLocalDate, toIsoDate } from "./date";
import { BODY_WEIGHT_MAX_KG, BODY_WEIGHT_MIN_KG } from "./limits";
import { formatNumber, parseDecimal } from "./number";

/** Window for the "last 30 days" change. */
export const TREND_DAYS = 30;

export interface BodyWeightSummary {
  latest: BodyWeightEntry;
  /** Difference from the entry before the latest; null with a single entry. */
  sincePrevious: number | null;
  /**
   * Difference from the last entry made at least `TREND_DAYS` days before the
   * latest one; null when the log does not go back that far.
   */
  overTrend: number | null;
  lowest: number;
  highest: number;
}

export interface BodyWeightRow extends BodyWeightEntry {
  /** Difference from the previous (older) entry; null for the first one. */
  change: number | null;
}

/** Entries oldest first: the order a chart needs. */
export function chronological(entries: readonly BodyWeightEntry[]): BodyWeightEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

/** Headline numbers of the log; null when it is empty. */
export function bodyWeightSummary(entries: readonly BodyWeightEntry[]): BodyWeightSummary | null {
  const ordered = chronological(entries);
  const latest = ordered.at(-1);
  if (!latest) return null;

  const previous = ordered.at(-2);
  const trendStart = toIsoDate(subDays(parseLocalDate(latest.date), TREND_DAYS));
  const baseline = ordered.filter((entry) => entry.date <= trendStart).at(-1);
  const weights = ordered.map((entry) => entry.weight);

  return {
    latest,
    sincePrevious: previous ? latest.weight - previous.weight : null,
    overTrend: baseline ? latest.weight - baseline.weight : null,
    lowest: Math.min(...weights),
    highest: Math.max(...weights),
  };
}

/** Entries newest first, each with its change from the entry before it. */
export function bodyWeightRows(entries: readonly BodyWeightEntry[]): BodyWeightRow[] {
  const ordered = chronological(entries);
  return ordered
    .map((entry, index) => {
      const previous = ordered[index - 1];
      return { ...entry, change: previous ? entry.weight - previous.weight : null };
    })
    .reverse();
}

/** Validation message for a typed weight, or null when it is acceptable. */
export function bodyWeightError(input: string): string | null {
  const weight = parseDecimal(input);
  if (!(weight >= BODY_WEIGHT_MIN_KG && weight <= BODY_WEIGHT_MAX_KG)) {
    return `Enter a weight between ${BODY_WEIGHT_MIN_KG} and ${BODY_WEIGHT_MAX_KG} kg.`;
  }
  return null;
}

/** "+0.6 kg", "−1.2 kg" or "±0 kg". */
export function formatWeightChange(change: number): string {
  const rounded = Math.round(change * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "±";
  return `${sign}${formatNumber(Math.abs(rounded))} kg`;
}
