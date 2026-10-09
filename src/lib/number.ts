const DECIMAL_PATTERN = /^[-+]?(\d+\.?\d*|\.\d+)$/;
const INTEGER_PATTERN = /^[-+]?\d+$/;

/** Parses a decimal that may use "." or "," as separator; returns NaN when empty or invalid. */
export function parseDecimal(input: string): number {
  const text = input.trim().replace(",", ".");
  return DECIMAL_PATTERN.test(text) ? Number(text) : NaN;
}

/** Parses a whole number; returns NaN when empty, fractional or invalid. */
export function parseInteger(input: string): number {
  const text = input.trim();
  return INTEGER_PATTERN.test(text) ? Number(text) : NaN;
}

/** Formats a number for display with thousands separators and at most one decimal: "1,234.5". */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

/** Formats with a fixed number of decimals and drops a trailing ".0": "116.7", "100". */
export function formatFixed(value: number, digits = 1): string {
  return value.toFixed(digits).replace(/\.0$/, "");
}

/**
 * Drops everything a number field cannot hold as the user types or pastes:
 * only digits stay, plus a single "." or "," when decimals are allowed.
 */
export function sanitizeNumberInput(text: string, allowDecimal: boolean): string {
  if (!allowDecimal) return text.replace(/\D/g, "");
  const cleaned = text.replace(/[^\d.,]/g, "");
  const separator = cleaned.search(/[.,]/);
  if (separator === -1) return cleaned;
  const afterSeparator = cleaned.slice(separator + 1).replace(/[.,]/g, "");
  return cleaned.slice(0, separator + 1) + afterSeparator;
}
