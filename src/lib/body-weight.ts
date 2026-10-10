import { subDays } from "date-fns";
import type { BodyWeightEntry } from "@/types/domain";
import { parseLocalDate, toIsoDate } from "./date";
import { BODY_WEIGHT_MAX_KG, BODY_WEIGHT_MIN_KG } from "./limits";
import { formatNumber, parseDecimal } from "./number";

export const TREND_DAYS = 30;

export interface BodyWeightSummary {
  latest: BodyWeightEntry;
  sincePrevious: number | null;
  // Null when the log does not go back `TREND_DAYS` days.
  overTrend: number | null;
  lowest: number;
  highest: number;
}

export interface BodyWeightRow extends BodyWeightEntry {
  change: number | null;
}

export const chronological = (entries: readonly BodyWeightEntry[]): BodyWeightEntry[] =>
  [...entries].sort((a, b) => a.date.localeCompare(b.date));

export const bodyWeightSummary = (
  entries: readonly BodyWeightEntry[],
): BodyWeightSummary | null => {
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
};

export const bodyWeightRows = (entries: readonly BodyWeightEntry[]): BodyWeightRow[] => {
  const ordered = chronological(entries);
  return ordered
    .map((entry, index) => {
      const previous = ordered[index - 1];
      return { ...entry, change: previous ? entry.weight - previous.weight : null };
    })
    .reverse();
};

export const bodyWeightError = (input: string): string | null => {
  const weight = parseDecimal(input);
  if (!(weight >= BODY_WEIGHT_MIN_KG && weight <= BODY_WEIGHT_MAX_KG)) {
    return `Enter ${BODY_WEIGHT_MIN_KG}–${BODY_WEIGHT_MAX_KG} kg`;
  }
  return null;
};

/** "+0.6 kg", "−1.2 kg" or "±0 kg". */
export const formatWeightChange = (change: number): string => {
  const rounded = Math.round(change * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "±";
  return `${sign}${formatNumber(Math.abs(rounded))} kg`;
};
