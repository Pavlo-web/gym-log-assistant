const DECIMAL_PATTERN = /^[-+]?(\d+\.?\d*|\.\d+)$/;
const INTEGER_PATTERN = /^[-+]?\d+$/;

// Accepts "." or "," as the decimal separator.
export const parseDecimal = (input: string): number => {
  const text = input.trim().replace(",", ".");
  return DECIMAL_PATTERN.test(text) ? Number(text) : NaN;
};

export const parseInteger = (input: string): number => {
  const text = input.trim();
  return INTEGER_PATTERN.test(text) ? Number(text) : NaN;
};

// "1,234.5"
export const formatNumber = (value: number): string =>
  value.toLocaleString("en-US", { maximumFractionDigits: 1 });

// "116.7", "100"
export const formatFixed = (value: number, digits = 1): string =>
  value.toFixed(digits).replace(/\.0$/, "");

export const sanitizeNumberInput = (text: string, allowDecimal: boolean): string => {
  if (!allowDecimal) return text.replace(/\D/g, "");
  const cleaned = text.replace(/[^\d.,]/g, "");
  const separator = cleaned.search(/[.,]/);
  if (separator === -1) return cleaned;
  const afterSeparator = cleaned.slice(separator + 1).replace(/[.,]/g, "");
  return cleaned.slice(0, separator + 1) + afterSeparator;
};
