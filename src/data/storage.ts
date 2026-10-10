import type { ZodType } from "zod";

export class StorageWriteError extends Error {
  constructor() {
    super("Could not save: this browser's storage is full or turned off.");
    this.name = "StorageWriteError";
  }
}

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

export const writeItem = (key: string, value: string): void => {
  if (!hasStorage()) throw new StorageWriteError();
  try {
    window.localStorage.setItem(key, value);
  } catch {
    throw new StorageWriteError();
  }
};

// For housekeeping the user did not ask for (seeding, migrations, backups): a failure must not
// break reading.
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

// Backs up damaged data before anything overwrites it and logs the problem once per session.
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

// Items that fail the schema are skipped, so one damaged record cannot break a whole page.
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
