/** Parses a decimal that may use "." or "," as separator; returns NaN when empty or invalid. */
export function parseDecimal(input: string): number {
  const text = input.trim().replace(",", ".");
  if (text === "" || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(text)) return NaN;
  return Number(text);
}

/** Parses a whole number; returns NaN when empty, fractional or invalid. */
export function parseInteger(input: string): number {
  const text = input.trim();
  return /^[-+]?\d+$/.test(text) ? Number(text) : NaN;
}
