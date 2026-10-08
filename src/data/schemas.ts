import { z } from "zod";
import { isIsoDate } from "@/lib/date";
import { MUSCLE_GROUPS } from "@/types/domain";

/**
 * Runtime shape checks for data read back from storage. They mirror the types
 * in `src/types/domain.ts` and only guard against damaged or hand-edited
 * records; the forms and repositories enforce the business limits on the way in.
 */

const isoDate = z.string().refine(isIsoDate);
const muscleGroup = z.enum(MUSCLE_GROUPS);
const amount = z.number().finite().nonnegative();

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  muscleGroup,
  isCustom: z.boolean(),
  userId: z.string().optional(),
});

const workoutSetSchema = z.object({
  id: z.string(),
  weight: amount,
  reps: amount,
});

const workoutEntrySchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string().optional(),
  muscleGroup: muscleGroup.optional(),
  sets: z.array(workoutSetSchema),
});

export const workoutSchema = z.object({
  id: z.string(),
  date: isoDate,
  notes: z.string().optional(),
  entries: z.array(workoutEntrySchema),
  userId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const bodyWeightEntrySchema = z.object({
  id: z.string(),
  date: isoDate,
  weight: amount,
});

const draftSetSchema = z.object({
  id: z.string(),
  weight: z.string(),
  reps: z.string(),
});

const draftEntrySchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string().optional(),
  muscleGroup: muscleGroup.optional(),
  sets: z.array(draftSetSchema),
});

/** The draft date is free text on purpose: the form shows its own error for a bad one. */
export const workoutDraftSchema = z.object({
  date: z.string(),
  notes: z.string().catch(""),
  entries: z.array(draftEntrySchema),
});
