import type { ZodType } from "zod";

/** Thrown when a change could not be written, so the UI can tell the user it was not saved. */
export class StorageWriteError extends Error {
  constructor() {
    super("Could not save: this browser's storage is full or turned off.");
    this.name = "StorageWriteError";
  }
}

/** Suffix of the key that keeps the original text of data that failed validation. */
const BACKUP_SUFFIX = ".backup";

/** Keys already reported this session, so a damaged record is logged once, not on every read. */
const reportedKeys = new Set<string>();

/** False during server rendering and when the browser blocks storage (e.g. private mode). */
export const hasStorage = (): boolean => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

export const readItem = (key: string): string | null => {
  if (!hasStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** Writes a value the user asked to save; throws when the browser refuses it. */
export const writeItem = (key: string, value: string): void => {
  if (!hasStorage()) throw new StorageWriteError();
  try {
    window.localStorage.setItem(key, value);
  } catch {
    throw new StorageWriteError();
  }
};

/**
 * Best-effort write for housekeeping the user did not ask for (seeding, migrations,
 * backups). Returns whether it worked; a failure must not break reading.
 */
export const tryWriteItem = (key: string, value: string): boolean => {
  try {
    writeItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const removeItem = (key: string): void => {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to remove if storage is unavailable */
  }
};

/**
 * Keeps the original text of damaged data under a backup key before anything
 * overwrites it, and logs the problem once per session.
 */
const reportDamage = (key: string, raw: string, problem: string): void => {
  if (reportedKeys.has(key)) return;
  reportedKeys.add(key);
  const backedUp = tryWriteItem(key + BACKUP_SUFFIX, raw);
  console.warn(
    `[storage] ${key}: ${problem}.` +
      (backedUp ? ` The original data was copied to ${key}${BACKUP_SUFFIX}.` : ""),
  );
};

const parseJson = (raw: string): { ok: true; value: unknown } | { ok: false } => {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
};

/**
 * Reads a stored list and checks every item against `schema`. Items that fail
 * are skipped, so one damaged record cannot break a whole page; the rest are
 * returned exactly as stored.
 */
export const readList = <T>(key: string, schema: ZodType): T[] => {
  const raw = readItem(key);
  if (!raw) return [];

  const parsed = parseJson(raw);
  if (!parsed.ok || !Array.isArray(parsed.value)) {
    reportDamage(key, raw, "stored data is not a readable list and was ignored");
    return [];
  }

  const items: unknown[] = parsed.value;
  const valid = items.filter((item) => schema.safeParse(item).success);
  const skipped = items.length - valid.length;
  if (skipped > 0) {
    reportDamage(
      key,
      raw,
      `${skipped} damaged ${skipped === 1 ? "record was" : "records were"} skipped`,
    );
  }
  return valid as T[];
};

/** Reads a single stored object; null when it is missing or does not match `schema`. */
export const readObject = <T>(key: string, schema: ZodType): T | null => {
  const raw = readItem(key);
  if (!raw) return null;
  const parsed = parseJson(raw);
  if (!parsed.ok) return null;
  const result = schema.safeParse(parsed.value);
  return result.success ? (result.data as T) : null;
};

export const writeList = <T>(key: string, value: readonly T[]): void => {
  writeItem(key, JSON.stringify(value));
};

export const tryWriteList = <T>(key: string, value: readonly T[]): boolean =>
  tryWriteItem(key, JSON.stringify(value));
