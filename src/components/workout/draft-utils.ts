import type { DraftSet, WorkoutDraft, WorkoutEntry } from "@/types/domain";

export function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function emptyDraft(): WorkoutDraft {
  return { date: todayLocal(), notes: "", entries: [] };
}

export function isDraftEmpty(d: WorkoutDraft): boolean {
  return d.entries.length === 0 && d.notes.trim() === "" && d.date === todayLocal();
}

export type SetStatus = "empty" | "valid" | "invalid";

export function setError(s: DraftSet): string | null {
  const w = s.weight.trim();
  const r = s.reps.trim();
  if (!w && !r) return null;
  const weight = Number(w);
  const reps = Number(r);
  if (!w || !isFinite(weight) || weight < 0 || weight > 1000) return "Weight must be 0–1000 kg.";
  if (!r || !Number.isInteger(reps) || reps < 1 || reps > 100) return "Reps must be a whole number 1–100.";
  return null;
}

export function setStatus(s: DraftSet): SetStatus {
  if (!s.weight.trim() && !s.reps.trim()) return "empty";
  return setError(s) ? "invalid" : "valid";
}

/** Converts valid sets into domain entries; entries without valid sets are dropped. */
export function toEntries(d: WorkoutDraft): WorkoutEntry[] {
  return d.entries
    .map((e) => ({
      id: e.id,
      exerciseId: e.exerciseId,
      sets: e.sets
        .filter((s) => setStatus(s) === "valid")
        .map((s) => ({ id: s.id, weight: Number(s.weight), reps: Number(s.reps) })),
    }))
    .filter((e) => e.sets.length > 0);
}
